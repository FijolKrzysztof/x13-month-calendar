import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { EventPanelComponent } from './components/event-panel/event-panel.component';
import { EventModalComponent } from './components/event-modal/event-modal.component';
import { CalendarService } from './services/calendar.service';
import { EventService } from './services/event.service';
import { SelectedDate, EventForm, CalendarEvent } from './models/event.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CalendarComponent,
    EventPanelComponent,
    EventModalComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  // Signals for reactive state
  is13Month = signal(true);
  currentYear = signal(2025);
  selectedDate = signal<SelectedDate | null>(null);
  showEventModal = signal(false);
  editingEvent = signal<CalendarEvent | null>(null);
  eventForm = signal<EventForm>({ title: '', time: '', description: '' });

  // Computed values
  todayDisplay = computed(() =>
    this.calendarService.getTodayDisplay(this.is13Month())
  );

  selectedDateTitle = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return '';

    if (selected.special !== undefined) {
      return selected.dayName || 'Special Day';
    } else {
      const monthName = this.is13Month()
        ? this.calendarService.months13[selected.month!]
        : this.calendarService.months12[selected.month!];
      return `${selected.day} ${monthName} ${this.currentYear()}`;
    }
  });

  selectedDateEvents = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return [];

    if (selected.special !== undefined) {
      return this.eventService.getEventsForDate(`special-${selected.special}`);
    } else {
      const dateKey = this.calendarService.getDateKey(
        selected.month!,
        selected.day!,
        this.currentYear(),
        this.is13Month()
      );
      return this.eventService.getEventsForDate(dateKey);
    }
  });

  showEventPanel = computed(() => this.selectedDate() !== null);

  constructor(
    private calendarService: CalendarService,
    private eventService: EventService
  ) {
    // Auto-select today's date on init
    effect(() => {
      if (this.currentYear()) {
        this.selectTodaysDate();
      }
    });

    // Close event panel when clicking outside (escape key)
    this.setupKeyboardShortcuts();
  }

  // Header event handlers
  onToggleCalendarType() {
    this.is13Month.update(val => !val);
    // Clear selection when switching calendar types
    this.selectedDate.set(null);
  }

  onPreviousYear() {
    this.currentYear.update(year => year - 1);
  }

  onNextYear() {
    this.currentYear.update(year => year + 1);
  }

  // Calendar event handlers
  onSelectDate(date: SelectedDate) {
    this.selectedDate.set(date);
  }

  onEditEvent(event: CalendarEvent) {
    this.editingEvent.set(event);
    this.eventForm.set({
      title: event.title,
      time: event.time || '',
      description: event.description || ''
    });
    this.showEventModal.set(true);
  }

  // Event panel handlers
  onOpenEventModal() {
    this.editingEvent.set(null);
    this.eventForm.set({ title: '', time: '', description: '' });
    this.showEventModal.set(true);
  }

  onCloseEventPanel() {
    this.selectedDate.set(null);
  }

  onRemoveEvent(eventId: number) {
    const selected = this.selectedDate();
    if (!selected) return;

    const dateKey = selected.special !== undefined
      ? `special-${selected.special}`
      : this.calendarService.getDateKey(
        selected.month!,
        selected.day!,
        this.currentYear(),
        this.is13Month()
      );

    this.eventService.removeEvent(dateKey, eventId);
  }

  // Event modal handlers
  onSaveEvent(formData: EventForm) {
    const selected = this.selectedDate();
    if (!selected || !formData.title.trim()) return;

    const dateKey = selected.special !== undefined
      ? `special-${selected.special}`
      : this.calendarService.getDateKey(
        selected.month!,
        selected.day!,
        this.currentYear(),
        this.is13Month()
      );

    const eventData = {
      title: formData.title.trim(),
      time: formData.time,
      description: formData.description.trim(),
      date: selected
    };

    if (this.editingEvent()) {
      this.eventService.updateEvent(dateKey, this.editingEvent()!.id, eventData);
    } else {
      this.eventService.addEvent(dateKey, eventData);
    }

    this.closeEventModal();
  }

  onCloseEventModal() {
    this.closeEventModal();
  }

  // Private methods
  private closeEventModal() {
    this.showEventModal.set(false);
    this.editingEvent.set(null);
    this.eventForm.set({ title: '', time: '', description: '' });
  }

  private selectTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();

    if (year !== this.currentYear()) return;

    if (this.is13Month()) {
      // Convert today to 13-month system
      const jan1 = new Date(year, 0, 1);
      const daysDifference = Math.floor((today.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
      const month13 = Math.floor(daysDifference / 28);
      const day13 = (daysDifference % 28) + 1;

      if (month13 >= 0 && month13 < 13 && day13 >= 1 && day13 <= 28) {
        this.selectedDate.set({ month: month13, day: day13 });
      }
    } else {
      // Use regular date
      this.selectedDate.set({
        month: today.getMonth(),
        day: today.getDate()
      });
    }
  }

  private setupKeyboardShortcuts() {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', (event) => {
        // Escape key closes panels/modals
        if (event.key === 'Escape') {
          if (this.showEventModal()) {
            this.closeEventModal();
          } else if (this.selectedDate()) {
            this.selectedDate.set(null);
          }
        }

        // 'N' key opens new event modal (if date selected)
        if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey) {
          const target = event.target as HTMLElement;
          // Don't trigger if user is typing in an input
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            if (this.selectedDate() && !this.showEventModal()) {
              this.onOpenEventModal();
              event.preventDefault();
            }
          }
        }

        // Arrow keys for navigation (future enhancement)
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
          // Could implement date navigation here
        }
      });
    }
  }
}
