import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'int-phone',
  templateUrl: './int-phone.component.html',
  styleUrls: ['./int-phone.component.scss']
})
export class IntPhoneComponent implements OnInit {
  public phoneForm: FormGroup;
  @Output("phones") phones = new EventEmitter();

  @Input("editList") phonesToEdit = new Subject<[]>();
  constructor(private formBuilder: FormBuilder) { }
  get phoneList() {
    return <FormArray>this.phoneForm.get("phoneList");
  }
  newPhone(): FormGroup {
    return this.formBuilder.group({
      phoneNumber: '',
      note: ''
    });
  }

  updatePhone(p): FormGroup {
    return this.formBuilder.group({
      id: [p.id ? p.id : null],
      phoneNumber: [p.phoneNumber ? p.phoneNumber : ""],
      note: [p.note ? p.note : ""]
    });
  }
  ngOnInit(): void {
    this.phoneForm = this.formBuilder.group({
      phoneList: this.formBuilder.array([])
    });
    this.updateCSS();
    this.phonesToEdit.subscribe(list => {
      if (list) {
        this.updateCSS();
        list.forEach(p =>
          this.phoneList.push(this.updatePhone(p)));
      }
      else {
        this.phoneForm = this.formBuilder.group({
          phoneList: this.formBuilder.array([this.newPhone()])
        });
      }
    });
    this.onChanges();
  }
  addPhone(): void {
    if (this.phoneList.length > 2) {
      return;
    }
    this.updateCSS();
    this.phoneList.push(this.newPhone());
  }
  removePhone(index) {
    if (this.phoneList.length == 1) {
      this.updateCSS();
      this.phoneList.removeAt(index);
      this.phoneForm = this.formBuilder.group({
        phoneList: this.formBuilder.array([this.newPhone()])
      });
      return;
    }
    this.phoneList.removeAt(index);
  }

  onChanges(): void {
    this.phoneForm.valueChanges.subscribe(val => {
      this.phones.emit(this.phoneList)
    });
  }

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
}
