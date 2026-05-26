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
    { label: 'Outro', value: 'OUTRO' },
  ];

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
      .createOrGetByLeadId(this.leadId, { postVisitStatus: 'ACOMPANHANDO' })
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
    this.setFormAccess();
  }

  private buildPayload(): LeadPostVisitRequest {
    const value = this.form.value;

    return {
      cpf: this.emptyToNull(value.cpf),
      hasRestriction: this.selectValueToBoolean(value.hasRestriction),
      incomeType: this.emptyToNull(value.incomeType),
      interestRegion: this.emptyToNull(value.interestRegion),
      paysRent: this.selectValueToBoolean(value.paysRent),
      maritalStatus: this.emptyToNull(value.maritalStatus),
      downPaymentAmount: value.downPaymentAmount !== null && value.downPaymentAmount !== ''
        ? Number(value.downPaymentAmount)
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
}
