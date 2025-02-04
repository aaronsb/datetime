export interface DateTimeFormat {
  style?: 'full' | 'long' | 'medium' | 'short';
  weekday?: 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
}

export interface DayInfo {
  dayOfWeek: string;
  isWeekend: boolean;
  dayOfMonth: number;
  dayOfYear: number;
  weekNumber: number;
}

export interface DateTimeResult {
  iso: string;
  formatted: string;
  timestamp: number;
  info?: DayInfo;
}

export type TimeUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';

export interface TimerState {
  id: string;
  description?: string;
  startTime: number;
  status: 'running' | 'stopped' | 'deleted';
}

export interface TimerResult {
  id: string;
  description?: string;
  elapsedTime: {
    milliseconds: number;
    formatted: string;
  };
  startTime: string;
  endTime?: string;
  status: 'running' | 'stopped';
}

export interface TimerFormat {
  includeMilliseconds?: boolean;
  style?: 'compact' | 'verbose';
}
