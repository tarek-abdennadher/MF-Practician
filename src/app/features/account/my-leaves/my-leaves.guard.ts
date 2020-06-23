import { Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    CanActivate,
} from "@angular/router";
import { Observable } from 'rxjs';
import * as decodeImported from 'jwt-decode';
import { AccountService } from '@app/features/services/account.service';
import { FeaturesService } from '@app/features/features.service';
const decode = decodeImported;
@Injectable()
export class MyLeavesGuard implements CanActivate {
    isAuthorized: boolean = false;
    constructor(private router: Router,
        private accountService: AccountService,
        private featureService: FeaturesService) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        this.accountService.getOptionById(this.featureService.getUserId()).subscribe((op) => {
            if (op != null && op.activateLeaveAutoMessage) {
                this.isAuthorized = true;
            }
            else {
                this.router.navigate(['/compte/mes-informations']);
            }
        });
        return this.isAuthorized;

    }
}
