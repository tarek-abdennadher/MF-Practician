import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'int-phone',
  templateUrl: './int-phone.component.html',
  styleUrls: ['./int-phone.component.scss']
})
export class IntPhoneComponent implements OnInit {
  public phoneForm: FormGroup;
  public errorMessage = "Le numéro de téléphone saisi est invalide";
  /* List of phone numbers to display */
  @Output("phones") phones = new EventEmitter();
  /* Boolean to check if the inserted numbers are valid or not to block actions of submit*/
  @Output("validPhones") validPhones = new EventEmitter<boolean>();
  /* List of exisiting phone numbers (patching the value)*/
  @Input("editList") phonesToEdit = new Subject<[]>();
  /* Action to add a new phone*/
  @Input("addnewPhone") addnewPhone = new Subject();

  public submitted = false;

  constructor(private formBuilder: FormBuilder) { }

  get phoneList() {
    return <FormArray>this.phoneForm.get("phoneList");
  }
  /* Method to add a new phone number field */
  newPhone(): FormGroup {
    this.validPhones.emit(false)
    return this.formBuilder.group({
      phoneNumber: ['', Validators.required],
      note: ''
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
    this.validPhones.emit(true)
    this.addnewPhone.subscribe(val => {
      if (val) {
        this.addPhone();
      }
    });
    this.phoneForm = this.formBuilder.group({
      phoneList: this.formBuilder.array([])
    });
    this.updateCSS();
    /* Patch list if contains elements */
    this.phonesToEdit.subscribe(list => {
      if (list) {
        this.updateCSS();
        list.forEach(p =>
          this.phoneList.push(this.updatePhone(p)));
      }
      /* Initialize list when there is no exisiting elements */
      else {
        this.updateCSS();
        this.phoneForm = this.formBuilder.group({
          phoneList: this.formBuilder.array([this.newPhone()])
        });
      }
    });
    this.onChanges();
  }

  /* Method to add a new phone and a note while respecting the constraints */
  addPhone(): void {
    this.submitted = true;
    if (this.phoneForm.invalid) {
      this.validPhones.emit(false)
      return;
    }
    if (this.phoneList.length > 2) {
      return;
    }
    this.updateCSS();
    this.phoneList.push(this.newPhone());
  }
  /* Method to remove an exisiting phone number */
  removePhone(index) {
    if (this.phoneList.length == 1) {
      this.updateCSS();
      this.phoneList.removeAt(index);
      this.phoneForm = this.formBuilder.group({
        phoneList: this.formBuilder.array([this.newPhone()])
      });
      this.submitted = false;
      this.phoneForm.reset();
      this.phoneList.clear();
      this.validPhones.emit(true)
      return;
    }
    this.phoneList.removeAt(index);
    this.validPhones.emit(true)
  }

  onChanges(): void {
    this.phoneForm.valueChanges.subscribe(val => {
      this.phones.emit(this.phoneList)
    });
  }
  /* Method to override CSS of the phone component */
  updateCSS() {
    $(document).ready(function () {
      $('.form-control').each(function () {
        $(this).css("background", "#F1F1F1")
        $(this).css("border-color", "#F1F1F1")
        $(this).css("padding", " 6px 6px 6px 6px")
      });
      $('.dropbtn.btn').each(function () {
        $(this).css("background", "#F1F1F1")
        $(this).css("border-color", "#F1F1F1")
        $(this).css("padding", "8px")
      });
    })
  }
  /* Method to emit changes constantly to main component */
  onValueChange(): void {
    if (this.phoneForm.invalid) {
      this.validPhones.emit(false)
    }
    else {
      this.validPhones.emit(true)
    }
    this.phoneForm.valueChanges.subscribe(val => {
      this.phones.emit(this.phoneList)
    });
  }
}
