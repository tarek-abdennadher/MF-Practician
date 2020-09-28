import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MyDocumentsService } from "../my-documents.service";
import * as FileSaver from "file-saver";
import { Location } from "@angular/common";
import { GlobalService } from "@app/core/services/global.service";
import { forkJoin, of, Subject } from "rxjs";
import { catchError, takeUntil } from "rxjs/operators";
import { FormGroup, FormBuilder } from "@angular/forms";
import { AccountService } from "@app/features/services/account.service";
import { CivilityPipe } from "@app/shared/pipes/civility.pipe";

@Component({
  selector: "app-documents-list",
  templateUrl: "./documents-list.component.html",
  styleUrls: ["./documents-list.component.scss"],
})
export class DocumentsListComponent implements OnInit, OnDestroy {
  idSenderReceiver: any;
  private _destroyed$ = new Subject();
  page = this.globalService.messagesDisplayScreen.documents;
  topText = this.globalService.messagesDisplayScreen.documents;

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
  constructor(
    private globalService: GlobalService,
    private router: Router,
    private route: ActivatedRoute,
    public documentsService: MyDocumentsService,
    private _location: Location,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private civilityPipe: CivilityPipe
  ) {
    this.filterDocumentsForm = this.formBuilder.group({
      documentType: [""],
      destination: [""],
    });
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  realTime() {
    this.documentsService
      .getIdObs()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        this.idSenderReceiver = resp;
        this.filter();
      });
  }
  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this._destroyed$)).subscribe((params) => {
      this.idSenderReceiver = params["id"];
    });
    this.route.queryParams
      .pipe(takeUntil(this._destroyed$))
      .subscribe((params) => {
        this.filterDocumentsForm.patchValue({
          documentType: params["type"],
        });
      });
    this.getPersonalInfo();
    this.getAccountDetails(this.idSenderReceiver);
    this.realTime();
  }
  getPersonalInfo() {
    this.accountService
      .getCurrentAccount()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((account) => {
        if (account && account.patient) {
          this.account = account.patient;
          this.linkedPatients = this.account.linkedPatients;
          this.linkedPatients.forEach((patient) => {
            this.destinations.add(patient);
          });
        }
      });
  }

  getAccountDetails(id) {
    this.accountService
      .getAccountDetails(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((account) => {
        let details = this.getDetailSwitchRole(account);
        if (details.photoId) {
          this.documentsService
            .downloadFile(details.photoId)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  if (account.role == "PRACTICIAN") {
                    this.documentsService.person = {
                      fullName: `${details.jobTitle} ${details.fullName}`,
                      picture: myReader.result,
                    };
                  } else {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: myReader.result,
                    };
                  }
                };
                let ok = myReader.readAsDataURL(response.body);
              },
              (error) => {
                if (account.role == "PATIENT") {
                  if (details.civility == "M") {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: this.avatars.man,
                    };
                  } else if (details.civility == "MME") {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: this.avatars.women,
                    };
                  } else if (details.civility == "CHILD") {
                    this.documentsService.person = {
                      fullName: `${this.civilityPipe.transform(
                        details.civility
                      )} ${details.fullName}`,
                      picture: this.avatars.child,
                    };
                  }
                } else if (account.role == "PRACTICIAN") {
                  this.documentsService.person = {
                    fullName: `${details.jobTitle} ${details.fullName}`,
                    picture: this.avatars.doctor,
                  };
                } else if (account.role == "SECRETARY") {
                  this.documentsService.person = {
                    fullName: `${this.civilityPipe.transform(
                      details.civility
                    )} ${details.fullName}`,
                    picture: this.avatars.secretary,
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
                picture: this.avatars.man,
              };
            } else if (details.civility == "MME") {
              this.documentsService.person = {
                fullName: `${this.civilityPipe.transform(details.civility)} ${
                  details.fullName
                }`,
                picture: this.avatars.women,
              };
            } else if (details.civility == "CHILD") {
              this.documentsService.person = {
                fullName: `${this.civilityPipe.transform(details.civility)} ${
                  details.fullName
                }`,
                picture: this.avatars.child,
              };
            }
          } else if (account.role == "PRACTICIAN") {
            this.documentsService.person = {
              fullName: `${details.jobTitle} ${details.fullName}`,
              picture: this.avatars.doctor,
            };
          } else if (account.role == "SECRETARY") {
            this.documentsService.person = {
              fullName: `${this.civilityPipe.transform(details.civility)} ${
                details.fullName
              }`,
              picture: this.avatars.secretary,
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
      .subscribe((attachements) => {
        if (attachements.length == 0) {
          this.scroll = false;
        }
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((nodes) => {
            this.scroll = false;
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
          fullName: null,
          img: this.getImageSwitchExtention(
            node.name.substring(dotIndex + 1, node.name.length)
          ),
          title: attachement.senderForId
            ? "Pour " + attachement.senderForDetails.fullName
            : null,
        },
      ],
      object: {
        name:
          node.name.length < 30
            ? node.name
            : node.name.substring(0, 30) + "...",
        isImportant: false,
      },
      nodeId: attachement.nodeId,
      time: attachement.updatedAt,
      download: true,
      visualize: true,
      realName: node.name,
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
      .subscribe((response) => {
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
      .pipe(takeUntil(this._destroyed$))
      .subscribe((response) => {
        const filename = attachement.realName;
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

  getAttachementByObject(id, object, pageNo) {
    this.scroll = true;
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsByObject(id, object, pageNo)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((attachements) => {
        if (attachements.length == 0) {
          this.scroll = false;
        }
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((nodes) => {
            this.scroll = false;
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
  getAttachementBySenderFor(id, senderForId, pageNo) {
    this.scroll = true;
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderForId(id, senderForId, pageNo)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((attachements) => {
        if (attachements.length == 0) {
          this.scroll = false;
        }
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((nodes) => {
            this.scroll = false;
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

  getAttachementBySenderForAndObject(id, senderForId, object, pageNo) {
    this.scroll = true;
    this.attachementsList = [];
    this.observables = [];
    this.documentsService
      .getMyAttachementsBySenderForIdAndObject(id, senderForId, object, pageNo)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((attachements) => {
        if (attachements.length == 0) {
          this.scroll = false;
        }
        this.attachementsList = attachements;
        attachements.forEach((attachement) => {
          this.documentTypes.add(attachement.object);
          this.observables.push(
            this.documentsService
              .getNodeDetailsFromAlfresco(attachement.nodeId)
              .pipe(catchError((error) => of(error)))
          );
        });

        forkJoin(this.observables)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((nodes) => {
            this.scroll = false;
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
    this.pageNo = 0;
    this.itemList = [];
    if (
      this.filterDocumentsForm.value.destination != "" &&
      this.filterDocumentsForm.value.documentType != ""
    ) {
      this.getAttachementBySenderForAndObject(
        this.idSenderReceiver,
        this.filterDocumentsForm.value.destination,
        this.filterDocumentsForm.value.documentType,
        this.pageNo
      );
    } else if (
      this.filterDocumentsForm.value.destination != "" &&
      this.filterDocumentsForm.value.documentType == ""
    ) {
      this.getAttachementBySenderFor(
        this.idSenderReceiver,
        this.filterDocumentsForm.value.destination,
        this.pageNo
      );
    } else if (
      this.filterDocumentsForm.value.destination == "" &&
      this.filterDocumentsForm.value.documentType != ""
    ) {
      this.getAttachementByObject(
        this.idSenderReceiver,
        this.filterDocumentsForm.value.documentType,
        this.pageNo
      );
    } else {
      this.getAttachementById(this.idSenderReceiver, this.pageNo);
    }
  }

  onScroll() {
    if (this.listLength != this.itemList.length) {
      this.listLength = this.itemList.length;
      this.pageNo++;
      if (
        this.filterDocumentsForm.value.destination != "" &&
        this.filterDocumentsForm.value.documentType != ""
      ) {
        this.getAttachementBySenderForAndObject(
          this.idSenderReceiver,
          this.filterDocumentsForm.value.destination,
          this.filterDocumentsForm.value.documentType,
          this.pageNo
        );
      } else if (
        this.filterDocumentsForm.value.destination != "" &&
        this.filterDocumentsForm.value.documentType == ""
      ) {
        this.getAttachementBySenderFor(
          this.idSenderReceiver,
          this.filterDocumentsForm.value.destination,
          this.pageNo
        );
      } else if (
        this.filterDocumentsForm.value.destination == "" &&
        this.filterDocumentsForm.value.documentType != ""
      ) {
        this.getAttachementByObject(
          this.idSenderReceiver,
          this.filterDocumentsForm.value.documentType,
          this.pageNo
        );
      } else {
        this.getAttachementById(this.idSenderReceiver, this.pageNo);
      }
    }
  }
}
