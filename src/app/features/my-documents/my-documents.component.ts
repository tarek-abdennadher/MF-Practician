import { Component, OnInit } from "@angular/core";
import { MyDocumentsService } from "./my-documents.service";
import * as FileSaver from "file-saver";
import { Location } from "@angular/common";
import { GlobalService } from "@app/core/services/global.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PracticianSearch } from '../practician-search/practician-search.model';

@Component({
  selector: "app-my-documents",
  templateUrl: "./my-documents.component.html",
  styleUrls: ["./my-documents.component.scss"],
})
export class MyDocumentsComponent implements OnInit {

  attachements = [];
  page = this.globalService.messagesDisplayScreen.documents;
  topText = this.globalService.messagesDisplayScreen.documents;

  backButton = true;

  isCheckbox: boolean = false;
  itemsList = [];
  filtredItemsList = [];
  imageSource = "assets/imgs/user.png";
  search: string;

  constructor(
    private mydocumentsService: MyDocumentsService,
    private globalService: GlobalService,
    private _location: Location,
    public router: Router,
    private documentService: MyDocumentsService


  ) {}

  ngOnInit(): void {
    this.getMySendersAndReceivers();
  }

  getMySendersAndReceivers(){
    this.mydocumentsService.getMySendersAndeceiversDetails().subscribe(sendersAndReceivers => {
      sendersAndReceivers.forEach((element) => {
        let senderAndReceiver = this.mappingSendersAndReceivers(element);
        this.itemsList.push(senderAndReceiver);
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
                user.img = "assets/imgs/user.png";
              }
            );
          });
        }
      });
    })
  }
  getDetailSwitchRole(senderDetail) {
    switch (senderDetail.role) {
      case "PATIENT":
        return senderDetail.patient;
      case "PRACTICIAN":
        return senderDetail.practician;
      case "SECRETARY":
        return senderDetail.secretary;
      default:
        return null;
    }
  }
  mappingSendersAndReceivers(senderAndReceiver) {
    const practician = new PracticianSearch();
    const detail = this.getDetailSwitchRole(senderAndReceiver)
    practician.id = senderAndReceiver.id;
    practician.isSeen = true;
    practician.users = [
      {
        fullName: detail.fullName,
        img: "assets/imgs/user.png",
        title: detail.title,
        type: senderAndReceiver.role == "PRACTICIAN"
        ? "MEDICAL"
        :senderAndReceiver.role,
      },
    ];
    practician.object = {
      name: detail.address,
      isImportant: false,
      isLocalisation: detail.address?true:false,
    };
    practician.time = null;
    practician.isImportant = false;
    practician.hasFiles = false;
    practician.isViewDetail = true;
    practician.isChecked = false;
    practician.photoId = detail.photoId;
    return practician;
  }


  goBack() {
    this._location.back();
  }

  cardClicked(item) {
    this.router.navigate(["/mes-documents/list/" + item.id]);
  }

  searchAction(search){
    if(this.filtredItemsList.length<this.itemsList.length){
      this.filtredItemsList=this.itemsList;
    }
    this.itemsList=this.filtredItemsList;
    this.itemsList=this.itemsList.filter(item =>
      item.users[0].fullName.toLowerCase().includes(search));
  }
}
