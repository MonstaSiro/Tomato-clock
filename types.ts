export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface TimerConfig {
  mode: TimerMode;
  duration: number; // in seconds
  label: string;
  color: string;
  description: string;
}

export interface GeminiResponse {
  content: string;
}
