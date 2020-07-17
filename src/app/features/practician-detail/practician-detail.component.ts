import { Component, OnInit } from "@angular/core";
import { PracticianDetailService } from "./practician-detail.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as jwt_decode from "jwt-decode";
import { LocalStorageService } from "ngx-webstorage";
import { Location } from "@angular/common";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { GlobalService } from '@app/core/services/global.service';
import {FeaturesService} from '@app/features/features.service';
@Component({
  selector: "app-practician-detail",
  templateUrl: "./practician-detail.component.html",
  styleUrls: ["./practician-detail.component.scss"],
})
export class PracticianDetailComponent implements OnInit {
  practician: any;
  imageSource: string;
  public isFavorite: boolean = false;
  page = "MY_PRACTICIANS";
  number = null;
  topText = "Détails du praticien";
  bottomText = "";
  backButton = true;
  isPractician = true;
  links = {};
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private practicianDetailService: PracticianDetailService,
    private localSt: LocalStorageService,
    private _location: Location,
    private documentService: MyDocumentsService,
    private featureService: FeaturesService,
    private globalService: GlobalService
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;

  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.isMyFAvorite(params["id"]);
      this.getPractician(params["id"]);
    });
    this.featureService.setIsMessaging(false);
  }
  getPractician(id) {
    this.practicianDetailService
      .getPracticiansById(id)
      .subscribe((response) => {
        this.bottomText = response.fullName;
        this.practician = response;
        if (this.practician.photoId) {
          this.documentService.downloadFile(this.practician.photoId).subscribe(
            (response) => {
              let myReader: FileReader = new FileReader();
              myReader.onloadend = (e) => {
                this.practician.img = myReader.result;
              };
              let ok = myReader.readAsDataURL(response.body);
            },
            (error) => {
              this.practician.img = this.avatars.user;
            }
          );
        } else {
          this.practician.img = this.avatars.doctor;
        }
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
    this.router.navigate(["/messagerie-ecrire"], {
      queryParams: {
        id: item.accountId,
      },
    });
  }
  BackButton() {
    this._location.back();
  }
}
