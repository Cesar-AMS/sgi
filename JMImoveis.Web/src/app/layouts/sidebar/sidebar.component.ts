import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MenuItem } from './menu.model';
import { MENU } from './menu';
import { UserMenuService } from 'src/app/core/services/user-menu.service';
import { SessionService } from 'src/app/core/session/session.service';
import { PermissionService } from 'src/app/core/permissions/permission.service';

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
    private userMenuService: UserMenuService,
    private sessionService: SessionService,
    private permissionService: PermissionService,
    public translate: TranslateService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    const userId = this.sessionService.getCurrentUserId() ?? 0;

    this.userMenuService.getUserMenu(userId).subscribe((userMenu: MenuItem[] | any) => {
      const permissionState = this.permissionService.getCurrentPermissionState();
      const hasPermissionContext =
        permissionState.permissions.length > 0 || !!permissionState.profile;
      const normalizedDomainMenu = this.normalizeMenuLinks(MENU);

      // O menu do frontend passa a ser a fonte principal.
      // O filtro por permissão só entra quando houver contexto de perfil/permissão.
      this.menuItems = hasPermissionContext
        ? this.permissionService.filterSidebarMenu(normalizedDomainMenu)
        : normalizedDomainMenu;

      setTimeout(() => this.initActiveMenu(), 0);
    });

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

  toggleItem(event: any, item: any) {
    item.isOpen = !item.isOpen;
    const isCurrentMenuId = event.target.closest('a.nav-link');

    isCurrentMenuId.setAttribute('aria-expanded', item.isOpen.toString());

    if (item.isOpen) {
      this.menuItems.forEach((menuItem: any) => {
        if (menuItem !== item) {
          menuItem.isOpen = false;
          const otherMenuId = document.querySelector(`[data-menu-id="${menuItem.id}"]`);

          if (otherMenuId) {
            otherMenuId.setAttribute('aria-expanded', 'false');
          }
        }
      });
    }
  }

  toggleSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;

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

      if (event.target && event.target.nextElementSibling) {
        isCurrentMenuId.setAttribute('aria-expanded', 'true');
        event.target.nextElementSibling.classList.toggle('show');
      }
    }
  }

  toggleExtraSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
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

      if (event.target && event.target.nextElementSibling) {
        isCurrentMenuId.setAttribute('aria-expanded', 'true');
        event.target.nextElementSibling.classList.toggle('show');
      }
    }
  }

  toggleParentItem(event: any, item: any) {
    this.toggleItem(event, item);
    let isCurrentMenuId = event.target.closest('a.nav-link');
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
    item.classList.add('active');
    let parentCollapseDiv = item.closest('.collapse.menu-dropdown');
    if (parentCollapseDiv) {
      parentCollapseDiv.classList.add('show');
      parentCollapseDiv.parentElement.children[0].classList.add('active');
      parentCollapseDiv.parentElement.children[0].setAttribute('aria-expanded', 'true');
      if (parentCollapseDiv.parentElement.closest('.collapse.menu-dropdown')) {
        parentCollapseDiv.parentElement.closest('.collapse').classList.add('show');
        if (parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling) {
          parentCollapseDiv.parentElement
            .closest('.collapse')
            .previousElementSibling.classList.add('active');
        }
        if (
          parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling.closest(
            '.collapse'
          )
        ) {
          parentCollapseDiv.parentElement
            .closest('.collapse')
            .previousElementSibling.closest('.collapse')
            .classList.add('show');
          parentCollapseDiv.parentElement
            .closest('.collapse')
            .previousElementSibling.closest('.collapse')
            .previousElementSibling.classList.add('active');
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById('navbar-nav');
    if (ul) {
      const items = Array.from(ul.querySelectorAll('a.nav-link'));
      this.removeActivation(items);
    }

    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    const pathName = window.location.pathname;
    const ul = document.getElementById('navbar-nav');
    if (ul) {
      const items = Array.from(ul.querySelectorAll('a.nav-link'));
      let activeItems = items.filter((x: any) => x.classList.contains('active'));
      this.removeActivation(activeItems);

      let matchingMenuItem = items.find((x: any) => {
        return x.pathname === pathName;
      });

      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }

  hasItems(item: MenuItem): boolean {
    return Array.isArray(item?.subItems) && item.subItems.length > 0;
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
