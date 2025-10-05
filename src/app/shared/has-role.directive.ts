import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { UserRole } from '../core/models/user.model';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private roles: UserRole[] = [];

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthService
  ) {}

  @Input()
  set appHasRole(roleOrRoles: UserRole | UserRole[]) {
    this.roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    this.updateView();
  }

  private updateView(): void {
    const user = this.auth.currentUserValue;
    const canShow = user ? this.roles.includes(user.role) : false;
    this.vcr.clear();
    if (canShow) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
