import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";

@Injectable()
export class AuthGuard implements CanActivateChild {
  constructor(private router: Router, private localSt: LocalStorageService) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const token = this.localSt.retrieve("token");
    if (token && token !== null) {
      return true;
    }
    if (state.url == "/messagerie" || state.url == "messagerie") {
      this.router.navigate(["/connexion"]);
    } else {
      this.router.navigate(["/connexion"], {
        queryParams: {
          return: state.url,
        },
      });
    }
    return false;
  }
}
