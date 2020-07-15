import { Component, OnInit, ViewChild } from "@angular/core";
import { takeUntil, tap } from "rxjs/operators";
import { Subject, forkJoin, BehaviorSubject } from "rxjs";
import { RequestTypeService } from "../services/request-type.service";
import { MessageService } from "../services/message.service";
import { GlobalService } from "@app/core/services/global.service";
import { v4 as uuid } from "uuid";
import { NodeeService } from "../services/node.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Message } from "@app/shared/models/message";
import { ContactsService } from "../services/contacts.service";
import { FeaturesService } from "../features.service";
import { Location } from "@angular/common";
import { LocalStorageService } from "ngx-webstorage";
import { NotifierService } from "angular-notifier";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MyPatientsService } from '../services/my-patients.service';

@Component({
  selector: "app-send-message",
  templateUrl: "./send-message.component.html",
  styleUrls: ["./send-message.component.scss"],
})
export class SendMessageComponent implements OnInit {
  public uuid: string;
  private _destroyed$ = new Subject();
  imageSource: any;
  imageDropdown: string;
  connectedUserType = "MEDICAL";
  user = this.localSt.retrieve("user");
  role = this.localSt.retrieve("role");
  connectedUser = this.user?.firstName + " " + this.user?.lastName;
  toList: Subject<any[]> = new Subject<any[]>();
  forList: Subject<any[]> = new Subject<any[]>();
  forFieldList = [];
  selectedObject = new BehaviorSubject<any>(null);
  objectsList = [];
  practicianObjectList = [];
  selectedFiles: any;
  links = {};
  page = this.globalService.messagesDisplayScreen.inbox;
  topText = this.globalService.messagesDisplayScreen.writeMessage;
  backButton = true;
  selectedPracticianId: number;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  private readonly notifier: NotifierService;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };
  objectsListForTls = [
    { id: 1111, name: "Instructions Urgentes", information: "Instructions Urgentes", body: "" },
    { id: 2222, name: "Reports de rdv", information: "Reports de rdv", body: "" },
    { id: 3333, name: "Modifications de plannings", information: "Modifications de plannings", body: "" },
    { id: 4444, name: "Instructions diverses", information: "Instructions diverses", body: "" },
  ];
  constructor(
    private globalService: GlobalService,
    private localSt: LocalStorageService,
    private featureService: FeaturesService,
    private _location: Location,
    private contactsService: ContactsService,
    private requestTypeService: RequestTypeService,
    private messageService: MessageService,
    private nodeService: NodeeService,
    private router: Router,
    public route: ActivatedRoute,
    notifierService: NotifierService,
    private documentService: MyDocumentsService,
    private patientService: MyPatientsService,
    private spinner: NgxSpinnerService
  ) {
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      this.connectedUser = "Dr " + this.connectedUser;
      this.connectedUserType = "MEDICAL";
    }
    this.route.queryParams.subscribe((params) => {
      this.selectedPracticianId = params["id"] || null;
    });
    this.notifier = notifierService;
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
    this.imageDropdown = this.avatars.user;
  }

  ngOnInit(): void {
    if (this.user?.photoId) {
      this.documentService.downloadFile(this.user?.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            this.imageSource = myReader.result;
          };
          let ok = myReader.readAsDataURL(response.body);
        },
        (error) => {
          this.imageSource = this.avatars.user;
        }
      );
    } else {
      if (this.role == "PRACTICIAN") {
        this.imageSource = this.avatars.doctor;
      } else if (this.role == "SECRETARY") {
        this.imageSource = this.avatars.secretary;
      }
    }
    if (this.localSt.retrieve("role") == "SECRETARY") {
      this.connectedUserType = "SECRETARY";
      this.featureService.getSecretaryPracticians().subscribe((value) => {
        value.forEach((item) => {
          item.type = "CONTACT_PRO"
          if (item.photo) {
            this.documentService.downloadFile(item.photo).subscribe(
              (response) => {
                let myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                  item.img = myReader.result;
                };
                let ok = myReader.readAsDataURL(response.body);
              },
              (error) => {
                item.img = this.avatars.doctor;
              }
            );
          } else {
            item.img = this.avatars.doctor;
          }
          this.forFieldList.push(item);
        });
        this.forList.next(this.forFieldList);
      }
      );
    }
    forkJoin(this.getAllContactsPractician(), this.getAllObjectList(), this.getAllPatientFilesByPracticianId())
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => { });
    this.featureService.setIsMessaging(false);

  }

  getAllContactsPractician() {
    if (this.selectedPracticianId) {
      return this.contactsService
        .getAllContactsPracticianWithAditionalPatient(this.selectedPracticianId)
        .pipe(takeUntil(this._destroyed$))
        .pipe(
          tap((contactsPractician: any) => {
            this.parseContactsPractician(contactsPractician);
          })
        );
    } else {
      return this.contactsService
        .getAllContactsPractician()
        .pipe(takeUntil(this._destroyed$))
        .pipe(
          tap((contactsPractician: any) => {
            this.parseContactsPractician(contactsPractician);
          })
        );
    }
  }
  getAllPatientFilesByPracticianId() {
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      return this.patientService
        .getAllPatientFilesByPracticianId(this.featureService.getUserId())
        .pipe(takeUntil(this._destroyed$))
        .pipe(
          tap((patientFiles) => {
            let list = [];
            patientFiles.forEach((item) => {
              if (item.photoId) {
                this.documentService.downloadFile(item.photo).subscribe(
                  (response) => {
                    let myReader: FileReader = new FileReader();
                    myReader.onloadend = (e) => {
                      item.img = myReader.result;
                    };
                    let ok = myReader.readAsDataURL(response.body);
                  },
                  (error) => {
                    if (item?.civility == "MME") {
                      item.img = this.avatars.women;
                    }
                    else {
                      if (item?.civility == "CHILD") {
                        item.img = this.avatars.child
                      }
                      else item.img = this.avatars.man;
                    }
                  }
                );
              } else {
                if (item?.civility == "MME") {
                  item.img = this.avatars.women;
                }
                else {
                  if (item?.civility == "CHILD") {
                    item.img = this.avatars.child
                  }
                  else item.img = this.avatars.man;
                }
              }
              list.push(item);
            });
            this.forList.next(list);
          })
        );
    }
    else {
      if (this.selectedPracticianId) {
        return this.patientService
          .getAllPatientFilesByPracticianId(this.selectedPracticianId)
          .pipe(takeUntil(this._destroyed$))
          .pipe(
            tap((patientFiles) => {
              patientFiles.forEach((item) => {
                item.type = "PATIENT_FILE"
                if (item.photoId) {
                  this.documentService.downloadFile(item.photo).subscribe(
                    (response) => {
                      let myReader: FileReader = new FileReader();
                      myReader.onloadend = (e) => {
                        item.img = myReader.result;
                      };
                      let ok = myReader.readAsDataURL(response.body);
                    },
                    (error) => {
                      if (item?.civility == "MME") {
                        item.img = this.avatars.women;
                      }
                      else {
                        item.img = this.avatars.man;
                      }
                    }
                  );
                } else {
                  if (item?.civility == "MME") {
                    item.img = this.avatars.women;
                  }
                  else {
                    item.img = this.avatars.man;
                  }
                }
                this.forFieldList.push(item);
              });
              this.forList.next(this.forFieldList);
              console.log(this.forFieldList)
            })
          );
      }
    }


  }
  parseContactsPractician(contactsPractician) {
    let myList = [];
    contactsPractician.forEach((contactPractician) => {
      if (contactPractician.photoId && contactPractician.photoId != null) {
        this.documentService.downloadFile(contactPractician.photoId).subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              myList.push({
                id: contactPractician.id,
                fullName: contactPractician.fullName,
                type: contactPractician.contactType,
                isSelected:
                  this.selectedPracticianId == contactPractician.id
                    ? true
                    : false,
                img: myReader.result,
              });
              this.toList.next(myList);
            };
            let ok = myReader.readAsDataURL(response.body);
          },
          (error) => {
            myList.push({
              id: contactPractician.id,
              fullName: contactPractician.fullName,
              type: contactPractician.contactType,
              isSelected:
                this.selectedPracticianId == contactPractician.id
                  ? true
                  : false,
              img: null,
            });
            this.toList.next(myList);
          }
        );
      } else {
        if (contactPractician.contactType == "MEDICAL") {
          myList.push({
            id: contactPractician.id,
            fullName: contactPractician.fullName,
            type: contactPractician.contactType,
            isSelected:
              this.selectedPracticianId == contactPractician.id ? true : false,
            img: this.avatars.doctor,
          });
          this.toList.next(myList);
        } else if (
          contactPractician.contactType == "SECRETARY" ||
          contactPractician.contactType == "TELESECRETARYGROUP"
        ) {
          myList.push({
            id: contactPractician.id,
            fullName: contactPractician.fullName,
            type: contactPractician.contactType,
            isSelected:
              this.selectedPracticianId == contactPractician.id ? true : false,
            img: this.avatars.secretary,
          });
          this.toList.next(myList);
        } else if (contactPractician.contactType == "PATIENT") {
          if (contactPractician.civility == "M") {
            myList.push({
              id: contactPractician.id,
              fullName: contactPractician.fullName,
              type: contactPractician.contactType,
              isSelected:
                this.selectedPracticianId == contactPractician.id
                  ? true
                  : false,
              img: this.avatars.man,
            });
            this.toList.next(myList);
          } else if (contactPractician.civility == "MME") {
            myList.push({
              id: contactPractician.id,
              fullName: contactPractician.fullName,
              type: contactPractician.contactType,
              isSelected:
                this.selectedPracticianId == contactPractician.id
                  ? true
                  : false,
              img: this.avatars.women,
            });
            this.toList.next(myList);
          } else if (contactPractician.civility == "CHILD") {
            myList.push({
              id: contactPractician.id,
              fullName: contactPractician.fullName,
              type: contactPractician.contactType,
              isSelected:
                this.selectedPracticianId == contactPractician.id
                  ? true
                  : false,
              img: this.avatars.child,
            });
            this.toList.next(myList);
          }
        }
      }
    });
    this.toList.next(myList);
  }

  getAllObjectList() {
    return this.requestTypeService
      .getAllObjects()
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((requestTypes: any) => {
          this.practicianObjectList = requestTypes.map(e => { return { "id": e.id, "title": e.object, "name": e.object, "destination": e.destination, "allowDocument": e.allowDocument, "body": "" } });
        })
      );
  }

  sendMessage(message) {
    this.spinner.show();
    this.uuid = uuid();
    const newMessage = new Message();
    message.to.forEach((to) => {
      newMessage.toReceivers.push({ receiverId: to.id });
    });
    message.cc
      ? message.cc.forEach((cc) => {
        newMessage.ccReceivers.push({ receiverId: cc.id });
      })
      : null;
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      newMessage.sender = {
        senderId: this.featureService.getUserId(),
        originalSenderId: this.featureService.getUserId(),
        sentForPatientFile: message.for && message.for[0] ? message.for[0].id : null,
        senderForCivility: message.for && message.for[0] ? message.for[0]?.civility : null,
        senderForPhotoId: message.for && message.for[0] ? message.for[0]?.photoId : null,
        senderForfullName: message.for && message.for[0] ? message.for[0]?.fullName : null
      };
    }
    else {
      if (message.for && message.for[0].type == "PATIENT_FILE") {
        newMessage.sender = {
          senderId: this.featureService.getUserId(),
          originalSenderId: this.featureService.getUserId(),
          sentForPatientFile: message.for && message.for[0] ? message.for[0].id : null,
          senderForCivility: message.for && message.for[0] ? message.for[0]?.civility : null,
          senderForPhotoId: message.for && message.for[0] ? message.for[0]?.photoId : null,
          senderForfullName: message.for && message.for[0] ? message.for[0]?.fullName : null
        };
      } else {
        newMessage.sender = {
          senderId: this.featureService.getUserId(),
          originalSenderId: this.featureService.getUserId(),
          sendedForId: message.for && message.for[0] ? message.for[0].id : null
        };
      }
    }
    message.object != "" &&
      message.object[0].name.toLowerCase() !=
      this.globalService.messagesDisplayScreen.other
      ? (newMessage.object = message.object[0].name)
      : (newMessage.object = message.freeObject);
    newMessage.body = message.body;
    if (message.file !== undefined) {
      newMessage.uuid = this.uuid;
      this.selectedFiles = message.file;

      const formData = new FormData();
      if (this.selectedFiles) {
        newMessage.hasFiles = true;
        formData.append("model", JSON.stringify(newMessage));
        formData.append(
          "file",
          this.selectedFiles.item(0),
          this.selectedFiles.item(0).name
        );
      }

      this.nodeService
        .saveFileInMemory(this.uuid, formData)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(
          (mess) => {
            this.featureService.sentState.next(true);
            this.spinner.hide();
            this.router.navigate(["/messagerie"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.spinner.hide();
            this.notifier.show({
              message: this.globalService.toastrMessages.send_message_error,
              type: "error",
              template: this.customNotificationTmpl,
            });
          }
        );
    } else {
      this.messageService
        .sendMessage(newMessage)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(
          (mess) => {
            this.featureService.sentState.next(true);
            this.spinner.hide();
            this.router.navigate(["/messagerie"], {
              queryParams: {
                status: "sentSuccess",
              },
            });
          },
          (error) => {
            this.spinner.hide();
            this.notifier.show({
              message: this.globalService.toastrMessages.send_message_error,
              type: "error",
              template: this.customNotificationTmpl,
            });
          }
        );
    }
  }
  addProContactAction() {
    this.router.navigate(["/praticien-recherche"]);
  }

  getSelectedToList(event) {
    if (event && event.to.length !== 0) {
      let type = event.to[0].type;
      if (type == "MEDICAL") {
        this.objectsList = this.practicianObjectList.filter(item => item.destination == "PRACTICIAN" || item.destination == "OTHER");
      } else if (type == "TELESECRETARYGROUP" || type == "SECRETARY") {
        this.objectsList = this.practicianObjectList.filter(item => item.destination == "SECRETARY" || item.destination == "OTHER");
      } else if (type == "PATIENT") {
        this.objectsList = this.practicianObjectList.filter(item => item.destination == "PATIENT" || item.destination == "OTHER");
      } else {
        this.objectsList = this.practicianObjectList.filter(item => item.destination == "OTHER");
      }
      this.objectsList.push({ "id": 0, "title": "Autre", "name": "Autre", "destination": "Autre" })
    }
  }

  objectSelection(item) {
    let selectedObj = item.object[0];
    if (selectedObj && selectedObj.title != "autre") {
      const objectDto = {
        senderId: this.featureService.getUserId(),
        receiverId: item.to[0].id,
        objectId: selectedObj.id
      }
      selectedObj.requestDto = objectDto;
      let newData = { id: selectedObj.id, name: selectedObj.title, body: null, file: null };
      const body = this.requestTypeService.getObjectBody(objectDto).pipe(takeUntil(this._destroyed$))
        .pipe(
          tap((resBody: any) => {
            newData.body = resBody.body;
          }));
      if (selectedObj.allowDocument) {
        const doc = this.requestTypeService.getDocument(objectDto).pipe(takeUntil(this._destroyed$))
          .pipe(
            tap((response: any) => {
              const blob = new Blob([response.body]);
              var fileOfBlob = new File([blob], selectedObj.title + '.pdf');
              newData.file = fileOfBlob;
            }));
        forkJoin(body, doc)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((res) => { this.selectedObject.next(newData); });
      }
      else {
        forkJoin(body)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((res) => { this.selectedObject.next(newData); });
      }
      //this.selectedObject.next(result);
      //this.openDialog(selectedObj);
    }
  }



  goToBack() {
    this._location.back();
  }
  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
