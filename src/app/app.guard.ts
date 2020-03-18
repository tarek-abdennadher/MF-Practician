import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';


@Injectable()
export class AuthGuard implements CanActivateChild {
  constructor(
    private router: Router,
    private localSt: LocalStorageService
  ) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const token = this.localSt.retrieve("token");
    if (token && token !== null) {
      return true;
  }
    this.router.navigate(['/login'], {
    queryParams: {
      return: state.url
    }
  });
    return false;
}
}
