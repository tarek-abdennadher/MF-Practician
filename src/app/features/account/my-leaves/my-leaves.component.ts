import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsLocaleService } from "ngx-bootstrap/datepicker";
import { defineLocale, frLocale, isBefore } from "ngx-bootstrap/chronos";
import { FeaturesService } from '@app/features/features.service';
import { NotifierService } from 'angular-notifier';
declare var $: any;
@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {
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
  constructor(private service: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private featureService: FeaturesService,
    notifierService: NotifierService,
    @Inject(LOCALE_ID) public locale: string) {
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
  ngOnInit(): void {
    this.initLeaveForm();
    this.getOptionById();
    this.featureService.setIsMessaging(false);
  }

  initLeaveForm() {
    this.leavesForm = new FormGroup({
      leaveStartDate: new FormControl(null, Validators.required),
      leaveEndDate: new FormControl(null, Validators.required)
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
        leaveStartDate: new Date(op.leaveStartDate),
        leaveEndDate: new Date(op.leaveEndDate)
      })
    });
  }

  submit() {
    this.submitted = true;
    if (this.leavesForm.invalid) {
      return;
    }
    let leaveStartDate = this.leavesForm.value.leaveStartDate;
    let leaveEndDate = this.leavesForm.value.leaveEndDate;
    this.service.updateLeavesInOptionByPractician(leaveStartDate, leaveEndDate).subscribe((elm) => {
      if (elm) {
        this.notifMessage = this.service.messages.update_leaves_success;
        this.notifier.show({
          message: this.notifMessage,
          type: "info",
          template: this.customNotificationTmpl,
        });
      }
      else {
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
