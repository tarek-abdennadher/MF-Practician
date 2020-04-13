import { Component, OnInit } from "@angular/core";
import { PracticianDetailService } from "./practician-detail.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as jwt_decode from "jwt-decode";
import { LocalStorageService } from "ngx-webstorage";
import { Location } from "@angular/common";
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
    private _location: Location
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
    this.router.navigate(["/features/messagerie-ecrire"], {
      queryParams: {
        id: item.accountId,
      },
    });
  }
  BackButton() {
    this._location.back();
  }
}
