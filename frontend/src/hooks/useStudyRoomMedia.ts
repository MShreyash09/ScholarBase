import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  StudyRoomClientEvent,
  StudyRoomServerEvent,
  type MediaStateBroadcastPayload,
  type ParticipantLeftPayload,
  type SignalBroadcastPayload,
  type StudyRoomParticipantDto,
} from "@scholarbase/shared-types";

/**
 * TURN is required whenever a peer sits behind a symmetric NAT; STUN alone is
 * enough for most campus/home networks. Supply VITE_ICE_SERVERS as a JSON
 * RTCIceServer[] to add a TURN server in production.
 */
function resolveIceServers(): RTCIceServer[] {
  const raw = import.meta.env.VITE_ICE_SERVERS;
  if (raw) {
    try {
      return JSON.parse(raw) as RTCIceServer[];
    } catch {
      console.warn("VITE_ICE_SERVERS is not valid JSON; falling back to public STUN");
    }
  }
  return [{ urls: "stun:stun.l.google.com:19302" }];
}

export interface UseStudyRoomMediaResult {
  inCall: boolean;
  isStarting: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenEnabled: boolean;
  hasVideoTrack: boolean;
  mediaError: string | null;
  joinCall: () => Promise<void>;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
}

/**
 * Mesh WebRTC over the study-room socket: every participant in the call holds
 * one RTCPeerConnection per peer. Fine for the handful of people a study room
 * holds; a large room would want an SFU instead.
 */
export function useStudyRoomMedia(
  roomId: string | undefined,
  socketRef: React.MutableRefObject<Socket | null>,
  participants: StudyRoomParticipantDto[],
  connected: boolean,
): UseStudyRoomMediaResult {
  const [inCall, setInCall] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  // ICE candidates can arrive before the answer sets the remote description;
  // holding them here avoids dropping candidates and stalling the connection.
  const pendingCandidatesRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const inCallRef = useRef(false);
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  const emitMediaState = useCallback(
    (state: { inCall: boolean; audioEnabled: boolean; videoEnabled: boolean; screenEnabled: boolean }) => {
      if (!roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.MEDIA_STATE, { roomId, ...state });
    },
    [roomId, socketRef],
  );

  const dropPeer = useCallback((socketId: string) => {
    const pc = peersRef.current.get(socketId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peersRef.current.delete(socketId);
    }
    pendingCandidatesRef.current.delete(socketId);
    setRemoteStreams((prev) => {
      if (!(socketId in prev)) return prev;
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  const createPeer = useCallback(
    (peerSocketId: string): RTCPeerConnection => {
      const existing = peersRef.current.get(peerSocketId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers: resolveIceServers() });
      peersRef.current.set(peerSocketId, pc);

      const streamToUse = screenStreamRef.current || localStreamRef.current;
      streamToUse?.getTracks().forEach((track) => pc.addTrack(track, streamToUse));

      pc.onicecandidate = (event) => {
        if (!event.candidate || !roomId) return;
        socketRef.current?.emit(StudyRoomClientEvent.SIGNAL, {
          roomId,
          targetSocketId: peerSocketId,
          kind: "ice-candidate",
          data: event.candidate.toJSON(),
        });
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          setRemoteStreams((prev) => ({ ...prev, [peerSocketId]: stream }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          dropPeer(peerSocketId);
        }
      };

      return pc;
    },
    [dropPeer, roomId, socketRef],
  );

  const flushPendingCandidates = useCallback(async (socketId: string, pc: RTCPeerConnection) => {
    const queued = pendingCandidatesRef.current.get(socketId);
    if (!queued) return;
    pendingCandidatesRef.current.delete(socketId);
    for (const candidate of queued) {
      await pc.addIceCandidate(candidate).catch(() => undefined);
    }
  }, []);

  // --- signalling ---------------------------------------------------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId) return;

    const handleSignal = async (payload: SignalBroadcastPayload) => {
      const from = payload.fromSocketId;

      if (payload.kind === "offer") {
        // Someone joining the call offers to everyone already in it. Ignore it
        // unless we are actually in the call and have a stream to answer with.
        if (!inCallRef.current) return;

        const pc = createPeer(from);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.data as RTCSessionDescriptionInit));
        await flushPendingCandidates(from, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit(StudyRoomClientEvent.SIGNAL, {
          roomId,
          targetSocketId: from,
          kind: "answer",
          data: answer,
        });
        return;
      }

      const pc = peersRef.current.get(from);
      if (!pc) return;

      if (payload.kind === "answer") {
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload.data as RTCSessionDescriptionInit),
        );
        await flushPendingCandidates(from, pc);
        return;
      }

      if (payload.kind === "ice-candidate") {
        const candidate = payload.data as RTCIceCandidateInit;
        if (pc.remoteDescription) {
          await pc.addIceCandidate(candidate).catch(() => undefined);
        } else {
          const queued = pendingCandidatesRef.current.get(from) ?? [];
          queued.push(candidate);
          pendingCandidatesRef.current.set(from, queued);
        }
      }
    };

    const handleMediaState = (payload: MediaStateBroadcastPayload) => {
      // A peer leaving the call tears its connection down; a peer joining the
      // call will send us an offer, so there is nothing to do on that edge.
      if (!payload.inCall) dropPeer(payload.socketId);
    };

    const handleLeft = (payload: ParticipantLeftPayload) => dropPeer(payload.socketId);

    socket.on(StudyRoomServerEvent.SIGNAL, handleSignal);
    socket.on(StudyRoomServerEvent.MEDIA_STATE, handleMediaState);
    socket.on(StudyRoomServerEvent.PARTICIPANT_LEFT, handleLeft);

    return () => {
      socket.off(StudyRoomServerEvent.SIGNAL, handleSignal);
      socket.off(StudyRoomServerEvent.MEDIA_STATE, handleMediaState);
      socket.off(StudyRoomServerEvent.PARTICIPANT_LEFT, handleLeft);
    };
  }, [createPeer, dropPeer, flushPendingCandidates, roomId, socketRef, connected]);

  const joinCall = useCallback(async () => {
    if (inCallRef.current || isStarting || !roomId) return;

    setIsStarting(true);
    setMediaError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch {
      // No camera, or camera permission denied — try audio-only before failing,
      // so a student without a webcam can still talk.
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setMediaError("No camera available — joined with audio only.");
      } catch {
        setIsStarting(false);
        setMediaError("Could not access your microphone or camera. Check browser permissions.");
        return;
      }
    }

    localStreamRef.current = stream;
    setLocalStream(stream);

    const videoTracks = stream.getVideoTracks();
    setHasVideoTrack(videoTracks.length > 0);
    setAudioEnabled(true);
    setVideoEnabled(videoTracks.length > 0);

    inCallRef.current = true;
    setInCall(true);
    setIsStarting(false);

    emitMediaState({
      inCall: true,
      audioEnabled: true,
      videoEnabled: videoTracks.length > 0,
      screenEnabled: false,
    });

    // Glare-free rule: whoever joins the call initiates to everyone already in
    // it, so exactly one side of each pair creates the offer.
    for (const peer of participantsRef.current.filter((p) => p.inCall)) {
      const pc = createPeer(peer.socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit(StudyRoomClientEvent.SIGNAL, {
        roomId,
        targetSocketId: peer.socketId,
        kind: "offer",
        data: offer,
      });
    }
  }, [createPeer, emitMediaState, isStarting, roomId, socketRef]);

  const leaveCall = useCallback(() => {
    if (!inCallRef.current) return;

    inCallRef.current = false;
    setInCall(false);

    peersRef.current.forEach((_, socketId) => dropPeer(socketId));
    peersRef.current.clear();
    pendingCandidatesRef.current.clear();

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    setLocalStream(null);
    setRemoteStreams({});
    setHasVideoTrack(false);
    setScreenEnabled(false);

    emitMediaState({ inCall: false, audioEnabled: false, videoEnabled: false, screenEnabled: false });
  }, [dropPeer, emitMediaState]);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const next = !stream.getAudioTracks().every((t) => t.enabled);
    stream.getAudioTracks().forEach((track) => (track.enabled = next));
    setAudioEnabled(next);
    // Tracks stay in the connection when muted, so no renegotiation is needed —
    // peers just need the flag to render the muted badge.
    emitMediaState({ inCall: true, audioEnabled: next, videoEnabled, screenEnabled });
  }, [emitMediaState, videoEnabled, screenEnabled]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const tracks = stream.getVideoTracks();
    if (tracks.length === 0) return;

    const next = !tracks.every((t) => t.enabled);
    tracks.forEach((track) => (track.enabled = next));
    setVideoEnabled(next);
    emitMediaState({ inCall: true, audioEnabled, videoEnabled: next, screenEnabled });
  }, [audioEnabled, emitMediaState, screenEnabled]);

  const restoreCameraTrack = useCallback(() => {
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(camTrack).catch(() => undefined);
      });
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (!inCallRef.current || !localStreamRef.current) return;

    if (screenStreamRef.current) {
      // Stop screen share
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenEnabled(false);
      restoreCameraTrack();
      
      // We must get the latest videoEnabled state from localStream to broadcast correctly
      const camTrack = localStreamRef.current.getVideoTracks()[0];
      const isVideoOn = camTrack ? camTrack.enabled : false;
      const isAudioOn = localStreamRef.current.getAudioTracks().some(t => t.enabled);
      
      emitMediaState({ inCall: true, audioEnabled: isAudioOn, videoEnabled: isVideoOn, screenEnabled: false });
    } else {
      // Start screen share
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const displayTrack = displayStream.getVideoTracks()[0];
        if (!displayTrack) return;

        screenStreamRef.current = displayStream;
        setScreenEnabled(true);

        displayTrack.onended = () => {
          screenStreamRef.current = null;
          setScreenEnabled(false);
          restoreCameraTrack();
          
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          const isVideoOn = camTrack ? camTrack.enabled : false;
          const isAudioOn = localStreamRef.current?.getAudioTracks().some(t => t.enabled) ?? false;
          
          emitMediaState({ inCall: true, audioEnabled: isAudioOn, videoEnabled: isVideoOn, screenEnabled: false });
        };

        peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(displayTrack).catch(() => undefined);
        });

        // Use current audioEnabled/videoEnabled for state
        const isAudioOn = localStreamRef.current.getAudioTracks().some(t => t.enabled);
        emitMediaState({ inCall: true, audioEnabled: isAudioOn, videoEnabled: true, screenEnabled: true });
      } catch (e) {
        console.warn("Screen share cancelled", e);
      }
    }
  }, [emitMediaState, restoreCameraTrack]);

  // Never leave the camera light on after navigating away. The Map instance is
  // created once and only mutated, so capturing it here is the same registry
  // the cleanup needs to drain.
  const peers = peersRef.current;
  useEffect(() => {
    return () => {
      peers.forEach((pc) => pc.close());
      peers.clear();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      inCallRef.current = false;
    };
  }, [peers, roomId]);

  return {
    inCall,
    isStarting,
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    screenEnabled,
    hasVideoTrack,
    mediaError,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}
