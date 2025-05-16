import { useCallback, useEffect, useRef } from 'react';
import { TranscriptSection } from '@/types/transcript';
import { formatTime } from '@/utils/string';
import clsx from 'clsx';

interface TranscriptEditorProps {
  transcript: TranscriptSection[];
  highlightIds: Set<string>;
  currentSegmentId: string | null;
  onToggleHighlight: (segId: string) => void;
  onSeek: (time: number) => void;
}

export default function TranscriptEditor({
  transcript,
  highlightIds,
  currentSegmentId,
  onToggleHighlight,
  onSeek,
}: TranscriptEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSeek = useCallback(
    (time: number) => (e: React.MouseEvent<HTMLSpanElement>) => {
      onSeek(time);
      e.stopPropagation();
    },
    [onSeek]
  );

  useEffect(() => {
    console.log(currentSegmentId);
    if (currentSegmentId) {
      const el = document.getElementById(currentSegmentId);
      console.log(currentSegmentId, el);
      if (el && containerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSegmentId]);

  return (
    <div ref={containerRef} className="h-full space-y-4 overflow-y-auto">
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Transcript</h2>
      {transcript.map((section, sectionIdx) => (
        <div key={sectionIdx}>
          <h3 className="text-lg font-bold md:text-xl">{section.title}</h3>
          <div className="flex flex-col gap-2">
            {section.segments.map((seg) => {
              const highlighted = highlightIds.has(seg.id);
              return (
                <div
                  key={seg.id}
                  id={seg.id}
                  className={clsx(
                    'flex cursor-pointer items-center rounded p-2 text-sm md:text-base',
                    highlighted ? 'bg-blue-500 text-white' : 'bg-white text-black shadow',
                    seg.id === currentSegmentId ? 'active border-2 border-yellow-400' : ''
                  )}
                  onClick={() => onToggleHighlight(seg.id)}
                >
                  <span
                    className={clsx(
                      'min-w-[50px] shrink-0 text-xs text-blue-500 md:text-sm',
                      highlighted ? 'text-white' : 'text-blue-500'
                    )}
                    onClick={handleSeek(seg.start)}
                  >
                    {formatTime(seg.start)}
                  </span>
                  <span className="truncate">{seg.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
