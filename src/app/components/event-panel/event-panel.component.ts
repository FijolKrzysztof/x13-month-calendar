import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icons.component';
import { CalendarEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './event-panel.component.html',
  styleUrls: ['./event-panel.component.scss']
})
export class EventPanelComponent {
  @Input() show!: boolean;
  @Input() selectedDateTitle!: string;
  @Input() events!: CalendarEvent[];

  @Output() openEventModal = new EventEmitter<void>();
  @Output() editEvent = new EventEmitter<CalendarEvent>();
  @Output() removeEvent = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  onOpenEventModal() {
    this.openEventModal.emit();
  }

  onEditEvent(event: CalendarEvent) {
    this.editEvent.emit(event);
  }

  onRemoveEvent(eventId: number, $event: Event) {
    $event.stopPropagation();
    this.removeEvent.emit(eventId);
  }

  onClose() {
    this.close.emit();
  }

  formatEventTime(time: string): string {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  }

  getEventTypeIcon(event: CalendarEvent): string {
    // Simple logic to determine icon based on title keywords
    const title = event.title.toLowerCase();
    if (title.includes('meeting') || title.includes('call')) return 'users';
    if (title.includes('reminder') || title.includes('todo')) return 'bell';
    if (title.includes('birthday') || title.includes('anniversary')) return 'gift';
    if (title.includes('deadline') || title.includes('due')) return 'alert-circle';
    return 'calendar';
  }
}
