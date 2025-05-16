import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TranscriptSegment } from '@/types/transcript';
import Image from 'next/image';
import { formatTime } from '@/utils/string';

interface VideoPlayerProps {
  videoUrl: string;
  highlights: TranscriptSegment[];
  duration: number;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSegmentChange: (seg: TranscriptSegment | null) => void;
}

export default function VideoPlayer({
  videoUrl,
  highlights,
  duration,
  currentTime,
  onTimeUpdate,
  onSegmentChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentHighlight = useMemo(
    () => highlights.find((seg) => currentTime >= seg.start && currentTime < seg.end),
    [currentTime, highlights]
  );

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seekToPreviousHighlight = useCallback(() => {
    if (!videoRef.current) return;

    const prevHighlight = [...highlights]
      .reverse()
      .find((seg) => seg.end < videoRef.current!.currentTime);

    if (prevHighlight) {
      videoRef.current.currentTime = prevHighlight.start;
    }
  }, [highlights]);

  const seekToNextHighlight = useCallback(() => {
    if (!videoRef.current) return;

    let nextHighlight = highlights.find((seg) => seg.start > videoRef.current!.currentTime);
    if (!nextHighlight) nextHighlight = highlights[0];
    if (nextHighlight) {
      videoRef.current.currentTime = nextHighlight.start;
    }
  }, [highlights]);

  const handleEnded = useCallback(() => {
    if (!videoRef.current || highlights.length === 0) return;
    videoRef.current.currentTime = highlights[0].start;
    videoRef.current.play();
  }, [highlights]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video!.currentTime;
      onTimeUpdate(time);

      const activeSegment = highlights.find((seg) => time >= seg.start && time < seg.end);
      onSegmentChange(activeSegment || null);

      if (!activeSegment) {
        let nextHighlight = highlights.find((seg) => seg.start > time);
        if (!nextHighlight) nextHighlight = highlights[0];
        if (nextHighlight) {
          video!.playbackRate = 1.05;
          video!.currentTime = nextHighlight.start;
        } else {
          video!.pause();
          setIsPlaying(false);
        }
      } else {
        video!.playbackRate = 1.0; // 正常速度
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [highlights, onTimeUpdate, onSegmentChange]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <div className="relative flex h-full flex-col">
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Preview</h2>
      <div className="relative aspect-video max-h-[50vh] overflow-hidden rounded bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          onEnded={handleEnded}
        />
        {currentHighlight && (
          <div className="absolute right-0 bottom-4 left-0 bg-black/40 p-2 text-center text-sm text-white md:text-lg">
            {currentHighlight.text}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 bg-gray-800 py-2">
        <button onClick={seekToPreviousHighlight} className="transition-transform hover:scale-110">
          <Image src="/icons/prev.svg" alt="Prev" width="24" height="24" className="invert" />
        </button>
        <button onClick={togglePlay} className="transition-transform hover:scale-110">
          <Image
            src={isPlaying ? '/icons/pause.svg' : '/icons/play.svg'}
            alt="Play/Pause"
            width="24"
            height="24"
            className="invert"
          />
        </button>
        <button onClick={seekToNextHighlight} className="transition-transform hover:scale-110">
          <Image src="/icons/next.svg" alt="Next" width="24" height="24" className="invert" />
        </button>
        <div className="text-sm text-white">{formatTime(currentTime)}</div>
      </div>

      <div className="relative my-2 h-5 rounded-xs bg-[#374151]">
        {highlights.map((seg) => (
          <div
            key={seg.id}
            className="absolute h-full rounded-xs bg-blue-500"
            style={{
              left: `${(seg.start / duration) * 100}%`,
              width: `${((seg.end - seg.start) / duration) * 100}%`,
            }}
          />
        ))}
        <div
          className="absolute h-full w-0.5 rounded-xs bg-red-500"
          style={{
            left: `${(currentTime / duration) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
