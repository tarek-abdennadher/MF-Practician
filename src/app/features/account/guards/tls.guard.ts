import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AccountService } from "@app/features/services/account.service";

@Injectable()
export class TlsGuard implements CanActivate {
  practicianId: number;
  constructor(private router: Router, private accountService: AccountService) {}
  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      this.accountService.getPracticianTelesecretary().subscribe((pract) => {
        if (pract && pract.group != null) {
          resolve(true);
        } else {
          this.router.navigate(["/compte/mes-informations"]);
          resolve(false);
        }
      });
    });
  }
}
