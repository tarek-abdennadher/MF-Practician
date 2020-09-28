import { Component, OnInit } from "@angular/core";
import { PracticianDetailService } from "./practician-detail.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from "@app/features/features.service";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { DomSanitizer } from "@angular/platform-browser";
import { NewMessageWidgetService } from "@app/features/new-message-widget/new-message-widget.service";
import { ContactsService } from "@app/features/services/contacts.service";
import { DialogService } from "@app/features/services/dialog.service";
import { Location } from "@angular/common";
@Component({
  selector: "app-practician-detail",
  templateUrl: "./practician-detail.component.html",
  styleUrls: ["./practician-detail.component.scss"],
})
export class PracticianDetailComponent implements OnInit {
  fromSearch: boolean = false;
  practician: any;
  imageSource: string;
  public isFavorite: boolean = false;
  public isArchive: boolean = false;
  isPractician = true;
  links = {};
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private practicianDetailService: PracticianDetailService,
    private localSt: LocalStorageService,
    private documentService: MyDocumentsService,
    private featureService: FeaturesService,
    private globalService: GlobalService,
    private sanitizer: DomSanitizer,
    private messageWidgetService: NewMessageWidgetService,
    private contactService: ContactsService,
    private dialogService: DialogService
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (params) => (this.fromSearch = params["search"] || false)
    );
    this.route.params.subscribe((params) => {
      this.isMyFAvorite(params["id"]);
      this.getPractician(params["id"]);
    });
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }
  getPractician(id) {
    this.practicianDetailService
      .getPracticiansById(id)
      .subscribe((response) => {
        if (this.localSt.retrieve("role") == "SECRETARY") {
          this.isArchive = true;
        }
        this.practician = response;
        this.documentService
          .getDefaultImage(this.practician.accountId)
          .subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.practician.img = this.sanitizer.bypassSecurityTrustUrl(
                  myReader.result as string
                );
              };
              let ok = myReader.readAsDataURL(response);
            },
            (error) => {
              this.practician.img = this.avatars.user;
            }
          );
      });
  }

  isMyFAvorite(id) {
    this.practicianDetailService
      .isPracticianFavorite(id)
      .subscribe((resp) => (this.isFavorite = resp));
  }
  addToFavoriteClicked() {
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      this.practicianDetailService
        .addPracticianToFavorite(this.practician.id)
        .subscribe((resp) => {
          if (resp == true) {
            this.isFavorite = true;
          }
        });
    } else if (this.localSt.retrieve("role") == "SECRETARY") {
      this.practicianDetailService
        .addPracticianToSecretaryContactPro(this.practician.id)
        .subscribe((resp) => {
          if (resp == true) {
            this.isFavorite = true;
          }
        });
    }
  }
  sendMessageClicked(item) {
    this.messageWidgetService.toggleObs.next(item.accountId);
  }
  archieveClicked(item) {
    let array = [];
    array.push(item.accountId);
    this.dialogService
      .openConfirmDialog(
        this.practicianDetailService.messages.delete_favorite_confirm,
        this.practicianDetailService.messages.delete_favorite
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.contactService
            .deleteMultiplePracticianContactPro(array)
            .subscribe((res) => {
              this.isFavorite = false;
              if (!this.fromSearch) {
                this.router.navigate(["/mes-contacts-pro"], {
                  queryParams: {
                    refresh: true,
                  },
                });
              }
            });
        }
      });
  }
}
