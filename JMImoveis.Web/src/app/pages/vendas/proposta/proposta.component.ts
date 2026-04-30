import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-proposta',
    templateUrl: './proposta.component.html',
    styleUrls: ['./proposta.component.scss']
})
export class PropostaComponent implements OnInit {
    unidadeId: number | null = null;
    empreendimentoId: number | null = null;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            const unidadeId = Number(params.get('unidadeId'));
            const empreendimentoId = Number(params.get('empreendimentoId'));

            this.unidadeId = Number.isFinite(unidadeId) && unidadeId > 0 ? unidadeId : null;
            this.empreendimentoId = Number.isFinite(empreendimentoId) && empreendimentoId > 0 ? empreendimentoId : null;
        });
    }
}
