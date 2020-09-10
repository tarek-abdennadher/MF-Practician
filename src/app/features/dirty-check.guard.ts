import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanDeactivate,
} from "@angular/router";
import { Observable } from "rxjs";
import { ComponentCanDeactivate } from "./component-can-deactivate";
import { DialogService } from "./services/dialog.service";
import { take, first } from "rxjs/operators";
@Injectable({
  providedIn: "root",
})
export class DirtyCheckGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(private dialogService: DialogService) {}
  canDeactivate(
    component: ComponentCanDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    if (component.canDeactivate()) {
      return true;
    } else {
      return this.dialogService
        .openConfirmDialog(
          "Vous avez des changements non enregistrés, Continuer ?",
          "Changements non enregistrés"
        )
        .afterClosed()
        .pipe(first());
    }
  }
}
