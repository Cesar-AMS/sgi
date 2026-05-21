import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LeadSchedule, VisitScheduleStatus } from 'src/app/models/ContaBancaria';

export interface LeadVisitStatusChangeEvent {
  schedule: LeadSchedule;
  status: VisitScheduleStatus;
}

@Component({
  selector: 'app-lead-visits-section',
  templateUrl: './lead-visits-section.component.html',
  styleUrls: ['./lead-visits-section.component.scss'],
})
export class LeadVisitsSectionComponent {
  @Input() scheduleForm!: FormGroup;
  @Input() schedulesVisit: LeadSchedule[] = [];
  @Input() scheduleStatusOptions: { label: string; value: VisitScheduleStatus }[] = [];

  @Output() visitScheduleSubmitted = new EventEmitter<void>();
  @Output() visitStatusChanged = new EventEmitter<LeadVisitStatusChangeEvent>();
}
