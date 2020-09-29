import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { AccountService } from "@app/features/services/account.service";
import { LocalStorageService } from "ngx-webstorage";
import { FeaturesService } from "@app/features/features.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ContactBookService } from "@app/features/services/contact-book.service";
import { DialogService } from "@app/features/services/dialog.service";
import { NotifierService } from "angular-notifier";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
  selector: "app-my-contacts",
  templateUrl: "./my-contacts.component.html",
  styleUrls: ["./my-contacts.component.scss"],
})
export class MyContactsComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  public labels: any;
  errorMessage = "";
  successMessage = "";
  users: Array<any>;
  itemsList: Array<any> = [];
  public imageSource;
  public practicianId;
  private readonly notifier: NotifierService;
  constructor(
    private globalService: GlobalService,
    private accountService: AccountService,
    private localSt: LocalStorageService,
    private featureService: FeaturesService,
    private router: Router,
    private route: ActivatedRoute,
    private contactBookService: ContactBookService,
    private dialogService: DialogService,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
    this.labels = this.accountService.messages;
    this.imageSource = this.globalService.avatars.user;
    this.practicianId = this.featureService.getUserId();
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit(): void {
    this.getMyContacts();
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }

  getMyContacts() {
    this.contactBookService
      .getAllContactBookByPracticianId(this.practicianId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((contacts) => {
        this.users = contacts;
        this.itemsList = this.users.map((elm) => this.parseContact(elm));
      });
  }
  parseContact(contact): any {
    let parsedContact = {
      id: contact.id,
      isSeen: true,
      users: [
        {
          id: contact.id,
          fullName: contact.firstName + " " + contact.lastName,
          type: "CONTACT-BOOK",
          fonction: contact?.fonction,
          img: this.globalService.avatars.user,
        },
      ],
      object: {
        name: contact.email,
      },
      isArchieve: true,
      isImportant: false,
      hasFiles: false,
      isViewDetail: true,
      isMarkAsSeen: false,
      isChecked: false,
      photoId: null,
    };
    return parsedContact;
  }

  cardClicked(contact) {
    this.router.navigate([`${contact.id}`], { relativeTo: this.route });
  }

  addAction() {
    this.router.navigate([`add`], { relativeTo: this.route });
  }

  delete(event) {
    this.dialogService
      .openConfirmDialog(
        this.contactBookService.messages.delete_contact_confirm,
        this.contactBookService.messages.delete_contact
      )
      .afterClosed()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        if (res) {
          this.contactBookService
            .deleteContactBook(event.id)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(() => {
              this.itemsList = this.itemsList.filter(
                (elm) => elm.id != event.id
              );
            });
        }
      });
  }
}
