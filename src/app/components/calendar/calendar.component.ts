import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthGridComponent } from '../month-grid/month-grid.component';
import { IconComponent } from '../icons.component';
import { CalendarEvent, SelectedDate } from '../../models/event.model';
import { CalendarService } from '../../services/calendar.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MonthGridComponent, IconComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  @Input() is13Month!: boolean;
  @Input() currentYear!: number;
  @Input() selectedDate!: SelectedDate | null;

  @Output() selectDate = new EventEmitter<SelectedDate>();
  @Output() editEvent = new EventEmitter<CalendarEvent>();

  constructor(
    private calendarService: CalendarService,
    private eventService: EventService
  ) {}

  getMonthsArray(): number[] {
    const monthCount = this.is13Month ? 13 : 12;
    return Array.from({ length: monthCount }, (_, i) => i);
  }

  getSpecialDays(): string[] {
    return this.calendarService.getSpecialDays(this.currentYear);
  }

  getMonthName(monthIndex: number): string {
    return this.is13Month
      ? this.calendarService.months13[monthIndex]
      : this.calendarService.months12[monthIndex];
  }

  getWeekDays(monthIndex: number): string[] {
    return this.calendarService.getWeekDaysForMonth(this.currentYear, monthIndex, this.is13Month);
  }

  getEmptyCells(monthIndex: number): number[] {
    if (this.is13Month) return [];

    const firstDay = this.calendarService.getFirstDayOfMonth(this.currentYear, monthIndex, this.is13Month);
    const adjustedFirstDay = (firstDay + 6) % 7; // Convert Sunday=0 to Monday=0
    return Array.from({ length: adjustedFirstDay }, (_, i) => i);
  }

  getDays(monthIndex: number): number[] {
    const daysInMonth = this.calendarService.getDaysInMonth(monthIndex, this.is13Month, this.currentYear);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  getAllEvents(): Record<string, CalendarEvent[]> {
    return this.eventService.getEvents()();
  }

  onSelectDate(data: {month: number, day: number}) {
    this.selectDate.emit({ month: data.month, day: data.day });
  }

  onSelectSpecialDay(index: number, dayName: string) {
    this.selectDate.emit({ special: index, dayName });
  }

  onEditEvent(event: CalendarEvent) {
    this.editEvent.emit(event);
  }

  getSpecialDayClass(index: number): string {
    const isSelected = this.selectedDate && this.selectedDate.special === index;
    const dayEvents = this.getSpecialDayEvents(index);

    let className = "p-3 border border-gray-200 cursor-pointer transition-all duration-150 hover:bg-gray-50 rounded-lg";
    if (isSelected) {
      className += " bg-blue-50 border-blue-200 shadow-sm";
    } else if (dayEvents.length > 0) {
      className += " bg-green-50 border-green-200";
    }

    return className;
  }

  getSpecialDayEvents(index: number): CalendarEvent[] {
    return this.eventService.getEventsForDate(`special-${index}`);
  }

  trackByMonth(index: number, monthIndex: number): number {
    return monthIndex;
  }

  trackBySpecialDay(index: number, dayName: string): string {
    return `special-${index}-${dayName}`;
  }
}
