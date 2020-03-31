import { Component, OnInit } from '@angular/core';
import { PracticianDetailService } from './practician-detail.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';
@Component({
  selector: 'app-practician-detail',
  templateUrl: './practician-detail.component.html',
  styleUrls: ['./practician-detail.component.scss']
})
export class PracticianDetailComponent implements OnInit {
  practician: any;
  imageSource: string = "assets/imgs/user.png";
  public isFavorite: boolean =  false;
  page = "MY_PRACTICIANS";
  number = null;
  topText = "Détails du praticien";
  bottomText = "";
  backButton = true;
  isPractician = true;
  links = {

  };
  constructor(private route: ActivatedRoute, private router: Router, private practicianDetailService: PracticianDetailService,
    private localSt: LocalStorageService,
    private _location: Location) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.getPractician(params["id"])
    });
  }
  getPractician(id) {
    this.practicianDetailService.getPracticiansById(id).subscribe(response => {
      this.bottomText = response.fullName;
      this.practician = response;
      this.getFavorite();
    });
  }
  getFavorite() {
    this.practicianDetailService.getFavoritePracticians().subscribe(resp => {
      if (resp.filter(a => a.id == this.practician.id).length >= 1) {
        this.isFavorite = true;
      }
    })
  }
  addToFavoriteClicked() {
    this.practicianDetailService.addPracticianToFavorite(this.practician.id).subscribe(resp => {
      if (resp == true) {
        this.isFavorite = true;
      }
    })
  }
  sendMessageClicked(item) {
    this.router.navigate(["/features/messagerie-ecrire/"]);
  }
  BackButton() {
    this._location.back();
  }
}
