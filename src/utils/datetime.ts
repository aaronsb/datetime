import { promises as fs } from 'fs';
import path from 'path';
import {
  TimeUnit,
  DateTimeFormat,
  DayInfo,
  DateTimeResult,
  TimerState,
  TimerResult,
  TimerFormat
} from '../types.js';

const TIMER_STATE_FILE = path.join(process.cwd(), 'timer-state.json');

export class DateTimeUtils {
  private static getSystemTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  static formatDateTime(date: Date, format?: DateTimeFormat, timezone?: string): DateTimeResult {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone || this.getSystemTimezone(),
      ...format,
    });

    return {
      iso: date.toISOString(),
      formatted: formatter.format(date),
      timestamp: date.getTime(),
    };
  }

  static getDayInfo(date: Date): DayInfo {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor(
      (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );

    const weekNumber = Math.ceil(
      (dayOfYear + startOfYear.getDay() + 1) / 7
    );

    return {
      dayOfWeek: date.toLocaleDateString(undefined, { weekday: 'long' }),
      isWeekend: [0, 6].includes(date.getDay()),
      dayOfMonth: date.getDate(),
      dayOfYear: dayOfYear + 1,
      weekNumber,
    };
  }

  static getTime(params: {
    timezone?: string;
    date?: string;
    format?: DateTimeFormat;
    info?: boolean;
  }): DateTimeResult {
    const date = params.date ? new Date(params.date) : new Date();
    if (date.toString() === 'Invalid Date') {
      throw new Error('Invalid date format');
    }

    const result = this.formatDateTime(date, params.format, params.timezone);
    if (params.info) {
      result.info = this.getDayInfo(date);
    }

    return result;
  }

  static calculateTime(params: {
    date: string;
    operation: 'add' | 'subtract';
    amount: number;
    unit: TimeUnit;
    timezone?: string;
    format?: DateTimeFormat;
  }): DateTimeResult {
    const baseDate = new Date(params.date);
    if (baseDate.toString() === 'Invalid Date') {
      throw new Error('Invalid date format');
    }

    const value = params.operation === 'add' ? params.amount : -params.amount;
    const newDate = new Date(baseDate);

    switch (params.unit) {
      case 'years':
        newDate.setFullYear(newDate.getFullYear() + value);
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + value);
        break;
      case 'days':
        newDate.setDate(newDate.getDate() + value);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + value);
        break;
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + value);
        break;
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + value);
        break;
    }

    return this.formatDateTime(newDate, params.format, params.timezone);
  }

  private static formatElapsedTime(milliseconds: number, format?: TimerFormat): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    if (format?.style === 'verbose') {
      const parts = [];
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      if (format.includeMilliseconds && ms > 0) parts.push(`${ms} millisecond${ms !== 1 ? 's' : ''}`);
      return parts.join(', ') || '0 seconds';
    }

    const parts = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ];
    if (format?.includeMilliseconds) {
      parts.push(ms.toString().padStart(3, '0'));
    }
    return parts.join(':');
  }

  private static async readTimerState(): Promise<Record<string, TimerState>> {
    try {
      const data = await fs.readFile(TIMER_STATE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private static async writeTimerState(state: Record<string, TimerState>): Promise<void> {
    await fs.writeFile(TIMER_STATE_FILE, JSON.stringify(state, null, 2));
  }

  static async handleTimer(params: {
    action: 'start' | 'stop' | 'delete';
    id?: string;
    description?: string;
    format?: TimerFormat;
  }): Promise<TimerResult> {
    const timerId = params.id || 'default';
    const state = await this.readTimerState();

    if (params.action === 'delete') {
      const timer = state[timerId];
      if (!timer) {
        throw new Error(`No timer found with id: ${timerId}`);
      }

      timer.status = 'deleted';
      delete state[timerId];
      await this.writeTimerState(state);

      return {
        id: timerId,
        description: timer.description,
        elapsedTime: {
          milliseconds: 0,
          formatted: this.formatElapsedTime(0, params.format)
        },
        startTime: new Date(timer.startTime).toISOString(),
        status: 'stopped'
      };
    } else if (params.action === 'start') {
      // Always reset on start
      state[timerId] = {
        id: timerId,
        description: params.description,
        startTime: Date.now(),
        status: 'running'
      };
      await this.writeTimerState(state);

      return {
        id: timerId,
        description: params.description,
        elapsedTime: {
          milliseconds: 0,
          formatted: this.formatElapsedTime(0, params.format)
        },
        startTime: new Date(state[timerId].startTime).toISOString(),
        status: 'running'
      };
    } else {
      const timer = state[timerId];
      if (!timer || timer.status !== 'running') {
        throw new Error(`No running timer found with id: ${timerId}`);
      }

      const endTime = Date.now();
      const elapsedTime = endTime - timer.startTime;

      timer.status = 'stopped';
      await this.writeTimerState(state);

      return {
        id: timerId,
        description: timer.description,
        elapsedTime: {
          milliseconds: elapsedTime,
          formatted: this.formatElapsedTime(elapsedTime, params.format)
        },
        startTime: new Date(timer.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        status: 'stopped'
      };
    }
  }
}
