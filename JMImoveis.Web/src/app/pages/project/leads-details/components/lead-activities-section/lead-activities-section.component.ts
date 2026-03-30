import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LeadActivity } from 'src/app/models/lead';

@Component({
  selector: 'app-lead-activities-section',
  templateUrl: './lead-activities-section.component.html',
  styleUrls: ['./lead-activities-section.component.scss'],
})
export class LeadActivitiesSectionComponent {
  @Input() activities: LeadActivity[] = [];
  @Input() isAddingActivity = false;
  @Input() activityForm!: FormGroup;

  @Output() addRequested = new EventEmitter<void>();
  @Output() addCanceled = new EventEmitter<void>();
  @Output() activitySubmitted = new EventEmitter<void>();
}
