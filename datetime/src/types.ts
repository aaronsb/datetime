export interface TimeUnit {
  value: number;
  unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';
}

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
}
