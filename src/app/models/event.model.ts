export interface CalendarEvent {
  id: number;
  title: string;
  time?: string;
  description?: string;
  date: SelectedDate;
}

export interface SelectedDate {
  month?: number;
  day?: number;
  special?: number;
  dayName?: string;
}

export interface EventForm {
  title: string;
  time: string;
  description: string;
}
