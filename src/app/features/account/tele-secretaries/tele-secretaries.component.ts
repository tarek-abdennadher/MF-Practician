import { Component, OnDestroy, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { GlobalService } from "@app/core/services/global.service";
import { ContactsService } from "@app/features/services/contacts.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { FeaturesService } from "@app/features/features.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
  selector: "app-tele-secretaries",
  templateUrl: "./tele-secretaries.component.html",
  styleUrls: ["./tele-secretaries.component.scss"],
})
export class TeleSecretariesComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  public messages: any;
  public tls: any;
  public errors: any;
  public avatars: any;
  public imageSource: any;
  public image: string | ArrayBuffer | SafeUrl;
  public submitted = false;
  public labels: any;
  public infoForm: FormGroup;
  public hasImage = false;
  constructor(
    public accountService: AccountService,
    private globalService: GlobalService,
    private contactsService: ContactsService,
    private featureService: FeaturesService,
    private documentService: MyDocumentsService,
    private sanitizer: DomSanitizer
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
    this.errors = this.accountService.errors;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.secretary;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit(): void {
    this.initInfoForm();
    this.getTls();
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }

  getTls() {
    this.accountService
      .getPracticianTelesecretary()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((practician) => {
        this.tls = practician.group;
        this.infoForm.patchValue({
          id: this.tls.id,
          accountId: this.tls.accountId,
          title: this.tls.title,
          address: this.tls.address,
          city: this.tls.city,
          zipCode: this.tls.zipCode,
          additionalAddress: this.tls.additionalAddress,
          email: this.tls.email,
          phoneNumber: this.tls.phoneNumber,
          website: this.tls.website,
          photoId: this.tls.photoId,
          resp: this.tls.supervisor
            ? this.tls.supervisor.civility + " " + this.tls.supervisor.fullName
            : "",
        });

        this.hasImage = true;
        this.getPictureProfile(this.tls.accountId);
      });

    this.infoForm.disable();
  }

  get ctr() {
    return this.infoForm.controls;
  }

  initInfoForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      accountId: new FormControl(null),
      title: new FormControl(null),
      address: new FormControl(null),
      city: new FormControl(null),
      zipCode: new FormControl(null),
      additionalAddress: new FormControl(null),
      email: new FormControl(null),
      phoneNumber: new FormControl(null),
      website: new FormControl(null),
      photoId: new FormControl(null),
      resp: new FormControl(null),
    });
  }

  getPictureProfile(id) {
    this.documentService
      .getDefaultImage(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            this.image = this.sanitizer.bypassSecurityTrustUrl(
              myReader.result as string
            );
          };
          let ok = myReader.readAsDataURL(response);
        },
        (error) => {
          this.image = this.avatars.telesecretary;
        }
      );
  }
}
