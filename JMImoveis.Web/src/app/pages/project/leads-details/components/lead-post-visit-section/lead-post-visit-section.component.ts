import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { LeadPostVisitService } from 'src/app/core/services/lead-post-visit.service';
import {
  LeadPostVisit,
  LeadPostVisitRequest,
  LeadPostVisitStatus,
} from 'src/app/models/lead-post-visit';
import { Usuarios } from 'src/app/models/ContaBancaria';

type Option<T extends string = string> = {
  label: string;
  value: T;
};

@Component({
  selector: 'app-lead-post-visit-section',
  templateUrl: './lead-post-visit-section.component.html',
  styleUrls: ['./lead-post-visit-section.component.scss'],
})
export class LeadPostVisitSectionComponent implements OnChanges {
  @Input() leadId?: number;
  @Input() canEditPostVisit = false;
  @Input() agents: Usuarios[] = [];
  @Input() suggestedAgentId?: number | string | null;
  @Input() responsibleAgentName?: string | null;

  postVisit?: LeadPostVisit | null;
  form: FormGroup;
  isLoading = false;
  isInitializing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  readonly restrictionOptions: Option[] = [
    { label: 'Nao informado', value: '' },
    { label: 'Sim', value: 'true' },
    { label: 'Nao', value: 'false' },
  ];

  readonly incomeTypeOptions: Option[] = [
    { label: 'Nao informado', value: '' },
    { label: 'CLT', value: 'CLT' },
    { label: 'Autonomo', value: 'AUTONOMO' },
    { label: 'CLT + Autonomo', value: 'CLT_AUTONOMO' },
    { label: 'Outro', value: 'OUTRO' },
  ];

  readonly currencyOptions = {
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 2,
    allowNegative: false,
  };

  readonly maritalStatusOptions: Option[] = [
    { label: 'Nao informado', value: '' },
    { label: 'Solteiro', value: 'SOLTEIRO' },
    { label: 'Casado', value: 'CASADO' },
    { label: 'Divorciado', value: 'DIVORCIADO' },
    { label: 'Viuvo', value: 'VIUVO' },
    { label: 'Outro', value: 'OUTRO' },
  ];

  readonly propertyInterestOptions: Option[] = [
    { label: 'Nao informado', value: '' },
    { label: 'Pronto', value: 'PRONTO' },
    { label: 'Planta', value: 'PLANTA' },
    { label: 'Pronto e planta', value: 'AMBOS' },
    { label: 'Indefinido', value: 'INDEFINIDO' },
  ];

  readonly statusOptions: Option<LeadPostVisitStatus>[] = [
    { label: 'Agendou retorno', value: 'AGENDOU_RETORNO' },
    { label: 'Oportunidade futura', value: 'OPORTUNIDADE_FUTURA' },
    { label: 'Acompanhando', value: 'ACOMPANHANDO' },
    { label: 'Em proposta', value: 'EM_PROPOSTA' },
    { label: 'Fechou venda', value: 'FECHOU_VENDA' },
  ];

  constructor(
    private fb: FormBuilder,
    private leadPostVisitService: LeadPostVisitService
  ) {
    this.form = this.fb.group({
      cpf: [''],
      hasRestriction: [''],
      incomeType: [''],
      interestRegion: [''],
      paysRent: [''],
      maritalStatus: [''],
      downPaymentAmount: [null],
      attendingAgentId: [''],
      propertyInterestType: [''],
      postVisitStatus: ['ACOMPANHANDO' as LeadPostVisitStatus],
      nextFollowUpAt: [''],
      lastInteractionSummary: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canEditPostVisit']) {
      this.setFormAccess();
    }

    if (changes['leadId'] && this.leadId) {
      this.loadPostVisit();
    }

    if (changes['suggestedAgentId'] || changes['agents']) {
      this.applySuggestedAgentIfEmpty();
    }
  }

  loadPostVisit(): void {
    if (!this.leadId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.leadPostVisitService
      .getByLeadId(this.leadId)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null);
          }

          this.errorMessage = 'Nao foi possivel carregar o pos-visita deste lead.';
          return of(null);
        })
      )
      .subscribe((postVisit) => {
        this.postVisit = postVisit;
        if (postVisit) {
          this.patchForm(postVisit);
        } else {
          this.resetForm();
        }

        this.isLoading = false;
      });
  }

  initializePostVisit(): void {
    if (!this.ensureCanEdit() || !this.leadId) {
      return;
    }

    this.isInitializing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.leadPostVisitService
      .createOrGetByLeadId(this.leadId, {
        postVisitStatus: 'ACOMPANHANDO',
        attendingAgentId: this.getSuggestedAgentId(),
      })
      .subscribe({
        next: (postVisit) => {
          this.postVisit = postVisit;
          this.patchForm(postVisit);
          this.isInitializing = false;
          this.successMessage = 'Pos-visita iniciado com sucesso.';
        },
        error: () => {
          this.isInitializing = false;
          this.errorMessage = 'Nao foi possivel iniciar o pos-visita.';
        },
      });
  }

  save(): void {
    if (!this.ensureCanEdit() || !this.leadId) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.leadPostVisitService.updateByLeadId(this.leadId, this.buildPayload()).subscribe({
      next: (postVisit) => {
        this.postVisit = postVisit;
        this.patchForm(postVisit);
        this.isSaving = false;
        this.successMessage = 'Pos-visita salvo com sucesso.';
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Nao foi possivel salvar o pos-visita.';
      },
    });
  }

  isInProposal(): boolean {
    return this.form.get('postVisitStatus')?.value === 'EM_PROPOSTA';
  }

  trackByValue(_: number, option: Option): string {
    return option.value;
  }

  trackByAgent(_: number, agent: Usuarios): number {
    return Number(agent.id) || 0;
  }

  getSelectedAgentName(): string {
    const selectedId = Number(this.form.get('attendingAgentId')?.value || 0);
    if (!selectedId) {
      return this.getSuggestedAgentName();
    }

    return this.findAgentName(selectedId) || 'Nao informado';
  }

  getSuggestedAgentName(): string {
    const suggestedId = this.getSuggestedAgentId();
    if (suggestedId) {
      return this.findAgentName(suggestedId) || `ID ${suggestedId}`;
    }

    const responsibleName = String(this.responsibleAgentName ?? '').trim();
    return responsibleName || 'Nao informado';
  }

  formatCpfInput(): void {
    const control = this.form.get('cpf');
    const formatted = this.formatCpf(control?.value);

    if (control && control.value !== formatted) {
      control.patchValue(formatted, { emitEvent: false });
    }
  }

  formatCpf(value?: string | null): string {
    const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  getDownPaymentPreview(): number {
    return this.toMoneyNumber(this.form.get('downPaymentAmount')?.value);
  }

  private patchForm(postVisit: LeadPostVisit): void {
    this.form.patchValue({
      cpf: postVisit.cpf || '',
      hasRestriction: this.booleanToSelectValue(postVisit.hasRestriction),
      incomeType: postVisit.incomeType || '',
      interestRegion: postVisit.interestRegion || '',
      paysRent: this.booleanToSelectValue(postVisit.paysRent),
      maritalStatus: postVisit.maritalStatus || '',
      downPaymentAmount: postVisit.downPaymentAmount ?? null,
      attendingAgentId: postVisit.attendingAgentId ? String(postVisit.attendingAgentId) : '',
      propertyInterestType: postVisit.propertyInterestType || '',
      postVisitStatus: postVisit.postVisitStatus || 'ACOMPANHANDO',
      nextFollowUpAt: this.toDateTimeLocalValue(postVisit.nextFollowUpAt),
      lastInteractionSummary: postVisit.lastInteractionSummary || '',
    });
    this.formatCpfInput();
    this.applySuggestedAgentIfEmpty();
    this.setFormAccess();
  }

  private resetForm(): void {
    this.form.reset({
      cpf: '',
      hasRestriction: '',
      incomeType: '',
      interestRegion: '',
      paysRent: '',
      maritalStatus: '',
      downPaymentAmount: null,
      attendingAgentId: '',
      propertyInterestType: '',
      postVisitStatus: 'ACOMPANHANDO' as LeadPostVisitStatus,
      nextFollowUpAt: '',
      lastInteractionSummary: '',
    });
    this.applySuggestedAgentIfEmpty();
    this.setFormAccess();
  }

  private buildPayload(): LeadPostVisitRequest {
    const value = this.form.value;

    return {
      cpf: this.emptyToNull(this.formatCpf(value.cpf)),
      hasRestriction: this.selectValueToBoolean(value.hasRestriction),
      incomeType: this.emptyToNull(value.incomeType),
      interestRegion: this.emptyToNull(value.interestRegion),
      paysRent: this.selectValueToBoolean(value.paysRent),
      maritalStatus: this.emptyToNull(value.maritalStatus),
      downPaymentAmount: value.downPaymentAmount !== null && value.downPaymentAmount !== ''
        ? this.toMoneyNumber(value.downPaymentAmount)
        : null,
      attendingAgentId: value.attendingAgentId ? Number(value.attendingAgentId) : null,
      propertyInterestType: this.emptyToNull(value.propertyInterestType),
      postVisitStatus: value.postVisitStatus || 'ACOMPANHANDO',
      nextFollowUpAt: value.nextFollowUpAt ? new Date(value.nextFollowUpAt).toISOString() : null,
      lastInteractionSummary: this.emptyToNull(value.lastInteractionSummary),
      proposalId: this.postVisit?.proposalId ?? null,
    };
  }

  private ensureCanEdit(): boolean {
    if (this.canEditPostVisit) {
      return true;
    }

    this.errorMessage = 'Voce nao tem permissao para editar o Pos-Visita.';
    return false;
  }

  private setFormAccess(): void {
    if (this.canEditPostVisit) {
      this.form.enable({ emitEvent: false });
    } else {
      this.form.disable({ emitEvent: false });
    }
  }

  private booleanToSelectValue(value?: boolean | null): string {
    if (value === true) return 'true';
    if (value === false) return 'false';
    return '';
  }

  private selectValueToBoolean(value: string): boolean | null {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  }

  private emptyToNull(value: string | null | undefined): string | null {
    const normalized = String(value ?? '').trim();
    return normalized ? normalized : null;
  }

  private toDateTimeLocalValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  }

  private applySuggestedAgentIfEmpty(): void {
    const control = this.form.get('attendingAgentId');
    const current = Number(control?.value || 0);
    const suggested = this.getSuggestedAgentId();

    if (control && !current && suggested) {
      control.patchValue(String(suggested), { emitEvent: false });
    }
  }

  private getSuggestedAgentId(): number | null {
    const id = Number(this.suggestedAgentId || 0);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private findAgentName(agentId: number): string | null {
    return this.agents.find((agent) => Number(agent.id) === agentId)?.name || null;
  }

  private toMoneyNumber(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

    const raw = String(value ?? '').trim();
    if (!raw) return 0;

    const normalized = raw
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
