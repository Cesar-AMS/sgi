import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { Construtoras } from 'src/app/models/ContaBancaria';
import { ExportExcelService } from 'src/app/shared/export-excel.service';

@Component({
  selector: 'app-construtora',
  standalone: true,
  imports: [CommonModule, ModalModule, FormsModule, ReactiveFormsModule],
  templateUrl: './construtora.component.html',
  styleUrl: './construtora.component.scss'
})
export class ConstrutoraComponent implements OnInit {

  construtoras: Construtoras[] = [];

  construtura: Construtoras = {} as Construtoras

  constructor(private service: ApiService, private excel: ExportExcelService, private toast: ToastrService){

  }

  ngOnInit(){
    this.service.getConstrutora().subscribe((data)=>{
      this.construtoras = data
    })
  }

@ViewChild('showModal', { static: false }) showModal?: ModalDirective;

  idContrutora: number = 0

  title: string = 'Nova'
  
  openModalClient(action: 'new' | 'edit', id: number){
    if(action === 'new'){
      this.title = 'Nova'
      this.showModal?.show() 
    }

     if(action === 'edit'){
      this.title = 'Editar'
      this.idContrutora = id
      this.showModal?.show() 
    }

    this.construtura.name = ''
  }

  exportarExcel(): void {
    const data = this.construtoras.map(e => ({
    ID: e.id,
      Empreendimentos:e.empreendimentos,
      Unidades: e.unidades,
      Vendidos: e.vendidos,
      Reservados: e.reservados,
      Disponiveis: e.disponiveis,
      Criacao: e.createdAt
    }));

    this.excel.exportJson(data, 'Lista de Empreendimentos');
  }

  newConstrutora(){
    this.service.postConstrutora(this.construtura).subscribe({
      next: () => {
        this.toast.success('Construtora cadastrada com sucesso!')
        this.service.getConstrutora().subscribe((data)=>{
      this.construtoras = data
    })
        this.showModal?.hide()
      },
      error: () => {this.toast.error('Erro ao cadastrar!')}
    })
  }

  editConstrutora(){
    this.service.putConstrutora(this.construtura, this.idContrutora).subscribe({
      next: () => {
        this.toast.success('Construtora atualizada com sucesso!')
        this.service.getConstrutora().subscribe((data)=>{
      this.construtoras = data
    })
        this.showModal?.hide()
      },
      error: () => {this.toast.error('Erro ao atualizar!')}
    })
  }

}
