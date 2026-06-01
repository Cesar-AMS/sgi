import { Component, OnInit } from '@angular/core';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';

type AtendimentoGestaoTabId = 'distribuicao' | 'regioes' | 'fontes';

interface AtendimentoGestaoTab {
  id: AtendimentoGestaoTabId;
  label: string;
  permissionKeys: string[];
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
      permissionKeys: [
        'atendimento.distribuicao_leads.visualizar',
        'atendimento.distribuicao_leads.editar',
      ],
    },
    {
      id: 'regioes',
      label: 'Regi\u00f5es de Interesse',
      permissionKeys: [
        'atendimento.regioes_interesse.visualizar',
        'atendimento.regioes_interesse.editar',
      ],
    },
    {
      id: 'fontes',
      label: 'Fontes de Origem',
      permissionKeys: [
        'atendimento.fontes_origem.visualizar',
        'atendimento.fontes_origem.editar',
      ],
    },
  ];

  visibleTabs: AtendimentoGestaoTab[] = [];
  activeTabId: AtendimentoGestaoTabId | null = null;
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

        this.visibleTabs = this.tabs.filter(
          (tab) => isAdmin || tab.permissionKeys.some((permissionKey) => permissionKeys.has(permissionKey))
        );
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
    this.isAccessDenied = true;
    this.isLoadingPermissions = false;
  }

  private extractPermissionKeys(permissions: Permission[]): string[] {
    return (permissions ?? [])
      .map((permission) => permission.permissionKey ?? permission.permission_key ?? '')
      .filter((permissionKey) => permissionKey.length > 0);
  }
}
