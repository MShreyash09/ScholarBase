import type { StudyRoomParticipantDto } from "@scholarbase/shared-types";
import { Button } from "@/components/ui/button";
import type { UseStudyRoomMediaResult } from "@/hooks/useStudyRoomMedia";
import { VideoTile } from "./VideoTile";

interface CallPanelProps {
  media: UseStudyRoomMediaResult;
  self: StudyRoomParticipantDto | null;
  participants: StudyRoomParticipantDto[];
  disabled: boolean;
}

export function CallPanel({ media, self, participants, disabled }: CallPanelProps) {
  const {
    inCall,
    isStarting,
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    hasVideoTrack,
    mediaError,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
  } = media;

  const peersInCall = participants.filter((p) => p.inCall);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-neutral-800">Audio &amp; video</h2>
          <p className="text-xs text-neutral-500">
            {inCall
              ? `${peersInCall.length} other participant${peersInCall.length === 1 ? "" : "s"} on the call`
              : peersInCall.length > 0
                ? `${peersInCall.length} participant${peersInCall.length === 1 ? " is" : "s are"} on a call`
                : "Nobody is on the call yet"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {inCall ? (
            <>
              <Button variant="outline" size="sm" onClick={toggleAudio}>
                {audioEnabled ? "Mute" : "Unmute"}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleVideo} disabled={!hasVideoTrack}>
                {videoEnabled ? "Turn camera off" : "Turn camera on"}
              </Button>
              <Button variant="secondary" size="sm" onClick={leaveCall}>
                Leave call
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={joinCall} disabled={disabled || isStarting}>
              {isStarting ? "Starting..." : "Join audio & video"}
            </Button>
          )}
        </div>
      </div>

      {mediaError && <p className="text-xs text-amber-700">{mediaError}</p>}

      {inCall && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <VideoTile
            stream={localStream}
            label={self?.fullName ?? "You"}
            isSelf
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
          />
          {peersInCall.map((peer) => (
            <VideoTile
              key={peer.socketId}
              stream={remoteStreams[peer.socketId] ?? null}
              label={peer.fullName}
              audioEnabled={peer.audioEnabled}
              videoEnabled={peer.videoEnabled && Boolean(remoteStreams[peer.socketId])}
            />
          ))}
        </div>
      )}
    </div>
  );
}
