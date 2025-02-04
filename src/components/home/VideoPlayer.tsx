import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoUrl?: string;
}

export const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
      {videoUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          autoPlay
          loop
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No video selected
        </div>
      )}
    </div>
  );
};