import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MenuItem } from './menu.model';
import { MENU } from './menu';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  menu: any;
  toggle: any = true;
  menuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();
  lastroute: any;

  constructor(
    private router: Router,
    private permissionsService: PermissionsService,
    private sessionService: SessionService,
    public translate: TranslateService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.loadMenuWithPermissionState();

    this.router.events.subscribe((event) => {
      if (
        document.documentElement.getAttribute('data-layout') == 'vertical' ||
        document.documentElement.getAttribute('data-layout') == 'horizontal'
      ) {
        if (event instanceof NavigationEnd) {
          this.initActiveMenu();
          this.SidebarHide();
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 0);
  }

  private loadMenuWithPermissionState(): void {
    const userId = this.resolveCurrentUserId();

    if (!userId) {
      this.applySafeMenuFallback();
      return;
    }

    this.permissionsService.getUserEffectivePermissions(userId).subscribe({
      next: (permissions) => {
        this.menuItems = this.applyPermissionStateToMenu(permissions);
        setTimeout(() => this.initActiveMenu(), 0);
      },
      error: (err) => {
        console.warn('Nao foi possivel carregar permissoes efetivas. Menu ocultado por seguranca.', err);
        this.applySafeMenuFallback();
      },
    });
  }

  private normalizeSubItems(items: MenuItem[]): MenuItem[] {
    const clone: MenuItem[] = JSON.parse(JSON.stringify(items || []));

    const walk = (arr: MenuItem[]) => {
      for (const it of arr) {
        if (it.subItems === null) {
          it.subItems = undefined;
        }

        if (it.link && !it.link.startsWith('/')) {
          it.link = '/' + it.link;
        }

        if (Array.isArray(it.subItems)) {
          walk(it.subItems);
        }
      }
    };

    walk(clone);
    return clone;
  }

  private normalizeMenuLinks(items: MenuItem[]): MenuItem[] {
    const clone: MenuItem[] = JSON.parse(JSON.stringify(items || []));

    const walk = (arr: MenuItem[]) => {
      for (const it of arr) {
        if (it.link && !it.link.startsWith('/')) {
          it.link = '/' + it.link;
        }
        if (it.subItems?.length) {
          walk(it.subItems);
        }
      }
    };

    walk(clone);
    return clone;
  }

  private applyPermissionStateToMenu(permissions: Permission[] | null | undefined): MenuItem[] {
    const officialMenu = this.normalizeMenuLinks(MENU);
    const permissionKeys = this.extractPermissionKeys(permissions);

    if (permissionKeys.has('sistema.admin.total')) {
      return officialMenu;
    }

    return this.markPermissionDisabledItems(officialMenu, permissionKeys);
  }

  private markPermissionDisabledItems(items: MenuItem[], permissionKeys: Set<string>): MenuItem[] {
    return items.map((item) => {
      const subItems = item.subItems?.length
        ? this.markPermissionDisabledItems(item.subItems, permissionKeys)
        : undefined;
      const permissionDisabled = this.shouldDisableByPermission(item, permissionKeys);

      return {
        ...item,
        subItems,
        permissionDisabled,
      };
    });
  }

  private shouldDisableByPermission(item: MenuItem, permissionKeys: Set<string>): boolean {
    if (item.isTitle || item.alwaysVisible) {
      return false;
    }

    if (item.permissionKey) {
      return !permissionKeys.has(item.permissionKey);
    }

    if (item.permissionKeys?.length) {
      return !item.permissionKeys.some((permissionKey) => permissionKeys.has(permissionKey));
    }

    return false;
  }

  private extractPermissionKeys(permissions: Permission[] | null | undefined): Set<string> {
    const keys = new Set<string>();

    for (const permission of permissions ?? []) {
      const key = permission.permissionKey ?? permission.permission_key;
      if (key) {
        keys.add(key);
      }
    }

    return keys;
  }

  private applySafeMenuFallback(): void {
    this.menuItems = [];
    setTimeout(() => this.initActiveMenu(), 0);
  }

  private resolveCurrentUserId(): number | null {
    const sessionUserId = this.sessionService.getCurrentUserId();
    if (sessionUserId) {
      return sessionUserId;
    }

    const storedUserId =
      this.extractUserIdFromStorage('currentUser') ??
      this.extractUserIdFromStorage('authUser');

    if (storedUserId) {
      return storedUserId;
    }

    return this.extractUserIdFromToken(localStorage.getItem('token'));
  }

  private extractUserIdFromStorage(key: string): number | null {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }

    try {
      const user = JSON.parse(raw);
      return this.normalizeUserId(
        user?.id ??
        user?.Id ??
        user?.userId ??
        user?.user_id ??
        user?.sub
      );
    } catch {
      return null;
    }
  }

  private extractUserIdFromToken(token: string | null): number | null {
    if (!token) {
      return null;
    }

    const normalizedToken = token.replace(/^Bearer\s+/i, '').trim();
    const payload = normalizedToken.split('.')[1];

    if (!payload) {
      return null;
    }

    try {
      const json = JSON.parse(atob(this.toBase64(payload)));
      return this.normalizeUserId(
        json?.id ??
        json?.Id ??
        json?.userId ??
        json?.user_id ??
        json?.nameid ??
        json?.sub
      );
    } catch {
      return null;
    }
  }

  private normalizeUserId(value: unknown): number | null {
    const id = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private toBase64(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    return padding ? base64 + '='.repeat(4 - padding) : base64;
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      if (item.classList.contains('menu-link')) {
        if (!item.classList.contains('active')) {
          item.setAttribute('aria-expanded', false);
        }
        item.nextElementSibling ? item.nextElementSibling.classList.remove('show') : null;
      }
      if (item.classList.contains('nav-link')) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove('show');
        }
        item.setAttribute('aria-expanded', false);
      }
      item.classList.remove('active');
    });
  }

  toggleItem(event: Event, item: MenuItem): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isDisabled(item) || !this.hasItems(item)) {
      return;
    }

    this.menuItems.forEach((menuItem: MenuItem) => {
      if (menuItem !== item) {
        menuItem.isOpen = false;
      }
    });

    item.isOpen = true;
  }

  toggleSubItem(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const isCurrentMenuId = event.target.closest('a.nav-link') as HTMLElement | null;
    const isMenu = isCurrentMenuId?.nextElementSibling as HTMLElement | null;

    if (!isCurrentMenuId || !isMenu) {
      return;
    }

    if (isCurrentMenuId.classList.contains('menu-disabled')) {
      return;
    }

    if (isMenu.classList.contains('show')) {
      isMenu.classList.remove('show');
      isCurrentMenuId.setAttribute('aria-expanded', 'false');
    } else {
      let dropDowns = Array.from(document.querySelectorAll('.sub-menu'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });
      let subDropDowns = Array.from(document.querySelectorAll('.menu-dropdown .nav-link'));
      subDropDowns.forEach((submenu: any) => {
        submenu.setAttribute('aria-expanded', 'false');
      });

      if (isMenu) {
        isCurrentMenuId.setAttribute('aria-expanded', 'true');
        isMenu.classList.toggle('show');
      }
    }
  }

  toggleExtraSubItem(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const isCurrentMenuId = event.target.closest('a.nav-link') as HTMLElement | null;
    const isMenu = isCurrentMenuId?.nextElementSibling as HTMLElement | null;

    if (!isCurrentMenuId || !isMenu) {
      return;
    }

    if (isCurrentMenuId.classList.contains('menu-disabled')) {
      return;
    }

    if (isMenu.classList.contains('show')) {
      isMenu.classList.remove('show');
      isCurrentMenuId.setAttribute('aria-expanded', 'false');
    } else {
      let dropDowns = Array.from(document.querySelectorAll('.extra-sub-menu'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });

      let subDropDowns = Array.from(document.querySelectorAll('.menu-dropdown .nav-link'));
      subDropDowns.forEach((submenu: any) => {
        submenu.setAttribute('aria-expanded', 'false');
      });

      if (isMenu) {
        isCurrentMenuId.setAttribute('aria-expanded', 'true');
        isMenu.classList.toggle('show');
      }
    }
  }

  toggleParentItem(event: any, item: any) {
    this.toggleItem(event, item);
    let isCurrentMenuId = event.target.closest('a.nav-link');
    if (!isCurrentMenuId) {
      return;
    }
    let dropDowns = Array.from(document.querySelectorAll('#navbar-nav .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });
    const ul = document.getElementById('navbar-nav');
    if (ul) {
      const iconItems = Array.from(ul.getElementsByTagName('a'));
      let activeIconItems = iconItems.filter((x: any) => x.classList.contains('active'));
      activeIconItems.forEach((item: any) => {
        item.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
      });
    }
    isCurrentMenuId.setAttribute('aria-expanded', 'true');
    if (isCurrentMenuId) {
      this.activateParentDropdown(isCurrentMenuId);
    }
  }

  activateParentDropdown(item: any) {
    if (!item) {
      return false;
    }

    item.classList.add('active');
    const parentCollapseDiv = item.closest('.collapse.menu-dropdown') as HTMLElement | null;

    if (parentCollapseDiv) {
      parentCollapseDiv.classList.add('show');

      const parentElement = parentCollapseDiv.parentElement;
      const parentLink = parentElement?.children?.[0] as HTMLElement | undefined;
      parentLink?.classList.add('active');
      parentLink?.setAttribute('aria-expanded', 'true');

      const outerCollapse = parentElement?.closest('.collapse.menu-dropdown') as HTMLElement | null;
      if (outerCollapse) {
        outerCollapse.classList.add('show');

        const outerTrigger = outerCollapse.previousElementSibling as HTMLElement | null;
        outerTrigger?.classList.add('active');
        outerTrigger?.setAttribute('aria-expanded', 'true');

        const topCollapse = outerTrigger?.closest('.collapse') as HTMLElement | null;
        topCollapse?.classList.add('show');

        const topTrigger = topCollapse?.previousElementSibling as HTMLElement | null;
        topTrigger?.classList.add('active');
        topTrigger?.setAttribute('aria-expanded', 'true');
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const target = (event.target as HTMLElement | null)?.closest('a.nav-link') as HTMLElement | null;
    this.keepParentMenuOpen(target);

    const ul = document.getElementById('navbar-nav');
    if (ul) {
      const items = Array.from(ul.querySelectorAll('a.nav-link'));
      this.removeActivation(items);
    }

    this.activateParentDropdown(target);
    this.keepParentMenuOpen(target);
  }

  private keepParentMenuOpen(target: HTMLElement | null): void {
    const parentId = Number(target?.getAttribute('data-parent'));
    if (!Number.isFinite(parentId) || parentId <= 0) {
      return;
    }

    const topParent = this.menuItems.find((menuItem: MenuItem) =>
      menuItem.id === parentId || this.itemContainsId(menuItem, parentId)
    );

    this.menuItems.forEach((menuItem: MenuItem) => {
      menuItem.isOpen = menuItem === topParent;
    });
  }

  private itemContainsId(item: MenuItem, id: number): boolean {
    return (item.subItems || []).some((subItem) =>
      subItem.id === id || this.itemContainsId(subItem, id)
    );
  }

  initActiveMenu(): void {
    const pathName = window.location.pathname;

    this.menuItems.forEach((item: MenuItem) => {
      item.isOpen = this.itemContainsRoute(item, pathName);
    });

    const ul = document.getElementById('navbar-nav');
    if (!ul) {
      return;
    }

    const items = Array.from(ul.querySelectorAll('a.nav-link'));
    const activeItems = items.filter((x: any) => x.classList.contains('active'));
    this.removeActivation(activeItems);

    const matchingMenuItem = items.find((x: any) => x.pathname === pathName);

    if (matchingMenuItem) {
      this.activateParentDropdown(matchingMenuItem);
    }
  }

  private itemContainsRoute(item: MenuItem, pathName: string): boolean {
    if (item.link === pathName) {
      return true;
    }

    if (!item.subItems?.length) {
      return false;
    }

    return item.subItems.some((subItem) => this.itemContainsRoute(subItem, pathName));
  }

  hasItems(item: MenuItem): boolean {
    return Array.isArray(item?.subItems) && item.subItems.length > 0;
  }

  isDisabled(item: MenuItem | undefined | null): boolean {
    return !!item?.disabled || !!item?.permissionDisabled;
  }

  isPermissionDisabled(item: MenuItem | undefined | null): boolean {
    return !!item?.permissionDisabled;
  }

  blockNavigation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute('data-sidebar-size');
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }
}
