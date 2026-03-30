import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LeadSchedule, LeadScheduleStatus } from 'src/app/models/ContaBancaria';

export interface LeadVisitStatusChangeEvent {
  schedule: LeadSchedule;
  status: LeadScheduleStatus;
}

@Component({
  selector: 'app-lead-visits-section',
  templateUrl: './lead-visits-section.component.html',
  styleUrls: ['./lead-visits-section.component.scss'],
})
export class LeadVisitsSectionComponent {
  @Input() scheduleForm!: FormGroup;
  @Input() schedulesVisit: LeadSchedule[] = [];
  @Input() scheduleStatusOptions: { label: string; value: LeadScheduleStatus }[] = [];

  @Output() visitScheduleSubmitted = new EventEmitter<void>();
  @Output() visitStatusChanged = new EventEmitter<LeadVisitStatusChangeEvent>();
}
