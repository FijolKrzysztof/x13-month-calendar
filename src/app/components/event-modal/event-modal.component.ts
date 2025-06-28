import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icons.component';
import { CalendarEvent, EventForm } from '../../models/event.model';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.scss']
})
export class EventModalComponent {
  @Input() show!: boolean;
  @Input() editingEvent!: CalendarEvent | null;
  @Input() selectedDateTitle!: string;
  @Input() eventForm!: EventForm;

  @Output() save = new EventEmitter<EventForm>();
  @Output() close = new EventEmitter<void>();

  onSave() {
    if (!this.eventForm.title.trim()) return;
    this.save.emit(this.eventForm);
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onClose();
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      this.onSave();
    }
  }
}
