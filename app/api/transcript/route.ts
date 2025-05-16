import { TranscriptAPIResponse, TranscriptSection } from '@/types/transcript';
import { isNumber } from '@/utils/number';
import { NextResponse } from 'next/server';

const MESSAGE_DURATION = 5;
const MOCK_INTERVAL = 15;

export async function POST(req: Request): Promise<NextResponse<TranscriptAPIResponse>> {
  const { duration } = await req.json();

  if (!isNumber(duration)) {
    return NextResponse.json({ error: 'Duration Error' }, { status: 400 });
  }
  if (duration < MESSAGE_DURATION * 4) {
    return NextResponse.json({ error: 'This video is too short.' }, { status: 400 });
  }
  const transcript = generateMockTranscript(duration);
  return NextResponse.json({ transcript });
}

function generateMockTranscript(duration: number): TranscriptSection[] {
  if (duration < MESSAGE_DURATION * 6) {
    const tempGap = (duration - MESSAGE_DURATION * 2) / 3;
    return [
      {
        title: 'Introduction',
        segments: [
          {
            id: 'seg-0-0',
            start: 0,
            end: MESSAGE_DURATION,
            text: 'Welcome to our product demonstration',
            highlight: false,
          },
        ],
      },
      {
        title: 'Key Features',
        segments: [
          {
            id: 'seg-1-0',
            start: MESSAGE_DURATION + tempGap,
            end: MESSAGE_DURATION * 2 + tempGap,
            text: 'Our product has these main features.',
            highlight: true,
          },
        ],
      },
      {
        title: 'Demonstration',
        segments: [
          {
            id: 'seg-2-0',
            start: MESSAGE_DURATION * 2 + tempGap * 2,
            end: MESSAGE_DURATION * 3 + tempGap * 2,
            text: 'Let me show you how it works.',
            highlight: true,
          },
        ],
      },
      {
        title: 'Conclusion',
        segments: [
          {
            id: 'seg-3-0',
            start: duration - MESSAGE_DURATION,
            end: duration,
            text: 'Thank you for your attention.',
            highlight: false,
          },
        ],
      },
    ];
  }

  const segmentsCount = Math.ceil((duration - MESSAGE_DURATION * 6) / 2 / MOCK_INTERVAL);
  const mockResult: TranscriptSection[] = [
    {
      title: 'Introduction',
      segments: [
        {
          id: 'seg-0-0',
          start: 0,
          end: MESSAGE_DURATION,
          text: 'Welcome to our product demonstration',
          highlight: false,
        },
        {
          id: 'seg-0-1',
          start: MESSAGE_DURATION,
          end: MESSAGE_DURATION * 2,
          text: "Today, we'll be showcasing our latest innovation.",
          highlight: true,
        },
      ],
    },
    {
      title: 'Key Features',
      segments: Array.from(Array(segmentsCount)).map((_, i) => ({
        id: `seg-1-${i}`,
        start: MESSAGE_DURATION * 2 + i * MOCK_INTERVAL,
        end: MESSAGE_DURATION * 3 + (i + 1) * MOCK_INTERVAL,
        text: `This is feature part ${i + 1}`,
        highlight: Math.random() < 0.5,
      })),
    },
    {
      title: 'Demonstration',
      segments: Array.from(Array(segmentsCount)).map((_, i) => ({
        id: `seg-2-${i}`,
        start: MESSAGE_DURATION * 2 + (segmentsCount + i) * MOCK_INTERVAL,
        end: MESSAGE_DURATION * 3 + (segmentsCount + i + 1) * MOCK_INTERVAL,
        text: `This is demonstration part ${i + 1}`,
        highlight: Math.random() < 0.5,
      })),
    },
    {
      title: 'Conclusion',
      segments: [
        {
          id: 'seg-3-0',
          start: duration - MESSAGE_DURATION * 3,
          end: duration - MESSAGE_DURATION * 2,
          text: 'In conclusion, our product is a game-changer.',
          highlight: false,
        },
        {
          id: 'seg-3-1',
          start: duration - MESSAGE_DURATION * 2,
          end: duration - MESSAGE_DURATION,
          text: "We're excited to bring this to market.",
          highlight: true,
        },
        {
          id: 'seg-3-2',
          start: duration - MESSAGE_DURATION,
          end: duration,
          text: 'Thank you for your attention.',
          highlight: false,
        },
      ],
    },
  ];

  return mockResult;
}
