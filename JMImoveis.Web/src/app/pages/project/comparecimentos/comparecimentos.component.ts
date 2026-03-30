import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, map } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { AttendanceUpsert, AttendanceVm, PagedResultAttendanceVm } from 'src/app/models/attendance';
import { FormModule } from '../../forms/forms.module';

@Component({
  selector: 'app-comparecimentos',
  standalone: true,
  imports: [CommonModule, FormsModule, FormModule, ReactiveFormsModule],
  templateUrl: './comparecimentos.component.html',
  styleUrl: './comparecimentos.component.scss'
})
export class ComparecimentosComponent implements OnInit {
 rows: AttendanceVm[] = [];
  total = 0;
  page = 1;
  pageSize = 25;
  loading = false;

  // filtros simples
  filters: FormGroup = this.fb.group({
    onDate: [''],     // 'YYYY-MM-DD'
    userId: [''],     // opcional
    authorId: ['']    // opcional
  });

  // modal
  form: FormGroup | null = null;
  editingId: number | null = null;
  saving = false;

  constructor(private fb: FormBuilder, private svc: ApiService) {}
  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    const f = this.filters.value;
    this.svc.listAttendanceVm({
      page: this.page,
      pageSize: this.pageSize,
      onDate: f.onDate || undefined,
      userId: f.userId ? Number(f.userId) : undefined,
      authorId: f.authorId ? Number(f.authorId) : undefined
    }).subscribe({
      next: (res: PagedResultAttendanceVm<AttendanceVm>) => {
        this.rows = res.items ?? [];
        this.total = res.total ?? 0;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters() { this.page = 1; this.load(); }
  clearFilters() { this.filters.reset({ onDate:'', userId:'', authorId:'' }); this.applyFilters(); }
  pageChanged(p:number) { this.page = p; this.load(); }

  // ===== modal =====
  openCreate() {
    this.editingId = null;
    this.form = this.fb.group({
      date: ['', Validators.required],           // YYYY-MM-DD
      startedAt: ['', Validators.required],      // HH:mm
      finishedAt: [''],                          // HH:mm
      authorId: ['', [Validators.required]],
      userId: ['', [Validators.required]]
    });
  }

  openEdit(id: number) {
    this.editingId = id;
    this.svc.getAttendanceVm(id).subscribe(v => {
      this.form = this.fb.group({
        date: [v.date.substring(0,10), Validators.required],
        startedAt: [v.startedAt?.substring(0,5), Validators.required],
        finishedAt: [v.finishedAt ? v.finishedAt.substring(0,5) : ''],
        authorId: [v.authorId, Validators.required],
        userId: [v.userId, Validators.required]
      });
    });
  }

  closeModal() { this.form = null; this.editingId = null; }

  save() {
    if (!this.form || this.form.invalid) return;
    this.saving = true;

    const f = this.form.value as any;
    const body: AttendanceUpsert = {
      date: f.date,
      startedAt: f.startedAt?.length === 5 ? `${f.startedAt}:00` : f.startedAt,           // -> HH:mm:ss
      finishedAt: f.finishedAt ? (f.finishedAt.length === 5 ? `${f.finishedAt}:00` : f.finishedAt) : null,
      authorId: Number(f.authorId),
      userId: Number(f.userId)
    };

    const req$ = this.editingId
      ? this.svc.updateAttendanceVm(this.editingId, body).pipe(map(() => undefined))
      : this.svc.createAttendanceVm(body).pipe(map(() => undefined));

    req$.pipe(finalize(() => this.saving = false))
        .subscribe(() => { this.closeModal(); this.load(); });
  }

  remove(id: number) {
    if (!confirm('Excluir este registro?')) return;
    this.svc.delete(id).subscribe(() => this.load());
  }

  // helper para formatar HH:mm
  fmtTime(t?: string | null) { return t ? t.substring(0,5) : '—'; }


}
