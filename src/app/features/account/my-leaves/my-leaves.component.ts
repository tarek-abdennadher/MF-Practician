import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import {
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BsLocaleService } from "ngx-bootstrap/datepicker";
import { defineLocale, frLocale, isBefore } from "ngx-bootstrap/chronos";
import { FeaturesService } from "@app/features/features.service";
import { NotifierService } from "angular-notifier";
import { ComponentCanDeactivate } from "@app/features/component-can-deactivate";
declare var $: any;

@Component({
  selector: "app-my-leaves",
  templateUrl: "./my-leaves.component.html",
  styleUrls: ["./my-leaves.component.scss"],
})
export class MyLeavesComponent implements OnInit, ComponentCanDeactivate {
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  public messages: any;
  public leavesForm: FormGroup;
  submitted: boolean;
  leaveStartDate: Date = null;
  leaveEndDate: Date = null;
  isInvalidDates: boolean;
  practicianId: number = null;
  notifMessage = "";
  private readonly notifier: NotifierService;
  constructor(
    private service: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private featureService: FeaturesService,
    notifierService: NotifierService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    defineLocale(this.locale, frLocale);
    this.localeService.use(this.locale);
    this.notifier = notifierService;
    this.practicianId = this.featureService.getUserId();
    this.messages = this.service.messages;
    this.submitted = false;
    this.isInvalidDates = false;
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
    this.featureService.setIsMessaging(false);
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
    this.service.getOptionById(this.practicianId).subscribe((op) => {
      this.leavesForm.patchValue({
        activateLeaveAutoMessage: op.activateLeaveAutoMessage,
        leaveStartDate: op.leaveStartDate ? new Date(op.leaveStartDate) : null,
        leaveEndDate: op.leaveEndDate ? new Date(op.leaveEndDate) : null,
        leaveAutoMessage: op.leaveAutoMessage ? op.leaveAutoMessage : null,
      });
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
    this.service.updateLeavesInOptionByPractician(model).subscribe((elm) => {
      if (elm) {
        this.notifMessage = this.service.messages.update_leaves_success;
        this.notifier.show({
          message: this.notifMessage,
          type: "info",
          template: this.customNotificationTmpl,
        });
      } else {
        this.notifMessage = this.service.messages.update_leaves_fail;
        this.notifier.show({
          message: this.notifMessage,
          type: "error",
          template: this.customNotificationTmpl,
        });
        return;
      }
    });
  }
  close() {
    this.isInvalidDates = false;
  }
}
