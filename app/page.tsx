'use client';

import VideoUploader from '@/components/VideoUploader';
import VideoPlayer from '@/components/VideoPlayer';
import TranscriptEditor from '@/components/TranscriptEditor';
import { useCallback, useMemo, useState } from 'react';
import {
  APIError,
  TranscriptAPISuccess,
  TranscriptSection,
  TranscriptSegment,
} from '@/types/transcript';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSection[]>([]);

  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);

  const highlights = useMemo(() => {
    return transcript
      .flatMap((section) => section.segments)
      .filter((seg) => highlightIds.has(seg.id));
  }, [highlightIds, transcript]);

  const handleUpload = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setError(null);

    try {
      const newDuration = await getVideoDuration(file);

      const res = await fetch('/api/transcript', {
        method: 'POST',
        body: JSON.stringify({ duration: newDuration }),
      });

      if (!res.ok) {
        const errData: APIError = await res.json();
        setError(errData.error || '未知錯誤');
        return;
      }

      const data: TranscriptAPISuccess = await res.json();
      setTranscript(data.transcript);
      const newHighlights = data.transcript
        .flatMap((section) => section.segments)
        .filter((seg) => seg.highlight);
      setDuration(newDuration);
      setCurrentTime(newHighlights[0]?.start ?? 0);
      setHighlightIds(new Set(newHighlights.map((seg) => seg.id)));
    } catch (error) {
      console.error(error);
      setError('無法取得逐字稿，請檢查後再試');
    }
  }, []);

  const toggleHighlight = useCallback((segId: string) => {
    setHighlightIds((prev) => {
      const next = new Set(prev);
      if (next.has(segId)) {
        next.delete(segId);
      } else {
        next.add(segId);
      }
      return next;
    });
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSegmentChange = useCallback((seg: TranscriptSegment | null) => {
    setCurrentSegmentId(seg ? seg.id : null);
  }, []);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  return (
    <main className="mx-auto flex h-screen max-w-4xl flex-col bg-gray-50 p-4">
      <div className="m-4 rounded-md bg-white p-4 shadow">
        <VideoUploader onUpload={handleUpload} />
        {error && <div className="mt-2 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}
      </div>
      {videoUrl && !error && (
        <div className="flex flex-col overflow-hidden md:flex-row">
          <div className="h-1/2 w-full overflow-y-auto p-4 md:h-full md:w-1/2">
            <TranscriptEditor
              transcript={transcript}
              highlightIds={highlightIds}
              // currentTime={currentTime}
              onToggleHighlight={toggleHighlight}
              onSeek={seekTo}
              currentSegmentId={currentSegmentId}
            />
          </div>
          <div className="flex h-1/2 w-full flex-1 flex-col bg-[#1f2937] p-4 text-white md:h-full">
            <VideoPlayer
              videoUrl={videoUrl}
              highlights={highlights}
              duration={duration}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onSegmentChange={handleSegmentChange}
            />
          </div>
        </div>
      )}
    </main>
  );
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => resolve(video.duration);
    video.src = URL.createObjectURL(file);
  });
}
