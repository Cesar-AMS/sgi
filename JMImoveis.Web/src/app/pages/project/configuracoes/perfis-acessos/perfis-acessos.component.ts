import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';
import { MENU } from 'src/app/layouts/sidebar/menu';
import { EmployeeControlRow, HrService } from 'src/app/core/services/hr.service';
import { UserMenuService } from 'src/app/core/services/user-menu.service';

type AccessTreeNode = {
  item: MenuItem;
  checked: boolean;
  indeterminate: boolean;
  children: AccessTreeNode[];
};

@Component({
  selector: 'app-perfis-acessos',
  templateUrl: './perfis-acessos.component.html',
  styleUrls: ['./perfis-acessos.component.scss'],
})
export class PerfisAcessosComponent implements OnInit {
  collaborators: EmployeeControlRow[] = [];
  filteredCollaborators: EmployeeControlRow[] = [];
  selectedCollaborator?: EmployeeControlRow;
  accessTree: AccessTreeNode[] = [];
  searchTerm = '';
  loadingCollaborators = false;
  loadingMenu = false;
  saving = false;
  successMessage = '';
  errorMessage = '';
  checkedMenuCount = 0;

  private readonly catalogMenu = this.normalizeMenuLinks(MENU);

  constructor(
    private hrService: HrService,
    private userMenuService: UserMenuService
  ) {}

  ngOnInit(): void {
    this.loadCollaborators();
  }

  loadCollaborators(): void {
    this.loadingCollaborators = true;
    this.errorMessage = '';

    this.hrService.getEmployeeControl().subscribe({
      next: (rows) => {
        this.collaborators = rows ?? [];
        this.applySearch();
        this.loadingCollaborators = false;
      },
      error: (err) => {
        console.error('Erro ao carregar colaboradores para perfis e acessos', err);
        this.errorMessage = 'Nao foi possivel carregar os colaboradores.';
        this.loadingCollaborators = false;
      },
    });
  }

  applySearch(): void {
    const term = this.normalizeSearch(this.searchTerm);
    if (!term) {
      this.filteredCollaborators = [...this.collaborators];
      return;
    }

    this.filteredCollaborators = this.collaborators.filter((collaborator) => {
      const haystack = [
        collaborator.name,
        collaborator.email,
        collaborator.cargo,
        collaborator.employmentTypeLabel,
        collaborator.status,
      ].map((value) => this.normalizeSearch(value)).join(' ');

      return haystack.includes(term);
    });
  }

  selectCollaborator(collaborator: EmployeeControlRow): void {
    this.selectedCollaborator = collaborator;
    this.successMessage = '';
    this.errorMessage = '';
    this.accessTree = this.buildTree(new Set<string>());
    this.checkedMenuCount = 0;
    this.loadCollaboratorMenu(collaborator.id);
  }

  clearSelection(): void {
    this.selectedCollaborator = undefined;
    this.accessTree = [];
    this.checkedMenuCount = 0;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadingMenu = false;
    this.saving = false;
  }

  private loadCollaboratorMenu(collaboratorId: number, successMessage?: string): void {
    this.loadingMenu = true;
    this.userMenuService.getUserMenu(collaboratorId).subscribe({
      next: (menu) => {
        const allowedLinks = this.extractLinks(Array.isArray(menu) ? menu : []);
        this.accessTree = this.buildTree(allowedLinks);
        this.updateCheckedMenuCount();
        this.successMessage = successMessage ?? '';
        this.loadingMenu = false;
      },
      error: (err) => {
        console.error('Erro ao carregar acessos do colaborador', err);
        this.errorMessage = 'Nao foi possivel carregar os acessos deste colaborador.';
        this.loadingMenu = false;
      },
    });
  }

  toggleNode(node: AccessTreeNode, checked: boolean): void {
    node.checked = checked;
    node.indeterminate = false;
    this.setChildrenChecked(node, checked);
    this.refreshTreeState();
    this.updateCheckedMenuCount();
  }

  applyDefaultMenu(): void {
    this.accessTree = this.buildTree(this.extractLinks(this.catalogMenu));
    this.updateCheckedMenuCount();
    this.successMessage = '';
    this.errorMessage = '';
  }

  clearMenu(): void {
    this.accessTree = this.buildTree(new Set<string>());
    this.updateCheckedMenuCount();
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveAccess(): void {
    if (!this.selectedCollaborator) {
      this.errorMessage = 'Selecione um colaborador antes de salvar.';
      return;
    }

    const menu = this.buildMenuFromTree(this.accessTree);
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userMenuService.updateUserMenu(this.selectedCollaborator.id, menu).subscribe({
      next: () => {
        this.saving = false;
        this.loadCollaboratorMenu(
          this.selectedCollaborator!.id,
          'Acessos salvos e confirmados com sucesso.'
        );
      },
      error: (err) => {
        console.error('Erro ao salvar acessos do colaborador', err);
        this.errorMessage = 'Nao foi possivel salvar os acessos.';
        this.saving = false;
      },
    });
  }

  trackCollaborator(_: number, collaborator: EmployeeControlRow): number {
    return collaborator.id;
  }

  trackNode(_: number, node: AccessTreeNode): string {
    return `${node.item.id ?? ''}-${node.item.link ?? node.item.label ?? ''}`;
  }

  private buildTree(allowedLinks: Set<string>): AccessTreeNode[] {
    const nodes = this.catalogMenu
      .filter((item) => !item.isTitle)
      .map((item) => this.toTreeNode(item, allowedLinks))
      .filter((node) => this.hasConfigurableAccess(node));

    this.updateNodesState(nodes);
    return nodes;
  }

  private toTreeNode(item: MenuItem, allowedLinks: Set<string>): AccessTreeNode {
    const children = (item.subItems ?? [])
      .filter((child) => !child.isTitle)
      .map((child) => this.toTreeNode(child, allowedLinks))
      .filter((node) => this.hasConfigurableAccess(node));

    return {
      item,
      checked: !!item.link && allowedLinks.has(this.normalizeLink(item.link)),
      indeterminate: false,
      children,
    };
  }

  private setChildrenChecked(node: AccessTreeNode, checked: boolean): void {
    for (const child of node.children) {
      child.checked = checked;
      child.indeterminate = false;
      this.setChildrenChecked(child, checked);
    }
  }

  private hasConfigurableAccess(node: AccessTreeNode): boolean {
    return !!node.item.link || node.children.length > 0;
  }

  private refreshTreeState(): void {
    this.updateNodesState(this.accessTree);
  }

  private updateNodesState(nodes: AccessTreeNode[]): void {
    for (const node of nodes) {
      this.updateNodesState(node.children);

      if (!node.children.length) {
        node.indeterminate = false;
        continue;
      }

      const checkedChildren = node.children.filter((child) => child.checked).length;
      const indeterminateChildren = node.children.some((child) => child.indeterminate);

      node.checked = checkedChildren === node.children.length;
      node.indeterminate = !node.checked && (checkedChildren > 0 || indeterminateChildren);
    }
  }

  private updateCheckedMenuCount(): void {
    this.checkedMenuCount = this.countCheckedLinks(this.accessTree);
  }

  private countCheckedLinks(nodes: AccessTreeNode[]): number {
    return nodes.reduce((total, node) => {
      const selfCount = node.item.link && node.checked ? 1 : 0;
      return total + selfCount + this.countCheckedLinks(node.children);
    }, 0);
  }

  private buildMenuFromTree(nodes: AccessTreeNode[]): MenuItem[] {
    return nodes
      .map((node) => this.buildMenuItemFromNode(node))
      .filter((item): item is MenuItem => !!item);
  }

  private buildMenuItemFromNode(node: AccessTreeNode): MenuItem | null {
    const children = this.buildMenuFromTree(node.children);
    const hasDirectAccess = !!node.item.link && node.checked;

    if (!hasDirectAccess && !children.length) {
      return null;
    }

    return {
      ...node.item,
      subItems: children.length ? children : undefined,
    };
  }

  private extractLinks(menu: MenuItem[]): Set<string> {
    const links = new Set<string>();

    const walk = (items: MenuItem[]) => {
      for (const item of items ?? []) {
        if (item.link) {
          links.add(this.normalizeLink(item.link));
        }

        if (item.subItems?.length) {
          walk(item.subItems);
        }
      }
    };

    walk(menu);
    return links;
  }

  private normalizeMenuLinks(items: MenuItem[]): MenuItem[] {
    const clone: MenuItem[] = JSON.parse(JSON.stringify(items || []));

    const walk = (arr: MenuItem[]) => {
      for (const item of arr) {
        if (item.link) {
          item.link = this.normalizeLink(item.link);
        }

        if (item.subItems?.length) {
          walk(item.subItems);
        }
      }
    };

    walk(clone);
    return clone;
  }

  private normalizeLink(link: string): string {
    const trimmed = link.trim();
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  private normalizeSearch(value?: string | null): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
