import { MatConfirmDialogComponent } from "./../mat-confirm-dialog/mat-confirm-dialog.component";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
  providedIn: "root",
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openConfirmDialog(msg, titre) {
    return this.dialog.open(MatConfirmDialogComponent, {
      width: "609px",
      height: "215px",
      panelClass: "confirm-dialog-container",
      disableClose: true,
      position: { top: "400px" },
      data: {
        message: msg,
        title: titre,
      },
    });
  }
}
