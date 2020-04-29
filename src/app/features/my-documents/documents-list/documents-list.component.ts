import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MyDocumentsService } from "../my-documents.service";
import * as FileSaver from "file-saver";
import { Location } from "@angular/common";
import { GlobalService } from "@app/core/services/global.service";
import { observable, forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { FormGroup, FormBuilder } from "@angular/forms";
import { AccountService } from "@app/features/services/account.service";

@Component({
  selector: "app-documents-list",
  templateUrl: "./documents-list.component.html",
  styleUrls: ["./documents-list.component.scss"],
})
export class DocumentsListComponent implements OnInit {
  idSenderReceiver: any;

  page = this.globalService.messagesDisplayScreen.documents;
  topText = this.globalService.messagesDisplayScreen.documents;

  backButton = true;
  links = {
    isMyDocuments: true,
  };
  observables = [];
  attachementsList: any[];
  itemList = [];
  imageSource = "assets/imgs/user.png";
  public filterDocumentsForm: FormGroup;
  documentTypes = new Set();
  destinations = new Set();
  account: any;
  linkedPatients: any;
  constructor(
    private globalService: GlobalService,
    private route: ActivatedRoute,
    public documentsService: MyDocumentsService,
    private _location: Location,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
  ) {
    this.filterDocumentsForm = this.formBuilder.group({
      documentType: [""],
      destination: [""],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idSenderReceiver = params["id"];
      this.getAttachementById(this.idSenderReceiver);
    });
    this.getPersonalInfo();
    this.getAccountDetails(this.idSenderReceiver)
  }
  getPersonalInfo() {
    this.accountService.getCurrentAccount().subscribe((account) => {
      if (account && account.patient) {
        this.account = account.patient;
        this.linkedPatients = this.account.linkedPatients;
        this.linkedPatients.forEach((patient) => {
          this.destinations.add(patient);
        });
      }
    });
  }

  getAccountDetails(id){
    this.accountService.getAccountDetails(id).subscribe(account => {
      let details = this.getDetailSwitchRole(account)
      this.documentsService.downloadFile(details.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            this.documentsService.person={
              fullName:details.fullName,
              picture: myReader.result
            }
          };
          let ok = myReader.readAsDataURL(response.body);
        },
        (error) => {
          this.documentsService.person={
            fullName:details.fullName,
            picture: "assets/imgs/user.png"
          }
        }
      );
    })
  }

  getAttachementById(id) {
    this.itemList = [];
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderOrReceiverId(id)
      .subscribe((attachements) => {
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables).subscribe((nodes) => {
          nodes.forEach((node: any) => {
            if (node.entry) {
              const splitName = node.entry.name.split(".");
              const extention = splitName[splitName.length - 1];

              const attachement = this.attachementsList.find(
                (x) => x.nodeId == node.entry.id
              );

              this.itemList.push(this.parseMessage(attachement, node.entry));
            }
          });
        });
      });
  }
  parseMessage(attachement, node): any {
    const dotIndex = node.name.lastIndexOf(".");
    return {
      id: attachement.id,
      isSeen: true,
      users: [
        {
          id: attachement.senderId,
          fullName: node.name,
          img: this.getImageSwitchExtention(
            node.name.substring(dotIndex + 1, node.name.length)
          ),
          title: attachement.senderForId
            ? "Pour " + attachement.senderForDetails.fullName
            : null,
        },
      ],
      object: {
        name: attachement.object,
        isImportant: false,
      },
      nodeId: attachement.nodeId,
      time: attachement.updatedAt,
      download: true,
      visualize: true,
    };
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

  getImageSwitchExtention(extension: string) {
    console.log(extension)
    switch (extension.toLowerCase()) {
      case "doc":
        return "assets/files/doc.svg";
      case "jpg":
        return "assets/files/jpg.svg";
      case "png":
        return "assets/files/png.svg";
      case "pdf":
        return "assets/files/pdf.svg";
      case "zip":
        return "assets/files/zip.svg";
      case "txt":
        return "assets/files/txt.svg";
      case "xlsc":
        return "assets/files/xlsc.svg";
      default:
        return "assets/files/file.svg";
    }
  }

  downloadFile(attachement) {
    this.documentsService
      .downloadFile(attachement.nodeId)
      .subscribe((response) => {
        const blob = new Blob([response.body]);
        const filename = attachement.users[0].fullName;
        const filenameDisplay = filename;
        const dotIndex = filename.lastIndexOf(".");
        const extension = filename.substring(dotIndex + 1, filename.length);
        let resultname: string;
        if (filenameDisplay !== "") {
          resultname = filenameDisplay.includes(extension)
            ? filenameDisplay
            : filenameDisplay + "." + extension;
        } else {
          resultname = filename;
        }
        FileSaver.saveAs(blob, resultname);
      });
  }
  getType(extention: string) {
    switch (extention.toLowerCase()) {
      case "pdf":
        return "application/pdf";
      case "png":
        return "image/png";
      case "jpeg":
        return "image/jpeg";
      case "jpg":
        return "image/jpg";
      default:
        return "text/plain";
    }
  }
  visualizeFile(attachement) {
    this.documentsService
      .downloadFile(attachement.nodeId)
      .subscribe((response) => {
        const filename = attachement.users[0].fullName;
        const filenameDisplay = filename;
        const dotIndex = filename.lastIndexOf(".");
        const extension = filename.substring(dotIndex + 1, filename.length);

        const blob = new Blob([response.body], {
          type: this.getType(extension),
        });

        let resultname: string;
        if (filenameDisplay !== "") {
          resultname = filenameDisplay.includes(extension)
            ? filenameDisplay
            : filenameDisplay + "." + extension;
        } else {
          resultname = filename;
        }
        this.openFile("", filename, blob);
      });
  }

  openFile(resData, fileName, blob) {
    var ieEDGE = navigator.userAgent.match(/Edge/g);
    var ie = navigator.userAgent.match(/.NET/g); // IE 11+
    var oldIE = navigator.userAgent.match(/MSIE/g);

    if (ie || oldIE || ieEDGE) {
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      var fileURL = URL.createObjectURL(blob);
      var win = window.open();
      win.document.write(
        '<iframe src="' +
          fileURL +
          '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
      );
    }
  }
  goBack() {
    this._location.back();
  }

  getAttachementByObject(id, object) {
    this.itemList = [];
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsByObject(id, object)
      .subscribe((attachements) => {
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables).subscribe((nodes) => {
          nodes.forEach((node: any) => {
            if (node.entry) {
              const splitName = node.entry.name.split(".");
              const extention = splitName[splitName.length - 1];

              const attachement = this.attachementsList.find(
                (x) => x.nodeId == node.entry.id
              );

              this.itemList.push(this.parseMessage(attachement, node.entry));
            }
          });
        });
      });
  }
  getAttachementBySenderFor(id, senderForId) {
    this.itemList = [];
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderForId(id, senderForId)
      .subscribe((attachements) => {
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables).subscribe((nodes) => {
          nodes.forEach((node: any) => {
            if (node.entry) {
              const splitName = node.entry.name.split(".");
              const extention = splitName[splitName.length - 1];

              const attachement = this.attachementsList.find(
                (x) => x.nodeId == node.entry.id
              );

              this.itemList.push(this.parseMessage(attachement, node.entry));
            }
          });
        });
      });
  }

  getAttachementBySenderForAndObject(id, senderForId, object) {
    this.itemList = [];
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderForIdAndObject(id, senderForId, object)
      .subscribe((attachements) => {
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables).subscribe((nodes) => {
          nodes.forEach((node: any) => {
            if (node.entry) {
              const splitName = node.entry.name.split(".");
              const extention = splitName[splitName.length - 1];

              const attachement = this.attachementsList.find(
                (x) => x.nodeId == node.entry.id
              );

              this.itemList.push(this.parseMessage(attachement, node.entry));
            }
          });
        });
      });
  }
  filter() {
    if (
      this.filterDocumentsForm.value.destination != "" &&
      this.filterDocumentsForm.value.documentType != ""
    ) {
      this.getAttachementBySenderForAndObject(
        this.idSenderReceiver,
        this.filterDocumentsForm.value.destination,
        this.filterDocumentsForm.value.documentType
      );
    } else if (
      this.filterDocumentsForm.value.destination != "" &&
      this.filterDocumentsForm.value.documentType == ""
    ) {
      this.getAttachementBySenderFor(
        this.idSenderReceiver,
        this.filterDocumentsForm.value.destination
      );
    } else  if (this.filterDocumentsForm.value.destination == "" &&
    this.filterDocumentsForm.value.documentType != ""){
      this.getAttachementByObject(
        this.idSenderReceiver,
        this.filterDocumentsForm.value.documentType
      );
    } else {
      this.getAttachementById(this.idSenderReceiver);
    }
  }


}
