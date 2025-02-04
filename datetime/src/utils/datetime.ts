import { TimeUnit, DateTimeFormat, DayInfo, DateTimeResult } from '../types.js';

export class DateTimeUtils {
  private static getSystemTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  static getCurrentTime(format?: DateTimeFormat): DateTimeResult {
    const now = new Date();
    return this.formatDateTime(now, format);
  }

  static addTime(date: string | Date, timeUnit: TimeUnit): DateTimeResult {
    const baseDate = typeof date === 'string' ? new Date(date) : date;
    const newDate = new Date(baseDate);

    switch (timeUnit.unit) {
      case 'years':
        newDate.setFullYear(newDate.getFullYear() + timeUnit.value);
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + timeUnit.value);
        break;
      case 'days':
        newDate.setDate(newDate.getDate() + timeUnit.value);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + timeUnit.value);
        break;
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + timeUnit.value);
        break;
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + timeUnit.value);
        break;
    }

    return this.formatDateTime(newDate);
  }

  static subtractTime(date: string | Date, timeUnit: TimeUnit): DateTimeResult {
    return this.addTime(date, { ...timeUnit, value: -timeUnit.value });
  }

  static getDayInfo(date: string | Date): DayInfo {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
    const dayOfYear = Math.floor(
      (targetDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );

    const weekNumber = Math.ceil(
      (dayOfYear + startOfYear.getDay() + 1) / 7
    );

    return {
      dayOfWeek: targetDate.toLocaleDateString(undefined, { weekday: 'long' }),
      isWeekend: [0, 6].includes(targetDate.getDay()),
      dayOfMonth: targetDate.getDate(),
      dayOfYear: dayOfYear + 1,
      weekNumber,
    };
  }

  static formatDateTime(date: Date, format?: DateTimeFormat): DateTimeResult {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: this.getSystemTimezone(),
      ...format,
    });

    return {
      iso: date.toISOString(),
      formatted: formatter.format(date),
      timestamp: date.getTime(),
    };
  }

  static validateDate(date: string): boolean {
    const parsed = new Date(date);
    return parsed.toString() !== 'Invalid Date';
  }

  static validateTimeUnit(timeUnit: TimeUnit): boolean {
    const validUnits = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
    return (
      typeof timeUnit.value === 'number' &&
      validUnits.includes(timeUnit.unit)
    );
  }
}
