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
export class LeavesGuard implements CanActivate {
  practicianId: number;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private featureService: FeaturesService
  ) {
    this.practicianId = this.featureService.getUserId();
  }
  getOptionById(): boolean {
    this.accountService.getOptionById(this.practicianId).subscribe((op) => {
      if (op && op.id != null) {
        return true;
      }
    });
    return false;
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.getOptionById()) {
      this.router.navigate(["/compte/mes-informations"]);
    }
    return this.getOptionById();
  }
}
