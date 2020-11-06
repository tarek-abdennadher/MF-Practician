import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { FeaturesService } from "@app/features/features.service";
import { AccountService } from "@app/features/services/account.service";

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

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      this.accountService.getOptionById(this.practicianId).subscribe((op) => {
        if (op && op.id) {
          resolve(true);
        } else {
          this.router.navigate(["/compte/mes-informations"]);
          resolve(false);
        }
      });
    });
  }
}
