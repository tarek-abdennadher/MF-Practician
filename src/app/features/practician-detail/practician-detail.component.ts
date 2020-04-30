import { Component, OnInit } from "@angular/core";
import { PracticianDetailService } from "./practician-detail.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as jwt_decode from "jwt-decode";
import { LocalStorageService } from "ngx-webstorage";
import { Location } from "@angular/common";
import { MyDocumentsService } from "../my-documents/my-documents.service";
@Component({
  selector: "app-practician-detail",
  templateUrl: "./practician-detail.component.html",
  styleUrls: ["./practician-detail.component.scss"],
})
export class PracticianDetailComponent implements OnInit {
  practician: any;
  imageSource: string = "assets/imgs/user.png";
  public isFavorite: boolean = false;
  page = "MY_PRACTICIANS";
  number = null;
  topText = "Détails du praticien";
  bottomText = "";
  backButton = true;
  isPractician = true;
  links = {};
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private practicianDetailService: PracticianDetailService,
    private localSt: LocalStorageService,
    private _location: Location,
    private documentService: MyDocumentsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.isMyFAvorite(params["id"]);
      this.getPractician(params["id"]);
    });
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
              this.practician.img = "assets/imgs/user.png";
            }
          );
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
