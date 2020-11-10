import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { GlobalService } from "@app/core/services/global.service";
import { DialogService } from "@app/features/services/dialog.service";

@Component({
  selector: "int-phone",
  templateUrl: "./int-phone.component.html",
  styleUrls: ["./int-phone.component.scss"]
})
export class IntPhoneComponent implements OnInit {
  public phoneForm: FormGroup;
  public errorMessage = "Le numéro de téléphone saisi est invalide";
  /* List of phone numbers to display */
  @Output("phones") phones = new EventEmitter();
  /* Boolean to check if the inserted numbers are valid or not to block actions of submit*/
  @Output("validPhones") validPhones = new EventEmitter<boolean>();
  /* List of exisiting phone numbers (patching the value)*/
  @Input("editList") set phonesToEdit(list: Array<any>) {
    this.phoneForm = this.formBuilder.group({
      phoneList: this.formBuilder.array([])
    });
    if (list && list.length > 0) {
      list.forEach(p => this.phoneList.push(this.updatePhone(p)));
    } 
  }
  /* Action to add a new phone*/
  @Input("addnewPhone") addnewPhone = new Subject();

  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private globalConfig: GlobalService,
    private dialogService: DialogService
  ) {}

  get phoneList() {
    return <FormArray>this.phoneForm.get("phoneList");
  }

  /* Method to add a new phone number field */
  newPhone(): FormGroup {
    this.validPhones.emit(false);
    return this.formBuilder.group({
      phoneNumber: ["", Validators.required],
      note: ""
    });
  }
  /* Method to update an exisiting phone number field */
  updatePhone(p): FormGroup {
    return this.formBuilder.group({
      id: [p.id ? p.id : null],
      phoneNumber: [p.phoneNumber ? p.phoneNumber : ""],
      note: [p.note ? p.note : ""]
    });
  }

  ngOnInit(): void {
    this.validPhones.emit(true);
    this.addnewPhone.subscribe(val => {
      if (val) {
        this.addPhone();
      }
    });
    this.phoneForm = this.formBuilder.group({
      phoneList: this.formBuilder.array([])
    });

    this.onChanges();
  }

  /* Method to add a new phone and a note while respecting the constraints */
  addPhone(): void {
    this.submitted = true;
    if (this.phoneForm.invalid) {
      this.validPhones.emit(false);
      return;
    }
    if (this.phoneList.length > 2) {
      return;
    }
    this.phoneList.push(this.newPhone());
  }
  /* Method to remove an exisiting phone number */
  removePhone(index) {
    this.dialogService
      .openConfirmDialog(
        this.globalConfig.messagesDisplayScreen.delete_confirmation_phone,
        "Suppression"
      )
      .afterClosed()
      .subscribe(res => {
        if (res) {
          if (this.phoneList.length == 1) {
            this.phoneList.removeAt(index);
            this.phoneForm = this.formBuilder.group({
              phoneList: this.formBuilder.array([this.newPhone()])
            });
            this.submitted = false;
            this.phoneForm.reset();
            this.phoneList.clear();
            this.validPhones.emit(true);
            return;
          }
          this.phoneList.removeAt(index);
          this.validPhones.emit(true);
        }
      });
  }

  onChanges(): void {
    this.phoneForm.valueChanges.subscribe(val => {
      this.phones.emit(this.phoneList);
    });
  }
  /* Method to emit changes constantly to main component */
  onValueChange(): void {
    if (this.phoneForm.invalid) {
      this.validPhones.emit(false);
    } else {
      this.validPhones.emit(true);
    }
    this.phoneForm.valueChanges.subscribe(val => {
      this.phones.emit(this.phoneList);
    });
  }
}
