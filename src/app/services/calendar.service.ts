import { Injectable } from '@angular/core';
import { GregorianDate, Month13Date } from '../models/calendar.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  readonly months13 = [
    'January', 'February', 'March', 'April', 'May', 'June', 'Sol',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly months12 = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  getDaysInMonth(monthIndex: number, is13Month: boolean, year: number): number {
    if (is13Month) {
      return 28;
    } else {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (monthIndex === 1 && this.isLeapYear(year)) return 29;
      return daysInMonth[monthIndex];
    }
  }

  convert13MonthToGregorian(month13: number, day13: number, year: number): GregorianDate {
    const totalDays = (month13 * 28) + (day13 - 1);
    const jan1 = new Date(year, 0, 1);
    const gregorianDate = new Date(jan1);
    gregorianDate.setDate(jan1.getDate() + totalDays);

    return {
      month: gregorianDate.getMonth(),
      day: gregorianDate.getDate(),
      year: gregorianDate.getFullYear()
    };
  }

  convertGregorianTo13Month(month: number, day: number, year: number): Month13Date {
    const jan1 = new Date(year, 0, 1);
    const targetDate = new Date(year, month, day);
    const daysDifference = Math.floor((targetDate.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));

    const month13 = Math.floor(daysDifference / 28);
    const day13 = (daysDifference % 28) + 1;

    return { month: month13, day: day13, year };
  }

  getDateKey(month: number, day: number, year: number, is13Month: boolean, special?: number): string {
    if (special !== undefined) return `special-${special}`;

    if (is13Month) {
      const gregorian = this.convert13MonthToGregorian(month, day, year);
      return `gregorian-${year}-${gregorian.month}-${gregorian.day}`;
    } else {
      return `gregorian-${year}-${month}-${day}`;
    }
  }

  isToday(monthIndex: number, day: number, is13Month: boolean, year: number): boolean {
    const today = new Date();
    if (is13Month) {
      if (today.getFullYear() !== year) return false;
      const jan1 = new Date(year, 0, 1);
      const daysDifference = Math.floor((today.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
      const month13 = Math.floor(daysDifference / 28);
      const day13 = (daysDifference % 28) + 1;
      return month13 === monthIndex && day13 === day;
    } else {
      return today.getFullYear() === year &&
        today.getMonth() === monthIndex &&
        today.getDate() === day;
    }
  }

  getTodayDisplay(is13Month: boolean): string {
    const today = new Date();
    if (is13Month) {
      const jan1 = new Date(today.getFullYear(), 0, 1);
      const daysDifference = Math.floor((today.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
      const month13 = Math.floor(daysDifference / 28);
      const day13 = (daysDifference % 28) + 1;

      const gregorianDate = today.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      if (month13 >= 0 && month13 < 13) {
        return `Today: ${day13} ${this.months13[month13]} ${today.getFullYear()} (${gregorianDate})`;
      } else {
        return `Today: ${gregorianDate}`;
      }
    } else {
      return `Today: ${today.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })}`;
    }
  }

  getFirstDayOfMonth(year: number, monthIndex: number, is13Month: boolean): number {
    if (is13Month) {
      const jan1 = new Date(year, 0, 1);
      return jan1.getDay();
    } else {
      const firstDay = new Date(year, monthIndex, 1);
      return firstDay.getDay();
    }
  }

  getWeekDaysForMonth(year: number, monthIndex: number, is13Month: boolean): string[] {
    const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (is13Month) {
      const jan1Day = new Date(year, 0, 1).getDay();
      const reorderedDays = [];
      for (let i = 0; i < 7; i++) {
        reorderedDays.push(allDays[(jan1Day + i) % 7]);
      }
      return reorderedDays;
    } else {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
  }

  getSpecialDays(year: number): string[] {
    const days = ['New Year\'s Day'];
    if (this.isLeapYear(year)) {
      days.push('Leap Day');
    }
    return days;
  }
}
