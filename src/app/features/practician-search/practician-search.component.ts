import { Component, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { PracticianSearchService } from "./practician-search.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PracticianSearch } from "./practician-search.model";
import { search } from "./search.model";
import { FeaturesService } from "../features.service";
import { LocalStorageService } from "ngx-webstorage";

@Component({
  selector: "app-practician-search",
  templateUrl: "./practician-search.component.html",
  styleUrls: ["./practician-search.component.scss"]
})
export class PracticianSearchComponent implements OnInit {
  imageSource = "assets/imgs/IMG_3944.jpg";
  itemsList = [];
  page = "SEARCH";
  number = 0;
  topText = "Résultats de recherche";
  bottomText = "résultats";
  backButton = false;
  text: string;
  city: string;
  links = {};
  texts: any;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private practicianSearchService: PracticianSearchService,
    private featureService: FeaturesService,
    private localSt: LocalStorageService
  ) {
    this.texts = practicianSearchService.texts;
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
      this.practicianSearchService.getAllPracticians().subscribe(list => {
        if (this.localSt.retrieve("role") == "PRACTICIAN") {
          list = list.filter(
            a => a.accountId != this.featureService.getUserId()
          );
        }
        this.itemsList = [];
        this.number = list.length;
        list.forEach(message => {
          let practician = this.mappingPracticians(message);
          this.itemsList.push(practician);
        });
      });
    } else if (!text && city) {
      this.practicianSearchService
        .getPracticiansByCity(city)
        .subscribe(list => {
          if (this.localSt.retrieve("role") == "PRACTICIAN") {
            list = list.filter(
              a => a.accountId != this.featureService.getUserId()
            );
          }
          this.itemsList = [];
          this.number = list.length;
          list.forEach(message => {
            let practician = this.mappingPracticians(message);
            this.itemsList.push(practician);
          });
        });
    } else {
      this.practicianSearchService
        .getPracticiansBytextAndCity(text, city)
        .subscribe(list => {
          if (this.localSt.retrieve("role") == "PRACTICIAN") {
            list = list.filter(
              a => a.accountId != this.featureService.getUserId()
            );
          }
          this.itemsList = [];
          this.number = list.length;
          list.forEach(message => {
            let practician = this.mappingPracticians(message);
            this.itemsList.push(practician);
          });
        });
    }
  }
  edit() {
    this.featureService.changeSearch(new search(this.text, this.city));
    jQuery(document).ready(function(e) {
      jQuery(this)
        .find("#dropdownMenuLinkSearch")
        .trigger("click");
    });
  }
  mappingPracticians(message) {
    const practician = new PracticianSearch();
    practician.id = message.id;
    practician.isSeen = true;
    practician.users = [
      {
        fullName: message.fullName,
        img: message.photoId
          ? "assets/imgs/IMG_3944.jpg"
          : "assets/imgs/user.png",
        title: message.title,
        type: "MEDICAL"
      }
    ];
    practician.object = {
      name: message.address,
      isImportant: false,
      isLocalisation: true
    };
    practician.time = null;
    practician.isImportant = false;
    practician.hasFiles = false;
    practician.isViewDetail = true;
    practician.isChecked = false;
    return practician;
  }
  cardClicked(item) {
    this.router.navigate(["/features/practician-detail/" + item.id]);
  }
  selectItem(event) {
    this.itemsList.forEach(a => {
      if (event.filter(b => b.id == a.id).length >= 1) {
        a.isChecked = true;
      } else {
        a.isChecked = false;
      }
    });
  }
  return() {
    this.router.navigate(["/features/messageries"]);
  }
}
