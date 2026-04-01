import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lead, LeadStatus } from 'src/app/models/lead';
import { LeadActivity, LeadSchedule, LeadScheduleStatus, Usuarios } from 'src/app/models/ContaBancaria';
import { ApiService } from 'src/app/core/services/api.service';
import { LeadsService } from 'src/app/core/services/leads.service';
import { LeadAgendaStatusChangeEvent } from './components/lead-agenda-section/lead-agenda-section.component';
import { LeadVisitStatusChangeEvent } from './components/lead-visits-section/lead-visits-section.component';

@Component({
  selector: 'app-lead-details',
  templateUrl: './leads-details.component.html',
  styleUrls: ['./leads-details.component.scss'],
})
export class LeadDetailsComponent implements OnInit {
  lead?: Lead;
  isLoading = false;

  activeTab: 'info' | 'docs' | 'proposal' | 'schedule' = 'info';
  isEditing = false;

  infoForm!: FormGroup;
  activityForm!: FormGroup;

  corretores: Usuarios[] = [];

  scheduleStatusOptions: { label: string; value: LeadScheduleStatus }[] = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Cumprido', value: 'Cumprido' },
    { label: 'Não cumprido', value: 'NaoCumprido' },
  ];

  statusOptions: LeadStatus[] = [
    'Novo',
    'Em Contato',
    'Em Negociação',
    'Ganhou',
    'Perdeu',
  ];

  private buildScheduleForm(): void {
    this.scheduleForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      time: ['09:00', Validators.required],
      note: [''],
    });
  }
  schedules: LeadSchedule[] = [];
  schedulesVisit: LeadSchedule[] = [];
  scheduleForm!: FormGroup;

  activities: LeadActivity[] = [];
  isAddingActivity = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private leadService: LeadsService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.buildForms();
    this.buildScheduleForm();


    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadLead(id);
      this.loadActivities(id);
      this.loadSchedules(id, 'visita');
      this.loadSchedules(id, 'contato');
    }

    this.apiService.getCorretores().subscribe((data) => {
      console.log('corretores', data)
      this.corretores = data
    });
  }

  buildForms(): void {
    this.infoForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.email]],
      telefone: [''],
      status: [''],
      origem: [''],
      valor: [null],
      observacao: [''],
      imoveisInteresse: [''],
      vendedor: [''],
      dataCriacao: [''],
      ultimoContato: [''],
    });

    this.activityForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      time: ['09:00', Validators.required],
      description: ['', Validators.required],
    });
  }

  loadSchedules(leadId: number, typeSchedule: string): void {
    this.leadService.getSchedulesByLead(leadId, typeSchedule).subscribe({
      next: (items) => {

        if (typeSchedule == 'visita') {
          this.schedulesVisit = (items || []).sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          );
        }
        else {

          this.schedules = (items || []).sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          );
        }
      },
    });
  }

  saveSchedule(type: 'contato' | 'visita'): void {
    if (!this.lead || this.scheduleForm.invalid) return;

    const { date, time, note } = this.scheduleForm.value;
    const iso = new Date(`${date}T${time}:00`).toISOString();

    const obj = {
      nomeCliente: this.lead.nome,
      dataHoraISO: iso,
      vendedorId: this.lead.vendedor,
      status: 'Agendada',
      observacao: note || null,
      compareceu: false,
      virouVenda: false,
      tipoAgenda: type
    }
    this.leadService.createScheduleV3(this.lead.id, obj).subscribe({
      next: () => {
        if (this.lead?.id) {
          this.loadSchedules(this.lead.id, type)
        }
      },
    });
  }

  changeScheduleStatus(item: LeadSchedule, status: LeadScheduleStatus): void {
    if (!this.lead) return;

    const payload = { id: item.id, leadId: this.lead.id, status };

    this.leadService.updateScheduleStatus(this.lead.id, item.id, payload).subscribe({
      next: () => {
        item.status = status;
      },
    });
  }

  handleContactScheduleStatusChange(event: LeadAgendaStatusChangeEvent): void {
    this.changeScheduleStatus(event.schedule, event.status);
  }

  handleVisitScheduleStatusChange(event: LeadVisitStatusChangeEvent): void {
    this.changeScheduleStatus(event.schedule, event.status);
  }



  loadLead(id: number): void {
    this.isLoading = true;
    this.leadService.getLeadById(id).subscribe({
      next: (lead) => {
        this.lead = lead;
        this.patchInfoForm(lead);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadActivities(leadId: number): void {
    this.leadService.getActivitiesByLead(leadId).subscribe({
      next: (acts) => {
        // opcional: ordenar desc por data
        this.activities = (acts || []).sort(
          (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        );
      },
    });
  }

  patchInfoForm(lead: Lead): void {
    this.infoForm.patchValue({
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      status: lead.status,
      origem: lead.fonte,
      valor: lead.valor,
      observacao: lead.observacao,
      imoveisInteresse: lead.imoveisInteresse,
      vendedor: lead.vendedor,
      dataCriacao: lead.dataCriacao ? lead.dataCriacao.substring(0, 10) : '',
      ultimoContato: (lead as any).ultimoContato || '',
    });
  }

  goBack(): void {
    this.router.navigate(['/jm/atendimento/leads/listagem']);
  }

  setTab(tab: 'info' | 'docs' | 'proposal' | 'schedule'): void {
    this.activeTab = tab;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (!this.isEditing && this.lead) {
      // se cancelar edição, volta valores originais
      this.patchInfoForm(this.lead);
    }
  }

  saveInfo(): void {
    if (!this.lead || this.infoForm.invalid) return;

    const form = this.infoForm.value;
    const updated: Lead = {
      ...this.lead,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      status: form.status,
      fonte: form.origem,
      valor: form.valor,
      observacao: form.observacao,
      imoveisInteresse: form.imoveisInteresse,
      vendedor: form.vendedor,
    };

    this.leadService.updateLead(updated).subscribe({
      next: () => {
        this.lead = updated;
        this.isEditing = false;
      },
    });
  }

  // ações rápidas – por enquanto só console.log, depois integra
  callLead(): void {
    if (!this.lead?.telefone) return;
    window.open(`tel:${this.lead.telefone}`, '_self');
  }

  whatsappLead(): void {
    if (!this.lead?.telefone) return;
    const phone = this.lead.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  }

  emailLead(): void {
    if (!this.lead?.email) return;
    window.location.href = `mailto:${this.lead.email}`;
  }

  openSaleFlow(): void {
    if (!this.lead) return;

    this.router.navigate(['/jm/vendas/new'], {
      queryParams: {
        leadId: this.lead.id,
        nome: this.lead.nome ?? '',
        telefone: this.lead.telefone ?? '',
        email: this.lead.email ?? '',
        origem: this.lead.fonte ?? '',
        vendedor: this.lead.vendedor ?? '',
      },
    });
  }

  // ---- Atividades ----

  startAddActivity(): void {
    this.isAddingActivity = true;
    this.activityForm.reset({
      date: new Date().toISOString().substring(0, 10),
      time: '09:00',
      description: '',
    });
  }

  cancelAddActivity(): void {
    this.isAddingActivity = false;
  }

  saveActivity(): void {
    if (!this.lead || this.activityForm.invalid) return;

    const { date, time, description } = this.activityForm.value;
    const iso = new Date(`${date}T${time}:00`).toISOString();

    const payload = {
      leadId: this.lead.id,
      dateTime: iso,
      description: description,
    };

    this.leadService.addActivity(this.lead.id, payload).subscribe({
      next: () => {
        this.isAddingActivity = false;
        this.loadActivities(this.lead?.id ?? 0);
      },
    });
  }
}
