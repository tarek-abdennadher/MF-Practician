import { Component, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { PracticianSearchService } from "./practician-search.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PracticianSearch } from "./practician-search.model";
import { search } from "./search.model";
import { FeaturesService } from "../features.service";
import { LocalStorageService } from "ngx-webstorage";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { GlobalService } from "@app/core/services/global.service";
import { Speciality } from "@app/shared/models/speciality";
import { ContactsService } from "../services/contacts.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-practician-search",
  templateUrl: "./practician-search.component.html",
  styleUrls: ["./practician-search.component.scss"],
})
export class PracticianSearchComponent implements OnInit {
  specialities: Array<Speciality>;
  itemsList = [];
  filtredItemsList: Array<any> = new Array<any>();
  text: string;
  city: string;
  texts: any;
  types: Array<string> = [];
  imageSource: string;
  links = {
    isTypeFilter: false,
    isAdd: this.localSt.retrieve("role") == "PRACTICIAN",
  };
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  topText = "Résultats de recherche";
  addText = "Parrainer un confrère";
  page = "MY_PRACTICIANS";
  backButton = true;
  number = 0;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private practicianSearchService: PracticianSearchService,
    private featureService: FeaturesService,
    private localSt: LocalStorageService,
    private documentService: MyDocumentsService,
    private globalService: GlobalService,
    private contactsService: ContactsService,
    private sanitizer: DomSanitizer
  ) {
    this.texts = practicianSearchService.texts;
    this.addText = this.texts.add_text;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.featureService.setActiveChild("practician-search");
    this.featureService.getSearchFiltredPractician().subscribe((list) => {
      this.getPractians(list);
    });
    this.getAllSpeciality();
    this.featureService.setIsMessaging(false);
  }
  getPractians(list) {
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      this.itemsList = [];
      this.filtredItemsList = [];
      if (list && list.length > 0) {
        list = list.filter(
          (a) => a.accountId != this.featureService.getUserId()
        );
        this.number = list.length;
        list.forEach((message) => {
          let practician = this.mappingPracticians(message);
          this.itemsList.push(practician);
        });
        this.filtredItemsList = this.itemsList;
        this.itemsList.forEach((item) => {
          item.users.forEach((user) => {
            this.documentService
              .getDefaultImageEntity(user.id, "ACCOUNT")
              .subscribe(
                (response) => {
                  let myReader: FileReader = new FileReader();
                  myReader.onloadend = (e) => {
                    user.img = this.sanitizer.bypassSecurityTrustUrl(
                      myReader.result as string
                    );
                  };
                  let ok = myReader.readAsDataURL(response);
                },
                (error) => {
                  user.img = this.avatars.user;
                }
              );
          });
        });
      } else {
        this.number = 0;
      }
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
        id: message.accountId,
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
    this.router.navigate(["/praticien-recherche/praticien-detail/" + item.id]);
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
  sendInvitation() {
    this.router.navigate(["/praticien-recherche/invitation"]);
  }
  listFilter(value: string) {
    this.filtredItemsList =
      value != "Tout" ? this.performFilter(value) : this.itemsList;
  }
  performFilter(filterBy: string) {
    return this.itemsList.filter((item) =>
      item.users[0].speciality.includes(filterBy)
    );
  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe(
      (specialitiesList) => {
        this.specialities = specialitiesList;
        this.types = this.specialities.map((s) => s.name);
        this.types.unshift("Tout");
      },
      (error) => {
        console.log("en attendant un model de popup à afficher");
      }
    );
  }
}
