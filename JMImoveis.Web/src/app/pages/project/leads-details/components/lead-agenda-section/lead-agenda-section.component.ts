import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LeadSchedule, LeadScheduleStatus } from 'src/app/models/ContaBancaria';

export interface LeadAgendaStatusChangeEvent {
  schedule: LeadSchedule;
  status: LeadScheduleStatus;
}

@Component({
  selector: 'app-lead-agenda-section',
  templateUrl: './lead-agenda-section.component.html',
  styleUrls: ['./lead-agenda-section.component.scss'],
})
export class LeadAgendaSectionComponent {
  @Input() scheduleForm!: FormGroup;
  @Input() schedules: LeadSchedule[] = [];
  @Input() scheduleStatusOptions: { label: string; value: LeadScheduleStatus }[] = [];

  @Output() scheduleSubmitted = new EventEmitter<void>();
  @Output() scheduleStatusChanged = new EventEmitter<LeadAgendaStatusChangeEvent>();
}
