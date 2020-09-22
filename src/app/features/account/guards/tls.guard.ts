import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { FeaturesService } from "@app/features/features.service";
import { AccountService } from "@app/features/services/account.service";
import { Observable } from "rxjs";

@Injectable()
export class TlsGuard implements CanActivate {
  practicianId: number;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private featureService: FeaturesService
  ) {
    this.practicianId = this.featureService.getUserId();
  }
  getPracticianTelesecretary(): boolean {
    this.accountService.getPracticianTelesecretary().subscribe((practician) => {
      if (practician && practician.group != null) {
        return true;
      }
    });
    return false;
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.getPracticianTelesecretary()) {
      this.router.navigate(["/compte/mes-informations"]);
    }
    return this.getPracticianTelesecretary();
  }
}
