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

// --- capture constraints ---------------------------------------------------
//
// Everything here exists because this is a *mesh*: each participant uploads a
// separate copy of every track to every peer. Unconstrained, a 6-person room
// asked ~15 Mbps upstream of each device and simply collapsed. Use ideal/max
// and never `exact` — `exact` throws OverconstrainedError on cheap hardware and
// fails the join outright, which is far worse than a slightly-wrong resolution.

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  // Mono is not cosmetic: it halves Opus's target and stops Chrome negotiating
  // stereo for a headset mic. sampleRate is deliberately left alone —
  // over-constraining it fails on cheap Android mics.
  channelCount: 1,
};

const CAMERA_CONSTRAINTS: MediaTrackConstraints = {
  // Tiles render ~300-400px wide, so capturing 640x480 to display at 320px is
  // pure waste. Camera is the secondary stream here; screen share is the point.
  width: { ideal: 320, max: 640 },
  height: { ideal: 180, max: 360 },
  frameRate: { ideal: 15, max: 20 },
  facingMode: "user",
};

const SCREEN_CONSTRAINTS: MediaTrackConstraints = {
  // Resolution is what we protect; frame rate is what we sacrifice. The content
  // is slides, PDFs and code — identical for seconds at a time. At ~4fps
  // scrolling looks steppy but text stays crisp, and crisp text is the whole
  // point. 720p is where a 14px font survives encoding.
  width: { ideal: 1280, max: 1920 },
  height: { ideal: 720, max: 1080 },
  frameRate: { ideal: 4, max: 8 },
};

// --- bitrate ceilings ------------------------------------------------------
//
// Constraints cap resolution and frame rate but NOT bitrate — without these the
// encoder still spends 1.5+ Mbps on a 720p5 screen share during a scroll burst.
// This is what actually bounds upstream.

const AUDIO_MAX_BITRATE = 32_000;
const SCREEN_MAX_FRAMERATE = 5;
const CAMERA_MAX_FRAMERATE = 15;

/**
 * Per-peer video ceilings, scaled by how many peers we're uploading to. In a
 * mesh each peer connection has its own encoder, so this gives per-recipient
 * control — strictly better than simulcast, which only pays off behind an SFU
 * and would triple encode cost on the low-end laptops we're trying to help.
 */
function screenBitrateFor(peerCount: number): number {
  if (peerCount <= 1) return 800_000;
  if (peerCount === 2) return 500_000;
  if (peerCount === 3) return 350_000;
  return 250_000;
}

function cameraBitrateFor(peerCount: number): number {
  return peerCount <= 2 ? 120_000 : 80_000;
}

/** `contentHint` is honoured more widely than `degradationPreference`. */
function setContentHint(track: MediaStreamTrack | null, hint: string) {
  if (track) (track as MediaStreamTrack & { contentHint: string }).contentHint = hint;
}

/**
 * setParameters is fussy: you must mutate the object returned by
 * getParameters() and hand it back, or Chrome rejects it with
 * InvalidModificationError. Chrome can also return an empty encodings array
 * before the first negotiation, hence the seed.
 */
async function applySenderParams(
  sender: RTCRtpSender | null,
  kind: "audio" | "video",
  peerCount: number,
  isScreen: boolean,
) {
  if (!sender) return;
  try {
    const params = sender.getParameters();
    if (!params.encodings || params.encodings.length === 0) {
      params.encodings = [{}];
    }
    const encoding = params.encodings[0] as RTCRtpEncodingParameters & {
      networkPriority?: string;
    };

    if (kind === "audio") {
      encoding.maxBitrate = AUDIO_MAX_BITRATE;
      // Audio must never degrade — make the bandwidth allocator starve video first.
      encoding.priority = "high";
      encoding.networkPriority = "high";
    } else {
      encoding.maxBitrate = isScreen ? screenBitrateFor(peerCount) : cameraBitrateFor(peerCount);
      encoding.maxFramerate = isScreen ? SCREEN_MAX_FRAMERATE : CAMERA_MAX_FRAMERATE;
      encoding.priority = "low";
      encoding.networkPriority = "low";
      // Scaled-down text is illegible while steppy text is fine, so a screen
      // share drops frames rather than resolution. A face is the opposite.
      (params as RTCRtpSendParameters & { degradationPreference?: string }).degradationPreference =
        isScreen ? "maintain-resolution" : "maintain-framerate";
    }

    await sender.setParameters(params);
  } catch {
    // Non-fatal: an uncapped stream is worse than a capped one, but far better
    // than a call that fails to start because a browser rejected a parameter.
  }
}

/**
 * One peer connection plus the senders we own on it. The senders are tracked
 * explicitly rather than re-found with
 * `getSenders().find((s) => s.track?.kind === "video")` — that idiom silently
 * breaks the moment a sender legitimately holds a null track (camera off),
 * because `s.track?.kind` is then `undefined` and never matches.
 */
interface PeerRecord {
  pc: RTCPeerConnection;
  audioSender: RTCRtpSender;
  videoSender: RTCRtpSender;
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
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

/**
 * Mesh WebRTC over the study-room socket: every participant in the call holds
 * one RTCPeerConnection per peer. Fine for the handful of people a study room
 * holds, given the bitrate ceilings above; a large room would want an SFU.
 *
 * Calls are audio-first by design. Camera is opt-in and off by default, because
 * in a study room the valuable video is someone's slides or code, not faces.
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
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const peersRef = useRef(new Map<string, PeerRecord>());
  // ICE candidates can arrive before the answer sets the remote description;
  // holding them here avoids dropping candidates and stalling the connection.
  const pendingCandidatesRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const inCallRef = useRef(false);
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  const emitMediaState = useCallback(
    (state: {
      inCall: boolean;
      audioEnabled: boolean;
      videoEnabled: boolean;
      screenEnabled: boolean;
    }) => {
      if (!roomId) return;
      socketRef.current?.emit(StudyRoomClientEvent.MEDIA_STATE, { roomId, ...state });
    },
    [roomId, socketRef],
  );

  /** Re-apply ceilings everywhere. Cheap, and the peer count feeds the maths. */
  const applyAllSenderParams = useCallback(() => {
    const peerCount = peersRef.current.size;
    const isScreen = screenStreamRef.current !== null;
    peersRef.current.forEach((record) => {
      void applySenderParams(record.audioSender, "audio", peerCount, isScreen);
      void applySenderParams(record.videoSender, "video", peerCount, isScreen);
    });
  }, []);

  const dropPeer = useCallback((socketId: string) => {
    const record = peersRef.current.get(socketId);
    if (record) {
      record.pc.onicecandidate = null;
      record.pc.ontrack = null;
      record.pc.onconnectionstatechange = null;
      record.pc.close();
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
    (peerSocketId: string): PeerRecord => {
      const existing = peersRef.current.get(peerSocketId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({
        iceServers: resolveIceServers(),
        // One transport for audio+video: a single ICE candidate set and, more
        // importantly, one TURN allocation instead of two — which directly
        // halves consumption of a metered free TURN quota.
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
        iceCandidatePoolSize: 2,
      });

      const audioTrack = localStreamRef.current?.getAudioTracks()[0] ?? null;
      const videoTrack =
        screenStreamRef.current?.getVideoTracks()[0] ??
        localStreamRef.current?.getVideoTracks()[0] ??
        null;

      // Transceivers are declared up front, in a fixed audio-then-video order,
      // even when we have no track to put in them yet. Three reasons:
      //   1. A video transceiver with a null track still creates a video m-line
      //      and a live sender, so turning the camera on or starting a screen
      //      share later is a replaceTrack with NO renegotiation.
      //   2. It must be sendrecv. replaceTrack does not change direction, and
      //      transceivers auto-created by setRemoteDescription come up recvonly,
      //      which would leave that peer permanently unable to send.
      //   3. The answerer matches our pre-created transceivers to the offer's
      //      m-lines by kind and order, so both sides must declare the same order.
      const audioTx = pc.addTransceiver(audioTrack ?? "audio", { direction: "sendrecv" });
      const videoTx = pc.addTransceiver(videoTrack ?? "video", { direction: "sendrecv" });

      const record: PeerRecord = {
        pc,
        audioSender: audioTx.sender,
        videoSender: videoTx.sender,
      };
      peersRef.current.set(peerSocketId, record);

      pc.onicecandidate = (event) => {
        if (!event.candidate || !roomId) return;
        socketRef.current?.emit(StudyRoomClientEvent.SIGNAL, {
          roomId,
          targetSocketId: peerSocketId,
          kind: "ice-candidate",
          data: event.candidate.toJSON(),
        });
      };

      // addTransceiver (unlike addTrack(track, stream)) does not associate a
      // stream, so event.streams is empty and the old `const [stream] =
      // event.streams` would silently never render anything. Build the stream
      // here instead, returning a NEW MediaStream each time so that VideoTile's
      // `el.srcObject !== stream` identity check still fires.
      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const existing = prev[peerSocketId];
          const kept = existing
            ? existing.getTracks().filter((t) => t.id !== event.track.id)
            : [];
          return { ...prev, [peerSocketId]: new MediaStream([...kept, event.track]) };
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          dropPeer(peerSocketId);
        }
      };

      return record;
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

        const { pc } = createPeer(from);
        await pc.setRemoteDescription(
          new RTCSessionDescription(payload.data as RTCSessionDescriptionInit),
        );
        await flushPendingCandidates(from, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit(StudyRoomClientEvent.SIGNAL, {
          roomId,
          targetSocketId: from,
          kind: "answer",
          data: answer,
        });
        // Ceilings only stick once the sender has been negotiated.
        applyAllSenderParams();
        return;
      }

      const record = peersRef.current.get(from);
      if (!record) return;

      if (payload.kind === "answer") {
        await record.pc.setRemoteDescription(
          new RTCSessionDescription(payload.data as RTCSessionDescriptionInit),
        );
        await flushPendingCandidates(from, record.pc);
        applyAllSenderParams();
        return;
      }

      if (payload.kind === "ice-candidate") {
        const candidate = payload.data as RTCIceCandidateInit;
        if (record.pc.remoteDescription) {
          await record.pc.addIceCandidate(candidate).catch(() => undefined);
        } else {
          const queued = pendingCandidatesRef.current.get(from) ?? [];
          queued.push(candidate);
          pendingCandidatesRef.current.set(from, queued);
        }
      }
    };

    const handleMediaState = (payload: MediaStateBroadcastPayload) => {
      // The server echoes our own media state back so it can correct us — the
      // room allows one screen share at a time, and a refused claim arrives as
      // screenEnabled:false about our own socket.
      if (payload.socketId === socket.id) {
        if (!payload.screenEnabled) stopScreenShareRef.current(false);
        return;
      }
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
  }, [
    applyAllSenderParams,
    createPeer,
    dropPeer,
    flushPendingCandidates,
    roomId,
    socketRef,
    connected,
  ]);

  const joinCall = useCallback(async () => {
    if (inCallRef.current || isStarting || !roomId) return;

    setIsStarting(true);
    setMediaError(null);

    // Audio only. Camera is opt-in via toggleVideo, which is what keeps a
    // 4-person room at ~96 kbps upstream instead of megabits.
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
        video: false,
      });
    } catch {
      setIsStarting(false);
      setMediaError("Could not access your microphone. Check browser permissions.");
      return;
    }

    setContentHint(stream.getAudioTracks()[0] ?? null, "speech");

    localStreamRef.current = stream;
    setLocalStream(stream);

    setHasVideoTrack(false);
    setAudioEnabled(true);
    setVideoEnabled(false);

    inCallRef.current = true;
    setInCall(true);
    setIsStarting(false);

    emitMediaState({
      inCall: true,
      audioEnabled: true,
      videoEnabled: false,
      screenEnabled: false,
    });

    // Glare-free rule: whoever joins the call initiates to everyone already in
    // it, so exactly one side of each pair creates the offer. Run them in
    // parallel — serialised, the last peer waited on every earlier round-trip.
    const targets = participantsRef.current.filter((p) => p.inCall);
    await Promise.all(
      targets.map(async (peer) => {
        const { pc } = createPeer(peer.socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit(StudyRoomClientEvent.SIGNAL, {
          roomId,
          targetSocketId: peer.socketId,
          kind: "offer",
          data: offer,
        });
      }),
    );

    applyAllSenderParams();
  }, [applyAllSenderParams, createPeer, emitMediaState, isStarting, roomId, socketRef]);

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
    setVideoEnabled(false);
    setScreenEnabled(false);

    emitMediaState({
      inCall: false,
      audioEnabled: false,
      videoEnabled: false,
      screenEnabled: false,
    });
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

  /**
   * Camera is acquired lazily the first time it's switched on, and genuinely
   * released when switched off — `track.enabled = false` alone keeps the camera
   * light on and still sends black frames at a low but nonzero bitrate.
   */
  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream || !inCallRef.current) return;

    const existing = stream.getVideoTracks()[0];

    if (existing) {
      existing.stop();
      stream.removeTrack(existing);
      setHasVideoTrack(false);
      setVideoEnabled(false);

      // Only hand the senders a null track if the screen share isn't currently
      // occupying them, otherwise turning the camera off would kill the share.
      if (!screenStreamRef.current) {
        peersRef.current.forEach((record) => {
          void record.videoSender.replaceTrack(null).catch(() => undefined);
        });
      }
      emitMediaState({ inCall: true, audioEnabled, videoEnabled: false, screenEnabled });
      return;
    }

    let camStream: MediaStream;
    try {
      camStream = await navigator.mediaDevices.getUserMedia({
        video: CAMERA_CONSTRAINTS,
        audio: false,
      });
    } catch {
      setMediaError("Could not access your camera. Check browser permissions.");
      return;
    }

    const camTrack = camStream.getVideoTracks()[0];
    if (!camTrack) return;
    setContentHint(camTrack, "motion");
    stream.addTrack(camTrack);
    setHasVideoTrack(true);
    setVideoEnabled(true);

    // No renegotiation: the video transceiver already exists on every peer.
    if (!screenStreamRef.current) {
      peersRef.current.forEach((record) => {
        void record.videoSender.replaceTrack(camTrack).catch(() => undefined);
      });
      applyAllSenderParams();
    }

    emitMediaState({ inCall: true, audioEnabled, videoEnabled: true, screenEnabled });
  }, [applyAllSenderParams, audioEnabled, emitMediaState, screenEnabled]);

  /** Put the camera back on the wire (or clear it) after a screen share ends. */
  const restoreCameraTrack = useCallback(() => {
    const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
    peersRef.current.forEach((record) => {
      void record.videoSender.replaceTrack(camTrack).catch(() => undefined);
    });
    applyAllSenderParams();
  }, [applyAllSenderParams]);

  /**
   * `notify: false` is for the case where the *server* told us the share ended
   * (our claim on the room's single presenter slot was refused) — echoing that
   * back would be a pointless round-trip.
   */
  const stopScreenShare = useCallback(
    (notify: boolean) => {
      if (!screenStreamRef.current) return;

      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenEnabled(false);
      restoreCameraTrack();

      if (!notify) return;
      const camOn = (localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false) === true;
      const micOn = localStreamRef.current?.getAudioTracks().some((t) => t.enabled) ?? false;
      emitMediaState({
        inCall: true,
        audioEnabled: micOn,
        videoEnabled: camOn,
        screenEnabled: false,
      });
    },
    [emitMediaState, restoreCameraTrack],
  );
  const stopScreenShareRef = useRef(stopScreenShare);
  stopScreenShareRef.current = stopScreenShare;

  const toggleScreenShare = useCallback(async () => {
    // Note there is no longer a `!localStreamRef.current.getVideoTracks()`
    // style gate: a student who joined with no camera has a video *transceiver*
    // regardless, so screen sharing works for them like anyone else.
    if (!inCallRef.current) return;

    if (screenStreamRef.current) {
      stopScreenShare(true);
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: SCREEN_CONSTRAINTS,
        audio: false,
        // Keeps ScholarBase itself out of the picker, which is what students
        // pick by accident to produce the infinite-mirror effect.
        selfBrowserSurface: "exclude",
        surfaceSwitching: "include",
      } as DisplayMediaStreamOptions);

      const displayTrack = displayStream.getVideoTracks()[0];
      if (!displayTrack) return;

      setContentHint(displayTrack, "text");
      screenStreamRef.current = displayStream;
      setScreenEnabled(true);

      // Fires when the user stops sharing from the browser's own UI rather than
      // our button, which is the common case.
      displayTrack.onended = () => stopScreenShareRef.current(true);

      peersRef.current.forEach((record) => {
        void record.videoSender.replaceTrack(displayTrack).catch(() => undefined);
      });
      // Re-apply after the swap: camera and screen want very different ceilings
      // and degradation preferences, and Chrome does not carry them across a
      // replaceTrack reliably.
      applyAllSenderParams();

      const micOn = localStreamRef.current?.getAudioTracks().some((t) => t.enabled) ?? false;
      emitMediaState({
        inCall: true,
        audioEnabled: micOn,
        videoEnabled,
        screenEnabled: true,
      });
    } catch {
      // User dismissed the OS picker — not an error worth surfacing.
    }
  }, [applyAllSenderParams, emitMediaState, stopScreenShare, videoEnabled]);

  // Never leave the camera light on after navigating away. The Map instance is
  // created once and only mutated, so capturing it here is the same registry
  // the cleanup needs to drain.
  const peers = peersRef.current;
  useEffect(() => {
    return () => {
      peers.forEach((record) => record.pc.close());
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
