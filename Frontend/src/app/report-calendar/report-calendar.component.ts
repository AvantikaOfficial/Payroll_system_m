import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';

declare var bootstrap: any;

@Component({
  selector: 'app-report-calendar',
  templateUrl: './report-calendar.component.html',
  styleUrls: ['./report-calendar.component.scss']
})
export class ReportCalendarComponent {

calendarOptions: CalendarOptions = {
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
    // listPlugin,
    bootstrap5Plugin
  ],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  editable: true,
  droppable: true,
  selectable: true,
  themeSystem: 'bootstrap5',
  displayEventTime: false, // Hide event times
  events: [
    { title: 'Holiday', color: '#28a745' }
  ]
};

constructor() {}

  ngOnInit(): void {}

  openAddEventModal(): void {
    const modalElement = document.getElementById('add_event');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  openCategoryModal(): void {
    const modalElement = document.getElementById('add_category');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }


}
