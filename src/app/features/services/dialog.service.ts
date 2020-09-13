import { MatConfirmDialogComponent } from "./../mat-confirm-dialog/mat-confirm-dialog.component";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPatientFileDialogComponent } from '../mat-patient-file-dialog/mat-patient-file-dialog.component';

@Injectable({
  providedIn: "root"
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  openConfirmDialog(msg, titre) {
    return this.dialog.open(MatConfirmDialogComponent, {
      width: "410px",
      height: "auto",
      panelClass: "confirm-dialog-container",
      disableClose: true,
      position: { top: "250px" },
      data: {
        message: msg,
        title: titre
      }
    });
  }

  openPatientFile(title, info) {
    return this.dialog.open(MatPatientFileDialogComponent, {
      width: "1000px",
      height: "75%",
      panelClass: "patient-file-container",
      disableClose: true,
      position: { top: "120px" },
      data: {
        title: title,
        info: info
      },
    });
  }

}
