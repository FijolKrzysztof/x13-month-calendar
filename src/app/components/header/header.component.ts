import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icons.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() is13Month!: boolean;
  @Input() currentYear!: number;
  @Input() todayDisplay!: string;

  @Output() toggleCalendarType = new EventEmitter<void>();
  @Output() previousYear = new EventEmitter<void>();
  @Output() nextYear = new EventEmitter<void>();

  onToggleCalendarType() {
    this.toggleCalendarType.emit();
  }

  onPreviousYear() {
    this.previousYear.emit();
  }

  onNextYear() {
    this.nextYear.emit();
  }
}
