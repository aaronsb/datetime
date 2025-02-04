import { DateTimeUtils } from '../../../src/utils/datetime.js';
import mockFs from 'mock-fs';
import { TimeUnit } from '../../../src/types.js';

describe('DateTimeUtils', () => {
  const testDate = new Date('2025-02-04T15:30:45.000Z');
  const testTimezone = 'America/New_York';

  beforeEach(() => {
    // Mock the file system before each test
    mockFs({
      'timer-state.json': JSON.stringify({})
    });
  });

  afterEach(() => {
    // Restore the real file system after each test
    mockFs.restore();
  });

  describe('getTime', () => {
    it('should return current time when no date provided', () => {
      const result = DateTimeUtils.getTime({});
      expect(result.iso).toBeDefined();
      expect(result.formatted).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should format time with specified timezone', () => {
      const result = DateTimeUtils.getTime({
        date: testDate.toISOString(),
        timezone: testTimezone,
        format: {
          style: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }
      });
      // 15:30 UTC -> 10:30 EST
      expect(result.formatted).toBe('10:30 AM');
    });

    it('should format date with different styles', () => {
      const result = DateTimeUtils.getTime({
        date: testDate.toISOString(),
        format: {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      });
      expect(result.formatted).toBe('Tuesday, February 4, 2025');
    });

    it('should include day info when requested', () => {
      const result = DateTimeUtils.getTime({
        date: testDate.toISOString(),
        info: true
      });
      expect(result.info).toBeDefined();
      expect(result.info?.dayOfWeek).toBe('Tuesday');
      expect(result.info?.isWeekend).toBe(false);
      expect(result.info?.dayOfMonth).toBe(4);
      expect(result.info?.dayOfYear).toBeGreaterThan(0);
      expect(result.info?.weekNumber).toBeGreaterThan(0);
    });

    it('should handle weekend days correctly', () => {
      const weekendDate = new Date('2025-02-01T12:00:00.000Z'); // Saturday
      const result = DateTimeUtils.getTime({
        date: weekendDate.toISOString(),
        info: true
      });
      expect(result.info?.isWeekend).toBe(true);
      expect(result.info?.dayOfWeek).toBe('Saturday');
    });

    it('should throw error for invalid date', () => {
      expect(() => {
        DateTimeUtils.getTime({ date: 'invalid-date' });
      }).toThrow('Invalid date format');
    });
  });

  describe('calculateTime', () => {
    it('should add time units correctly', () => {
      const result = DateTimeUtils.calculateTime({
        date: testDate.toISOString(),
        operation: 'add',
        amount: 1,
        unit: 'hours' as TimeUnit
      });
      expect(new Date(result.iso).getUTCHours()).toBe(16); // 15 + 1
    });

    it('should subtract time units correctly', () => {
      const result = DateTimeUtils.calculateTime({
        date: testDate.toISOString(),
        operation: 'subtract',
        amount: 30,
        unit: 'minutes' as TimeUnit
      });
      expect(new Date(result.iso).getUTCMinutes()).toBe(0); // 30 - 30
    });

    it('should handle timezone conversions', () => {
      const result = DateTimeUtils.calculateTime({
        date: testDate.toISOString(),
        operation: 'add',
        amount: 1,
        unit: 'days' as TimeUnit,
        timezone: testTimezone,
        format: {
          month: 'long',
          day: 'numeric'
        }
      });
      expect(result.formatted).toBe('February 5');
    });

    it('should handle month transitions', () => {
      const endOfMonth = new Date('2025-01-31T12:00:00.000Z');
      const result = DateTimeUtils.calculateTime({
        date: endOfMonth.toISOString(),
        operation: 'add',
        amount: 1,
        unit: 'days' as TimeUnit,
        format: {
          month: 'long',
          day: 'numeric'
        }
      });
      expect(result.formatted).toBe('February 1');
    });

    it('should handle year transitions', () => {
      const endOfYear = new Date('2025-12-31T12:00:00.000Z');
      const result = DateTimeUtils.calculateTime({
        date: endOfYear.toISOString(),
        operation: 'add',
        amount: 1,
        unit: 'days' as TimeUnit,
        format: {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      });
      expect(result.formatted).toBe('January 1, 2026');
    });
  });

  describe('timer', () => {
    it('should start a new timer', async () => {
      const result = await DateTimeUtils.handleTimer({
        action: 'start',
        id: 'test-timer',
        description: 'Test timer'
      });
      expect(result.status).toBe('running');
      expect(result.id).toBe('test-timer');
      expect(result.description).toBe('Test timer');
    });

    it('should stop a running timer', async () => {
      // Start timer
      await DateTimeUtils.handleTimer({
        action: 'start',
        id: 'test-timer'
      });

      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 100));

      // Stop timer
      const result = await DateTimeUtils.handleTimer({
        action: 'stop',
        id: 'test-timer'
      });
      expect(result.status).toBe('stopped');
      expect(result.elapsedTime.milliseconds).toBeGreaterThan(0);
    });

    it('should format elapsed time correctly in compact style', async () => {
      // Start timer
      await DateTimeUtils.handleTimer({
        action: 'start',
        id: 'test-timer'
      });

      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Stop timer with compact formatting
      const result = await DateTimeUtils.handleTimer({
        action: 'stop',
        id: 'test-timer',
        format: { style: 'compact' }
      });
      expect(result.elapsedTime.formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should format elapsed time correctly in verbose style', async () => {
      // Start timer
      await DateTimeUtils.handleTimer({
        action: 'start',
        id: 'test-timer'
      });

      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Stop timer with verbose formatting
      const result = await DateTimeUtils.handleTimer({
        action: 'stop',
        id: 'test-timer',
        format: { style: 'verbose' }
      });
      expect(result.elapsedTime.formatted).toMatch(/second/);
    });

    it('should handle timer deletion', async () => {
      // Start timer
      await DateTimeUtils.handleTimer({
        action: 'start',
        id: 'test-timer'
      });

      // Delete timer
      const result = await DateTimeUtils.handleTimer({
        action: 'delete',
        id: 'test-timer'
      });
      expect(result.status).toBe('stopped');
      expect(result.elapsedTime.milliseconds).toBe(0);
    });

    it('should handle stopping non-existent timer', async () => {
      await expect(DateTimeUtils.handleTimer({
        action: 'stop',
        id: 'non-existent'
      })).rejects.toThrow('No running timer found');
    });

    it('should handle deleting non-existent timer', async () => {
      await expect(DateTimeUtils.handleTimer({
        action: 'delete',
        id: 'non-existent'
      })).rejects.toThrow('No timer found');
    });

    it('should handle multiple concurrent timers', async () => {
      // Start first timer
      await DateTimeUtils.handleTimer({
        action: 'start',
        id: 'timer1',
        description: 'First timer'
      });

      // Start second timer
      await DateTimeUtils.handleTimer({
        action: 'start',
        id: 'timer2',
        description: 'Second timer'
      });

      // Stop first timer
      const result1 = await DateTimeUtils.handleTimer({
        action: 'stop',
        id: 'timer1'
      });

      // Stop second timer
      const result2 = await DateTimeUtils.handleTimer({
        action: 'stop',
        id: 'timer2'
      });

      expect(result1.id).toBe('timer1');
      expect(result2.id).toBe('timer2');
      expect(result1.status).toBe('stopped');
      expect(result2.status).toBe('stopped');
    });
  });
});
