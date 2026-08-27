import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface DailyCallPanelProps {
  url: string;
}

export function DailyCallPanel({ url }: DailyCallPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  
  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, []);

  const joinCall = () => {
    if (!containerRef.current || !url) return;
    
    // Cleanup any existing frame (just in case)
    if (callFrameRef.current) {
      callFrameRef.current.destroy();
    }

    const frame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "0.5rem",
      },
      showLeaveButton: true,
      showFullscreenButton: true,
    });

    callFrameRef.current = frame;
    frame.join({ url });
    setHasJoined(true);
  };

  return (
    <div className="flex flex-col h-full w-full flex-1">
      {!hasJoined && (
        <div className="flex items-center justify-center flex-1">
          <Button onClick={joinCall} size="lg">
            Join Video Call
          </Button>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`w-full h-full flex-1 ${!hasJoined ? 'hidden' : ''}`} 
      />
    </div>
  );
}
