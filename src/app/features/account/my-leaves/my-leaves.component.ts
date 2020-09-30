import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BsLocaleService } from "ngx-bootstrap/datepicker";
import { defineLocale, frLocale, isBefore } from "ngx-bootstrap/chronos";
import { FeaturesService } from "@app/features/features.service";
import { ComponentCanDeactivate } from "@app/features/component-can-deactivate";
import { FeaturesComponent } from "@app/features/features.component";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
declare var $: any;

@Component({
  selector: "app-my-leaves",
  templateUrl: "./my-leaves.component.html",
  styleUrls: ["./my-leaves.component.scss"],
})
export class MyLeavesComponent
  implements OnInit, ComponentCanDeactivate, OnDestroy {
  private _destroyed$ = new Subject();
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  public messages: any;
  public errors: any;
  public leavesForm: FormGroup;
  submitted: boolean;
  leaveStartDate: Date = null;
  leaveEndDate: Date = null;
  isInvalidDates: boolean;
  practicianId: number = null;
  notifMessage = "";
  constructor(
    private service: AccountService,
    private localeService: BsLocaleService,
    private featureService: FeaturesService,
    @Inject(LOCALE_ID) public locale: string,
    private featureComp: FeaturesComponent
  ) {
    defineLocale(this.locale, frLocale);
    this.localeService.use(this.locale);
    this.practicianId = this.featureService.getUserId();
    this.messages = this.service.messages;
    this.errors = this.service.errors;
    this.submitted = false;
    this.isInvalidDates = false;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  get f() {
    return this.leavesForm.controls;
  }
  canDeactivate(): boolean {
    return !this.leavesForm.dirty;
  }
  ngOnInit(): void {
    this.initLeaveForm();
    this.getOptionById();
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }

  initLeaveForm() {
    this.leavesForm = new FormGroup({
      activateLeaveAutoMessage: new FormControl(false),
      leaveStartDate: new FormControl(null),
      leaveEndDate: new FormControl(null),
      leaveAutoMessage: new FormControl(null),
    });
  }

  dateChange(date, type) {
    if (type == "start" && date) {
      this.leaveStartDate = new Date(date);
    }
    if (type == "end" && date) {
      this.leaveEndDate = new Date(date);
    }
    if (this.leaveStartDate != null && this.leaveStartDate != null) {
      if (isBefore(this.leaveEndDate, this.leaveStartDate)) {
        this.isInvalidDates = true;
        $("#isInvalidDates").alert();
        this.leavesForm.setErrors({ invalid: true });
      }
    }
  }
  getOptionById() {
    this.service
      .getOptionById(this.practicianId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((op) => {
        this.leavesForm.patchValue({
          activateLeaveAutoMessage: op.activateLeaveAutoMessage,
          leaveStartDate: op.leaveStartDate
            ? new Date(op.leaveStartDate)
            : null,
          leaveEndDate: op.leaveEndDate ? new Date(op.leaveEndDate) : null,
          leaveAutoMessage: op.leaveAutoMessage ? op.leaveAutoMessage : null,
        });
        if (op.activateLeaveAutoMessage === true) {
          this.setRequiredValidator();
        }
      });
  }

  submit() {
    this.submitted = true;
    if (this.leavesForm.invalid) {
      return;
    }
    this.leavesForm.markAsPristine();
    let model = {
      activateLeaveAutoMessage: this.leavesForm.value.activateLeaveAutoMessage,
      leaveStartDate: this.leavesForm.value.leaveStartDate,
      leaveEndDate: this.leavesForm.value.leaveEndDate,
      leaveAutoMessage: this.leavesForm.value.leaveAutoMessage,
    };
    this.service
      .updateLeavesInOptionByPractician(model)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((elm) => {
        if (elm) {
          this.featureComp.setNotif(
            this.service.messages.update_leaves_success
          );
        } else {
          this.featureComp.setNotif(this.service.messages.update_leaves_fail);
          return;
        }
      });
  }
  close() {
    this.isInvalidDates = false;
  }
  isInvalidDate(event) {
    let test = event.target.value;

    if (test == "Invalid date") {
      event.target.value = this.errors.invalid_date;
    }
  }
  setRequiredValidator() {
    if (this.f.activateLeaveAutoMessage.value) {
      this.f.leaveStartDate.setValidators(Validators.required);
      this.f.leaveEndDate.setValidators(Validators.required);
      this.f.leaveAutoMessage.setValidators(Validators.required);
      this.f.leaveStartDate.updateValueAndValidity();
      this.f.leaveEndDate.updateValueAndValidity();
      this.f.leaveAutoMessage.updateValueAndValidity();
    } else {
      this.f.leaveStartDate.clearValidators();
      this.f.leaveEndDate.clearValidators();
      this.f.leaveAutoMessage.clearValidators();
      this.f.leaveStartDate.updateValueAndValidity();
      this.f.leaveEndDate.updateValueAndValidity();
      this.f.leaveAutoMessage.updateValueAndValidity();
    }
  }
}
