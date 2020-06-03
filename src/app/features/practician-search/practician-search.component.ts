import { Component, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { PracticianSearchService } from "./practician-search.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PracticianSearch } from "./practician-search.model";
import { search } from "./search.model";
import { FeaturesService } from "../features.service";
import { LocalStorageService } from "ngx-webstorage";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { GlobalService } from '@app/core/services/global.service';

@Component({
  selector: "app-practician-search",
  templateUrl: "./practician-search.component.html",
  styleUrls: ["./practician-search.component.scss"],
})
export class PracticianSearchComponent implements OnInit {
  imageSource : string;
  itemsList = [];
  page = "SEARCH";
  number = 0;
  topText = "Résultats de recherche";
  bottomText = "résultat";
  backButton = false;
  text: string;
  city: string;
  links = {};
  texts: any;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private practicianSearchService: PracticianSearchService,
    private featureService: FeaturesService,
    private localSt: LocalStorageService,
    private documentService: MyDocumentsService,
    private globalService: GlobalService
  ) {
    this.texts = practicianSearchService.texts;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;

  }

  ngOnInit(): void {
    this.practicianSearchService.currentSearch.subscribe((data: search) => {
      this.text = data.text;
      this.city = data.city;
      this.getPractians(data.text, data.city);
    });
  }
  getPractians(text, city) {
    if (!text && !city) {
      this.practicianSearchService.getAllPracticians().subscribe((list) => {
        if (this.localSt.retrieve("role") == "PRACTICIAN") {
          list = list.filter(
            (a) => a.accountId != this.featureService.getUserId()
          );
        }
        this.itemsList = [];
        this.number = list.length;
        this.bottomText = this.number > 1 ? "résultats" : "résultat";
        list.forEach((message) => {
          let practician = this.mappingPracticians(message);
          this.itemsList.push(practician);
        });
        this.itemsList.forEach((item) => {
          if (item.photoId) {
            item.users.forEach((user) => {
              this.documentService.downloadFile(item.photoId).subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    user.img = myReader.result;
                  };
                  let ok = myReader.readAsDataURL(response.body);
                },
                (error) => {
                  user.img = this.avatars.user;
                }
              );
            });
          } else {
            item.users.forEach((user) => {
              if (user.type == "MEDICAL") {
                user.img = this.avatars.doctor;
              } else if (user.type == "SECRETARY") {
                user.img = this.avatars.secretary;
              }
            });
          }
        });
      });
    } else if (!text && city) {
      this.practicianSearchService
        .getPracticiansByCity(city)
        .subscribe((list) => {
          if (this.localSt.retrieve("role") == "PRACTICIAN") {
            list = list.filter(
              (a) => a.accountId != this.featureService.getUserId()
            );
          }
          this.itemsList = [];
          this.number = list.length;
          this.bottomText = this.number > 1 ? "résultats" : "résultat";
          list.forEach((message) => {
            let practician = this.mappingPracticians(message);
            this.itemsList.push(practician);
          });
          this.itemsList.forEach((item) => {
            if (item.photoId) {
              item.users.forEach((user) => {
                this.documentService.downloadFile(item.photoId).subscribe(
                  (response) => {
                    let myReader: FileReader = new FileReader();
                    myReader.onloadend = (e) => {
                      user.img = myReader.result;
                    };
                    let ok = myReader.readAsDataURL(response.body);
                  },
                  (error) => {
                    user.img = this.avatars.user;
                  }
                );
              });
            }
          });
        });
    } else {
      this.practicianSearchService
        .getPracticiansBytextAndCity(text, city == undefined ? "" : city)
        .subscribe((list) => {
          if (this.localSt.retrieve("role") == "PRACTICIAN") {
            list = list.filter(
              (a) => a.accountId != this.featureService.getUserId()
            );
          }
          this.itemsList = [];
          this.number = list.length;
          this.bottomText = this.number > 1 ? "résultats" : "résultat";
          list.forEach((message) => {
            let practician = this.mappingPracticians(message);
            this.itemsList.push(practician);
          });
          this.itemsList.forEach((item) => {
            if (item.photoId) {
              item.users.forEach((user) => {
                this.documentService.downloadFile(item.photoId).subscribe(
                  (response) => {
                    let myReader: FileReader = new FileReader();
                    myReader.onloadend = (e) => {
                      user.img = myReader.result;
                    };
                    let ok = myReader.readAsDataURL(response.body);
                  },
                  (error) => {
                    user.img = this.avatars.user;
                  }
                );
              });
            }
          });
        });
    }
  }
  edit() {
    this.featureService.changeSearch(new search(this.text, this.city));
    jQuery(document).ready(function (e) {
      jQuery(this).find("#dropdownMenuLinkSearch").trigger("click");
    });
  }
  mappingPracticians(message) {
    const practician = new PracticianSearch();
    practician.id = message.id;
    practician.isSeen = true;
    practician.users = [
      {
        fullName: message.fullName,
        img: this.avatars.user,
        title: message.title,
        type: "MEDICAL",
        civility: null,
      },
    ];
    practician.photoId = message.photoId;
    practician.object = {
      name: message.address,
      isImportant: false,
      isLocalisation: true,
    };
    practician.time = null;
    practician.isImportant = false;
    practician.hasFiles = false;
    practician.isViewDetail = true;
    practician.isChecked = false;
    return practician;
  }
  cardClicked(item) {
    this.router.navigate(["/praticien-detail/" + item.id]);
  }
  selectItem(event) {
    this.itemsList.forEach((a) => {
      if (event.filter((b) => b.id == a.id).length >= 1) {
        a.isChecked = true;
      } else {
        a.isChecked = false;
      }
    });
  }
  return() {
    this.router.navigate(["/messagerie"]);
  }
  sendInvitation() {
    this.router.navigate(["/praticien-invitation"]);
  }
}
