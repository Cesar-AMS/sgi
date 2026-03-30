import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Apartamento, ApartamentoManagement } from 'src/app/core/data/empreendimento';
import { ApiService } from 'src/app/core/services/api.service';
import { Empreendimento, Usuarios } from 'src/app/models/ContaBancaria';




@Component({
  selector: 'app-admin-empreendimento',
  templateUrl: './admin-empreendimento.component.html',
  styleUrl: './admin-empreendimento.component.scss'
})
export class AdminEmpreendimentoComponent implements OnInit {

  constructor(private service: ApiService,
    private route: ActivatedRoute,
    private toast: ToastrService) {

  }

  apartamentos: Apartamento[] = [];

  apartaments: ApartamentoManagement[] = [];

  usuarios: Usuarios[] = [];
  emprendimento: Empreendimento = {} as Empreendimento;
  filterUser: any = { name: '' };
  enterpriseId: number = 0


  @ViewChild('modalUsers', { static: false }) modalUsers?: ModalDirective;

  ngOnInit() {
    this.enterpriseId = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getApartamentEnterprise(Number(this.route.snapshot.paramMap.get('id'))).subscribe((data) => {
      console.log('apartamentos', data)
      this.apartaments = data
    })

    this.service.getEmpreendimentosById(Number(this.route.snapshot.paramMap.get('id'))).subscribe((data) => {
      this.emprendimento = data
    })
  }
  private tempId = -1;

  addUnidade(): void {

    const agora = new Date().toISOString().slice(0, 19);

    const nova: ApartamentoManagement = {
      id: this.tempId--,
      floor: 0,
      block: '',
      number: 0,
      value: 0,
      income: '',
      size: 0,
      dormitories: 2,
      status: 'AVAILABLE',
      enterpriseId: this.enterpriseId,
      createdAt: agora,
      updatedAt: agora,
      deletedAt: null,
      active: true,
      pending: true
    };

    this.apartaments = [nova, ...this.apartaments]; // adiciona no topo
  }

  groupByBlocoEAndar(apts: Apartamento[]): {
    [bloco: string]: { [andar: number]: Apartamento[] };
  } {
    const result: any = {};
    for (const apt of apts) {
      if (!result[apt.bloco]) result[apt.bloco] = {};
      if (!result[apt.bloco][apt.andar]) result[apt.bloco][apt.andar] = [];
      result[apt.bloco][apt.andar].push(apt);
    }
    return result;
  }

  saveUser() {

  }

  putApartamentById() {

  }



  salvar(ap: ApartamentoManagement) {

    if (ap?.pending != null && ap?.pending == true) {
      this.service.postApartament(ap).subscribe(() => {
        this.toast.success('Nova Unidade registrada com sucesso.')
      })

    }

    this.service.putApartamentById(ap.id, ap).subscribe((data) => {
      this.toast.success('Unidade atualizada com sucesso.')
    })
  }

  selected: boolean = true;

  selectedAll() {
    this.usuarios.forEach((e) => {
      e.enterpriseVisibility = this.selected
    })

    this.selected = !this.selected
  }

  rules() {


    this.service.getUsuariosEnterprise(1).subscribe({
      next: (d: Usuarios[]) => {

        this.usuarios = d;
        this.modalUsers?.show();
      },
    });
  }

  formatAndar(andar: any) {
    return andar + 1 === 1 ? 'Térreo' : andar;
  }

  generateAndar: number = 0
  generateBloco: number = 0
  generateAptoAndar: number = 0

  generateApartamentos(blocos: number, andares: number, aptosPorAndar: number): void {
    this.groupedApartmentsByBlocoEAndar = {}; // limpa antes

    let idCounter = 1;

    for (let b = 0; b < blocos; b++) {
      const blocoLetra = String.fromCharCode(65 + b); // A, B, C...

      if (!this.groupedApartmentsByBlocoEAndar[blocoLetra]) {
        this.groupedApartmentsByBlocoEAndar[blocoLetra] = {};
      }

      for (let andar = 1; andar <= andares; andar++) {
        if (!this.groupedApartmentsByBlocoEAndar[blocoLetra][andar]) {
          this.groupedApartmentsByBlocoEAndar[blocoLetra][andar] = [];
        }

        for (let apto = 1; apto <= aptosPorAndar; apto++) {
          const numero = `${andar}${String(apto).padStart(2, '0')}`;

          const aptoObj = {
            id: idCounter++,
            idEmpreendimento: 1,
            andar: andar,
            bloco: blocoLetra,
            numero: numero,
            mt2: '50',
            dormitorios: 2,
            valor: 250000,
            perfilRenda: 'Baixa',
            status: 'Disponivel',
          };

          this.groupedApartmentsByBlocoEAndar[blocoLetra][andar].push(aptoObj);
        }
      }
    }
  }


  trackById(_: number, u: Usuarios) {
    return u.id;
  }


  groupedApartmentsByBlocoEAndar: {
    [bloco: string]: {
      [andar: number]: Apartamento[];
    };
  } = {};



}
