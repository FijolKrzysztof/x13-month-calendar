import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icons.component';
import { CalendarEvent, SelectedDate } from '../../models/event.model';

@Component({
  selector: 'app-month-grid',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './month-grid.component.html',
  styleUrls: ['./month-grid.component.scss']
})
export class MonthGridComponent {
  @Input() monthIndex!: number;
  @Input() monthName!: string;
  @Input() weekDays!: string[];
  @Input() emptyCells!: number[];
  @Input() days!: number[];
  @Input() selectedDate!: SelectedDate | null;
  @Input() events!: Record<string, CalendarEvent[]>;
  @Input() is13Month!: boolean;
  @Input() currentYear!: number;

  @Output() selectDate = new EventEmitter<{month: number, day: number}>();
  @Output() editEvent = new EventEmitter<CalendarEvent>();

  onSelectDate(day: number) {
    this.selectDate.emit({ month: this.monthIndex, day });
  }

  onEditEvent(event: CalendarEvent, $event: Event) {
    $event.stopPropagation();
    this.editEvent.emit(event);
  }

  getMonthHeaderClass(): string {
    let baseClass = "px-4 py-3 text-center font-semibold text-sm border-b border-gray-200 ";
    if (this.monthIndex === 6 && this.is13Month) {
      return baseClass + "bg-slate-900 text-white";
    } else {
      return baseClass + "bg-gray-50 text-gray-900";
    }
  }

  getDayClass(day: number): string {
    const isSelected = this.selectedDate &&
      this.selectedDate.month === this.monthIndex &&
      this.selectedDate.day === day &&
      !this.selectedDate.special;
    const isTodayDay = this.isToday(day);
    const dayEvents = this.getDayEvents(day);

    let className = "bg-white border border-gray-100 p-2 cursor-pointer transition-all duration-150 hover:bg-gray-50 min-h-16 calendar-day";

    if (isSelected) {
      className += " bg-blue-50 border-blue-200 shadow-sm";
    } else if (isTodayDay) {
      className += " bg-amber-50 border-amber-200 shadow-sm";
    } else if (dayEvents.length > 0) {
      className += " bg-green-50 border-green-200";
    }

    return className;
  }

  getDayNumberClass(day: number): string {
    const isTodayDay = this.isToday(day);
    return `flex items-center justify-between mb-1 ${isTodayDay ? 'text-amber-700 font-semibold' : 'text-gray-700'}`;
  }

  isToday(day: number): boolean {
    const today = new Date();
    if (this.is13Month) {
      if (today.getFullYear() !== this.currentYear) return false;
      const jan1 = new Date(this.currentYear, 0, 1);
      const daysDifference = Math.floor((today.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
      const month13 = Math.floor(daysDifference / 28);
      const day13 = (daysDifference % 28) + 1;
      return month13 === this.monthIndex && day13 === day;
    } else {
      return today.getFullYear() === this.currentYear &&
        today.getMonth() === this.monthIndex &&
        today.getDate() === day;
    }
  }

  getDayEvents(day: number): CalendarEvent[] {
    const dateKey = this.getDateKey(day);
    return this.events[dateKey] || [];
  }

  private getDateKey(day: number): string {
    if (this.is13Month) {
      // Convert 13-month to Gregorian for storage
      const totalDays = (this.monthIndex * 28) + (day - 1);
      const jan1 = new Date(this.currentYear, 0, 1);
      const gregorianDate = new Date(jan1);
      gregorianDate.setDate(jan1.getDate() + totalDays);

      return `gregorian-${this.currentYear}-${gregorianDate.getMonth()}-${gregorianDate.getDate()}`;
    } else {
      return `gregorian-${this.currentYear}-${this.monthIndex}-${day}`;
    }
  }
}
