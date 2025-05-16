export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  highlight: boolean;
}

export interface TranscriptSection {
  title: string;
  segments: TranscriptSegment[];
}

export interface APIError {
  error: string;
}

export interface TranscriptAPISuccess {
  transcript: TranscriptSection[];
}

export type TranscriptAPIResponse = APIError | TranscriptAPISuccess;
