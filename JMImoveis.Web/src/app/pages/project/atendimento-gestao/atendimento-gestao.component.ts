import { Component, OnInit } from '@angular/core';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';

type AtendimentoGestaoTabId = 'distribuicao' | 'regioes' | 'fontes';

interface AtendimentoGestaoTab {
  id: AtendimentoGestaoTabId;
  label: string;
}

@Component({
  selector: 'app-atendimento-gestao',
  templateUrl: './atendimento-gestao.component.html',
  styleUrls: ['./atendimento-gestao.component.scss'],
})
export class AtendimentoGestaoComponent implements OnInit {
  private readonly adminPermission = 'sistema.admin.total';
  private readonly tabs: AtendimentoGestaoTab[] = [
    {
      id: 'distribuicao',
      label: 'Distribui\u00e7\u00e3o de Leads',
    },
    {
      id: 'regioes',
      label: 'Regi\u00f5es de Interesse',
    },
    {
      id: 'fontes',
      label: 'Fontes de Origem',
    },
  ];

  visibleTabs: AtendimentoGestaoTab[] = [];
  activeTabId: AtendimentoGestaoTabId | null = null;
  canViewGestao = false;
  canEditGestao = false;
  canViewDistribuicaoLeads = false;
  canEditDistribuicaoLeads = false;
  canViewRegioesInteresse = false;
  canEditRegioesInteresse = false;
  canViewFontesOrigem = false;
  canEditFontesOrigem = false;
  isLoadingPermissions = true;
  isAccessDenied = false;

  constructor(
    private permissionsService: PermissionsService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  selectTab(tabId: AtendimentoGestaoTabId): void {
    if (this.visibleTabs.some((tab) => tab.id === tabId)) {
      this.activeTabId = tabId;
    }
  }

  private loadPermissions(): void {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      this.denyAccess();
      return;
    }

    this.permissionsService.getUserEffectivePermissions(userId).subscribe({
      next: (permissions) => {
        const permissionKeys = new Set(this.extractPermissionKeys(permissions));
        const isAdmin = permissionKeys.has(this.adminPermission);

        this.canViewGestao = isAdmin || permissionKeys.has('atendimento.gestao.visualizar');
        this.canEditGestao = isAdmin || permissionKeys.has('atendimento.gestao.editar');
        this.canViewDistribuicaoLeads =
          isAdmin || permissionKeys.has('atendimento.gestao.distribuicao_leads.visualizar');
        this.canEditDistribuicaoLeads =
          isAdmin || permissionKeys.has('atendimento.gestao.distribuicao_leads.editar');
        this.canViewRegioesInteresse =
          isAdmin || permissionKeys.has('atendimento.gestao.regioes_interesse.visualizar');
        this.canEditRegioesInteresse =
          isAdmin || permissionKeys.has('atendimento.gestao.regioes_interesse.editar');
        this.canViewFontesOrigem =
          isAdmin || permissionKeys.has('atendimento.gestao.fontes_origem.visualizar');
        this.canEditFontesOrigem =
          isAdmin || permissionKeys.has('atendimento.gestao.fontes_origem.editar');

        this.visibleTabs = this.tabs.filter((tab) => this.canViewTab(tab.id));
        this.activeTabId = this.visibleTabs[0]?.id ?? null;
        this.isAccessDenied = this.visibleTabs.length === 0;
        this.isLoadingPermissions = false;
      },
      error: () => this.denyAccess(),
    });
  }

  private denyAccess(): void {
    this.visibleTabs = [];
    this.activeTabId = null;
    this.canViewGestao = false;
    this.canEditGestao = false;
    this.canViewDistribuicaoLeads = false;
    this.canEditDistribuicaoLeads = false;
    this.canViewRegioesInteresse = false;
    this.canEditRegioesInteresse = false;
    this.canViewFontesOrigem = false;
    this.canEditFontesOrigem = false;
    this.isAccessDenied = true;
    this.isLoadingPermissions = false;
  }

  private canViewTab(tabId: AtendimentoGestaoTabId): boolean {
    switch (tabId) {
      case 'distribuicao':
        return this.canViewDistribuicaoLeads;
      case 'regioes':
        return this.canViewRegioesInteresse;
      case 'fontes':
        return this.canViewFontesOrigem;
    }
  }

  private extractPermissionKeys(permissions: Permission[]): string[] {
    return (permissions ?? [])
      .map((permission) => permission.permissionKey ?? permission.permission_key ?? '')
      .filter((permissionKey) => permissionKey.length > 0);
  }
}
