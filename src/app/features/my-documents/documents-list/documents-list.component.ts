import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MyDocumentsService } from "../my-documents.service";
import * as FileSaver from "file-saver";
import { Location } from "@angular/common";
import { GlobalService } from "@app/core/services/global.service";
import {  Subject } from "rxjs";
import {  takeUntil } from "rxjs/operators";
import { FormGroup, FormBuilder } from "@angular/forms";
import { AccountService } from "@app/features/services/account.service";
import { CivilityPipe } from "@app/shared/pipes/civility.pipe";
import { FeaturesService } from "@app/features/features.service";
import { DomSanitizer } from "@angular/platform-browser";
import { NgxSpinnerService } from "ngx-spinner";
import { checkIsValidImageExtensions } from "@app/shared/functions/functions";

@Component({
  selector: "app-documents-list",
  templateUrl: "./documents-list.component.html",
  styleUrls: ["./documents-list.component.scss"]
})
export class DocumentsListComponent implements OnInit, OnDestroy {
  idSenderReceiver: any;
  private _destroyed$ = new Subject();
  page = this.globalService.messagesDisplayScreen.documents;
  topText = this.globalService.messagesDisplayScreen.documents;
  loading = this.globalService.messagesDisplayScreen.loading;

  backButton = true;
  observables = [];
  attachementsList: any[];
  itemList = [];
  imageSource: string;
  public filterDocumentsForm: FormGroup;
  documentTypes = new Set();
  destinations = new Set();
  account: any;
  linkedPatients: any;
  pageNo = 0;
  file = {
    fileName: "",
    src: null,
    isImage: false,
    isPdf:false
  };
  listLength = 0;
  scroll = false;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  shownSpinner = false;
  constructor(
    private globalService: GlobalService,
    private route: ActivatedRoute,
    public documentsService: MyDocumentsService,
    private _location: Location,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private civilityPipe: CivilityPipe,
    private featureService: FeaturesService,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,

  ) {
    this.filterDocumentsForm = this.formBuilder.group({
      documentType: [""],
      destination: [""]
    });
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  realTime() {
    this.documentsService.getIdObs().subscribe(resp => {
      if (resp) {
        this.idSenderReceiver = resp;
      }
      this.filter();
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idSenderReceiver = this.featureService.decrypt(params.id);
    });
    this.getPersonalInfo();
    this.getAccountDetails(this.idSenderReceiver);
    this.realTime();
  }

  getPersonalInfo() {
    this.accountService
      .getCurrentAccount()
      .pipe(takeUntil(this._destroyed$))
      .subscribe(account => {
        if (account && account.patient) {
          this.account = account.patient;
          this.linkedPatients = this.account.linkedPatients;
          this.linkedPatients.forEach(patient => {
            this.destinations.add(patient);
          });
        }
      });
  }

  getAccountDetails(id) {
    this.accountService
      .getAccountDetails(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(account => {
        const details = this.getDetailSwitchRole(account);
        if (details.photoId) {
          this.documentsService
            .downloadFile(details.photoId)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(
              response => {
                const myReader: FileReader = new FileReader();
                myReader.onloadend = e => {
                  if (account.role == "PRACTICIAN") {
                    this.documentsService.person = {
                      fullName: `${details.jobTitle} ${details.fullName}`,
                      picture: myReader.result
                    };
                  } else {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: myReader.result
                    };
                  }
                };
                const ok = myReader.readAsDataURL(response.body);
              },
              error => {
                if (account.role == "PATIENT") {
                  if (details.civility == "M") {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: this.avatars.man
                    };
                  } else if (details.civility == "MME") {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: this.avatars.women
                    };
                  } else if (details.civility == "CHILD") {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: this.avatars.child
                    };
                  }
                } else if (account.role == "PRACTICIAN") {
                  this.documentsService.person = {
                    fullName: `${details.jobTitle} ${details.fullName}`,
                    picture: this.avatars.doctor
                  };
                } else if (account.role == "SECRETARY") {
                  this.documentsService.person = {
                    fullName: `${this.civilityPipe.transform(
                      details.civility
                    )} ${details.fullName}`,
                    picture: this.avatars.secretary
                  };
                }
              }
            );
        } else {
          if (account.role == "PATIENT") {
            if (details.civility == "M") {
              this.documentsService.person = {
                fullName: `${this.civilityPipe.transform(details.civility)} ${
                  details.fullName
                }`,
                picture: this.avatars.man
              };
            } else if (details.civility == "MME") {
              this.documentsService.person = {
                fullName: `${this.civilityPipe.transform(details.civility)} ${
                  details.fullName
                }`,
                picture: this.avatars.women
              };
            } else if (details.civility == "CHILD") {
              this.documentsService.person = {
                fullName: `${this.civilityPipe.transform(details.civility)} ${
                  details.fullName
                }`,
                picture: this.avatars.child
              };
            }
          } else if (account.role == "PRACTICIAN") {
            this.documentsService.person = {
              fullName: `${details.jobTitle} ${details.fullName}`,
              picture: this.avatars.doctor
            };
          } else if (account.role == "SECRETARY") {
            this.documentsService.person = {
              fullName: `${this.civilityPipe.transform(details.civility)} ${
                details.fullName
              }`,
              picture: this.avatars.secretary
            };
          }
        }
      });
  }

  getAttachementById(id, pageNo) {
    this.scroll = true;
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderOrReceiverId(id, pageNo)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(attachements => {
        this.attachementsList = attachements;
        if (attachements) {
          attachements.forEach(attachement => {
            this.documentTypes.add(attachement.object);
            this.itemList.push(this.parseMessage(attachement, attachement));
          });
          this.scroll = false;
        }
      });
  }

  parseMessage(attachement, node): any {
    const dotIndex = node.name.lastIndexOf(".");
    if (attachement) {
      return {
        id: attachement.id,
        isSeen: true,
        users: [
          {
            id: attachement.senderId,
            fullName: null,
            img: this.getImageSwitchExtention(
              node.name.substring(dotIndex + 1, node.name.length)
            ),
            title: attachement.senderForId
              ? "Pour " + attachement.senderForDetails?.fullName
              : null
          }
        ],
        object: {
          name:
            node.name.length < 30
              ? node.name
              : node.name.substring(0, 30) + "...",
          isImportant: false
        },
        nodeId: attachement.nodeId,
        time: attachement.updatedAt,
        download: true,
        visualize: checkIsValidImageExtensions(node.name).isValid,
        realName: node.name
      };
    }
  }
  getDetailSwitchRole(senderDetail) {
    switch (senderDetail.role) {
      case "PATIENT":
        return senderDetail.patient;
      case "PRACTICIAN":
        return senderDetail.practician;
      case "SECRETARY":
        return senderDetail.secretary;
      case "TELESECRETARYGROUP":
        return senderDetail.telesecretaryGroup;
      case "SUPERVISOR" || "SUPER_SUPERVISOR" || "OPERATOR":
        return senderDetail.telesecretary;
      default:
        return null;
    }
  }

  getImageSwitchExtention(extension: string) {
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
      .pipe(takeUntil(this._destroyed$))
      .subscribe(response => {
        const blob = new Blob([response.body]);
        const filename = attachement.realName;
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


  hideSpinner (){
    this.shownSpinner = false;
    this.spinner.hide();
    this.file = {
      fileName: "",
      src: null,
      isImage: false,
      isPdf:false
    };
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
    this.shownSpinner = true;
    const checked = checkIsValidImageExtensions(attachement.realName);
    if (checked.isValid) {
      this.file = {
        ...this.file,
        ...checked,
      }
      this.file.fileName = attachement.realName;
      this.spinner.show();
      this.documentsService
        .downloadFile(attachement.nodeId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(
          response => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = e => {
              if (checked.isSvg) this.file.src = this.sanitizer.bypassSecurityTrustUrl(
                myReader.result as string
              );
              else if (checked.isPdf) this.file.src = myReader.result.toString().split(",")[1];
              else this.file.src =  myReader.result;
            };
            let ok = myReader.readAsDataURL(response.body);
          }
        );
    }

  }

  openFile(resData, fileName, blob) {
    const ieEDGE = navigator.userAgent.match(/Edge/g);
    const ie = navigator.userAgent.match(/.NET/g); // IE 11+
    const oldIE = navigator.userAgent.match(/MSIE/g);

    if (ie || oldIE || ieEDGE) {
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      const fileURL = URL.createObjectURL(blob);
      const win = window.open();
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

  getAttachementByObject(id, object, pageNo) {
    this.scroll = true;
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsByObject(id, object, pageNo)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(attachements => {
        this.attachementsList = attachements;
        attachements.forEach(attachement => {
          this.documentTypes.add(attachement.object);
          this.itemList.push(this.parseMessage(attachement, attachement));
        });
        this.scroll = false;
      });
  }
  getAttachementBySenderFor(id, senderForId, pageNo) {
    this.scroll = true;
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderForId(id, senderForId, pageNo)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(attachements => {
        this.attachementsList = attachements;
        attachements.forEach(attachement => {
          this.documentTypes.add(attachement.object);
          this.itemList.push(this.parseMessage(attachement, attachement));
        });
        this.scroll = false;
      });
  }

  getAttachementBySenderForAndObject(id, senderForId, object, pageNo) {
    this.scroll = true;
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderForIdAndObject(id, senderForId, object, pageNo)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(attachements => {
        this.attachementsList = attachements;
        attachements.forEach(attachement => {
          this.documentTypes.add(attachement.object);
          this.itemList.push(this.parseMessage(attachement, attachement));
        });
        this.scroll = false;
      });
  }
  filter() {
    this.documentsService.getObjectFilter().subscribe(
      (value)=>{
        this.pageNo = 0;
        this.itemList = [];
        if(value !="" && value!=='Tout'){
          this.getAttachementByObject(
            this.idSenderReceiver,
            value,
            this.pageNo
          );}
        else if (
          this.filterDocumentsForm.value.destination != "" &&
          value != ""
        ) {
          this.getAttachementBySenderForAndObject(
            this.idSenderReceiver,
            this.filterDocumentsForm.value.destination,
            value,
            this.pageNo
          );
        } else if (
          this.filterDocumentsForm.value.destination != "" &&
          value == ""
        ) {
          this.getAttachementBySenderFor(
            this.idSenderReceiver,
            this.filterDocumentsForm.value.destination,
            this.pageNo
          );
        } else {
          this.getAttachementById(this.idSenderReceiver, this.pageNo);
        }
      }
    )


  }

  onScroll() {
    this.documentsService.getObjectFilter().subscribe(
      (value) => {
        if (this.listLength != this.itemList.length) {
          this.listLength = this.itemList.length;
          this.pageNo++;
          if (
            this.filterDocumentsForm.value.destination != "" &&
            value != ""
          ) {
            this.getAttachementBySenderForAndObject(
              this.idSenderReceiver,
              this.filterDocumentsForm.value.destination,
              value,
              this.pageNo
            );
          } else if (
            this.filterDocumentsForm.value.destination != "" &&
            value == ""
          ) {
            this.getAttachementBySenderFor(
              this.idSenderReceiver,
              this.filterDocumentsForm.value.destination,
              this.pageNo
            );
          } else if (
            this.filterDocumentsForm.value.destination == "" &&
            value != ""
          ) {
            this.getAttachementByObject(
              this.idSenderReceiver,
              value,
              this.pageNo
            );
          } else {
            this.getAttachementById(this.idSenderReceiver, this.pageNo);
          }
        }
      });
  }
}
