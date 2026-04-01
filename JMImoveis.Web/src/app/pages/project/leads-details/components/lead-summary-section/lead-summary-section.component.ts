import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Usuarios } from 'src/app/models/ContaBancaria';
import { Lead, LeadStatus } from 'src/app/models/lead';

@Component({
  selector: 'app-lead-summary-section',
  templateUrl: './lead-summary-section.component.html',
  styleUrls: ['./lead-summary-section.component.scss'],
})
export class LeadSummarySectionComponent {
  @Input() lead?: Lead;
  @Input() isEditing = false;
  @Input() infoForm!: FormGroup;
  @Input() corretores: Usuarios[] = [];
  @Input() statusOptions: LeadStatus[] = [];

  @Output() backRequested = new EventEmitter<void>();
  @Output() callRequested = new EventEmitter<void>();
  @Output() whatsappRequested = new EventEmitter<void>();
  @Output() emailRequested = new EventEmitter<void>();
  @Output() editToggled = new EventEmitter<void>();
  @Output() infoSubmitted = new EventEmitter<void>();
  @Output() saleRequested = new EventEmitter<void>();

  selectNameSale(idVendedor: unknown): string {
    if (idVendedor === null || idVendedor === undefined || idVendedor === '') {
      return '-';
    }

    return (
      this.corretores.find(
        (item) => item.id.toString().trim() === idVendedor.toString().trim()
      )?.name ?? '-'
    );
  }
}
