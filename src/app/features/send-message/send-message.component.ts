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
import { MyPatientsService } from "../services/my-patients.service";
import { AccountService } from "../services/account.service";
import { SendType } from "@app/shared/enmus/send-type";
import { ObjectsService } from "../services/objects.service";
declare var $: any;
@Component({
  selector: "app-send-message",
  templateUrl: "./send-message.component.html",
  styleUrls: ["./send-message.component.scss"],
})
export class SendMessageComponent implements OnInit {
  addOptionConfirmed: boolean = false;
  sendPostal: boolean = false;
  messageInHold: any;
  public uuid: string;
  private _destroyed$ = new Subject();
  imageSource: any;
  imageDropdown: string;
  connectedUserType = "MEDICAL";
  user = this.localSt.retrieve("user");
  role = this.localSt.retrieve("role");
  connectedUser = this.user?.firstName + " " + this.user?.lastName;
  toList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  ccList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  forList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  concernList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
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
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  objectsListForTls = [
    {
      id: 1111,
      name: "Instructions Urgentes",
      information: "Instructions Urgentes",
      body: "",
    },
    {
      id: 2222,
      name: "Reports de rdv",
      information: "Reports de rdv",
      body: "",
    },
    {
      id: 3333,
      name: "Modifications de plannings",
      information: "Modifications de plannings",
      body: "",
    },
    {
      id: 4444,
      name: "Instructions diverses",
      information: "Instructions diverses",
      body: "",
    },
  ];
  isTypesVisible: boolean = true;
  isCCListVisible: boolean = true;
  isForListVisible: boolean = true;
  isFreeObjectVisible: boolean = false;
  isObjectSelectVisible: boolean = this.isSecretary() ? false : true;
  isInstruction: boolean = false;
  practicianTLSGroup: any = null;
  lastSendType: any;
  instructionObjectsList: any;
  practicianFullToList: any[];
  sendTypeList = [
    { id: SendType.MESSAGING, text: "Messagerie" },
    { id: SendType.SEND_POSTAL, text: "Envoie Postal" },
  ];
  lastObjectList: any[];
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
    private spinner: NgxSpinnerService,
    private accountService: AccountService,
    private objectsService: ObjectsService
  ) {
    this.sendPostal = false;
    if (this.localSt.retrieve("role") == "PRACTICIAN") {
      this.connectedUser = "Dr " + this.connectedUser;
      this.connectedUserType = "MEDICAL";
      this.getTLSGroupByPracticianId();
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
    this.sendPostal = false;
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
          item.type = "CONTACT_PRO";
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
      });
    }
    this.getAllPatientFilesByPracticianId();
    forkJoin(this.getAllContactsPractician(), this.getAllObjectList())
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {});
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
      this.patientService
        .getAllPatientFilesByPracticianId(this.featureService.getUserId())
        .pipe(takeUntil(this._destroyed$))
        .subscribe((patientFiles) => {
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
                  } else {
                    if (item?.civility == "CHILD") {
                      item.img = this.avatars.child;
                    } else item.img = this.avatars.man;
                  }
                }
              );
            } else {
              if (item?.civility == "MME") {
                item.img = this.avatars.women;
              } else {
                if (item?.civility == "CHILD") {
                  item.img = this.avatars.child;
                } else item.img = this.avatars.man;
              }
            }
            list.push(item);
          });
          this.forList.next(list);
        });
    } else {
      if (this.selectedPracticianId) {
        this.patientService
          .getAllPatientFilesByPracticianId(this.selectedPracticianId)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((patientFiles) => {
            let list = [];
            patientFiles.forEach((item) => {
              item.type = "PATIENT_FILE";
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
                    } else {
                      item.img = this.avatars.man;
                    }
                  }
                );
              } else {
                if (item?.civility == "MME") {
                  item.img = this.avatars.women;
                } else {
                  item.img = this.avatars.man;
                }
              }
              list.push(item);
            });
            this.concernList.next(list);
          });
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
    this.practicianFullToList = myList;
    this.toList.next(myList);
  }

  getAllObjectList() {
    return this.requestTypeService
      .getAllObjects()
      .pipe(takeUntil(this._destroyed$))
      .pipe(
        tap((requestTypes: any) => {
          this.practicianObjectList = requestTypes.map((e) => {
            return {
              id: e.id,
              title: e.object,
              name: e.object,
              destination: e.destination,
              allowDocument: e.allowDocument,
              body: "",
            };
          });
        })
      );
  }

  sendMessage(message) {
    if (message.type[0].id == SendType.SEND_POSTAL) {
      this.featureService.checkIfSendPostalEnabled().subscribe((result) => {
        this.sendPostal = result;
        if (this.sendPostal) {
          this.send(message);
        } else {
          this.messageInHold = message;
          $("#firstModal").modal("toggle");
        }
      });
    } else {
      this.send(message);
    }
  }
  addProContactAction() {
    this.router.navigate(["/praticien-recherche"]);
  }

  getSelectedToList(event) {
    if (event && event.to.length !== 0) {
      let type = event.to[0].type;
      if (type == "MEDICAL") {
        this.objectsList = this.practicianObjectList.filter(
          (item) =>
            item.destination == "PRACTICIAN" || item.destination == "OTHER"
        );
      } else if (type == "TELESECRETARYGROUP" || type == "SECRETARY") {
        if (this.isInstruction) {
          this.objectsList = this.instructionObjectsList;
        } else {
          this.objectsList = this.practicianObjectList.filter(
            (item) =>
              item.destination == "SECRETARY" || item.destination == "OTHER"
          );
        }
      } else if (type == "PATIENT") {
        this.objectsList = this.practicianObjectList.filter(
          (item) => item.destination == "PATIENT" || item.destination == "OTHER"
        );
      } else {
        this.objectsList = this.practicianObjectList.filter(
          (item) => item.destination == "OTHER"
        );
      }
      const objectListContainsOther =
        this.objectsList.findIndex(
          (obj) => obj.id == 0 && obj.title == "Autre"
        ) !== -1;
      if (!objectListContainsOther && !this.isInstruction) {
        this.objectsList.push({
          id: 0,
          title: "Autre",
          name: "Autre",
          destination: "Autre",
        });
      }
      if (
        this.localSt.retrieve("role") == "SECRETARY" &&
        event.to.length == 1
      ) {
        let selectedPractician = event.to[0].id;
        this.patientService
          .getAllPatientFilesByPracticianId(selectedPractician)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((patientFiles) => {
            let list = [];
            patientFiles.forEach((item) => {
              item.type = "PATIENT_FILE";
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
                    } else {
                      item.img = this.avatars.man;
                    }
                  }
                );
              } else {
                if (item?.civility == "MME") {
                  item.img = this.avatars.women;
                } else {
                  item.img = this.avatars.man;
                }
              }
              list.push(item);
            });
            this.concernList.next(list);
          });
      }

      this.lastObjectList = this.objectsList;
    } else {
      if (
        this.localSt.retrieve("role") == "SECRETARY" &&
        this.selectedPracticianId == null
      ) {
        let list = [];
        this.concernList.next(list);
      }
    }
  }

  objectSelection(item) {
    let selectedObj = item.object[0];
    if (selectedObj && selectedObj.title != "autre") {
      const objectDto = {
        senderId: this.featureService.getUserId(),
        sendedForId: item.for && item.for[0] && item.for[0].id,
        receiverId: item.to && item.to[0] && item.to[0].id,
        objectId: selectedObj.id,
      };
      selectedObj.requestDto = objectDto;
      let newData = {
        id: selectedObj.id,
        name: selectedObj.title,
        body: null,
        file: null,
      };
      const body = this.requestTypeService
        .getObjectBody(objectDto)
        .pipe(takeUntil(this._destroyed$))
        .pipe(
          tap((resBody: any) => {
            newData.body = resBody.body;
          })
        );
      if (selectedObj.allowDocument) {
        const doc = this.requestTypeService
          .getDocument(objectDto)
          .pipe(takeUntil(this._destroyed$))
          .pipe(
            tap((response: any) => {
              const blob = new Blob([response.body]);
              var fileOfBlob = new File([blob], selectedObj.title + ".pdf");
              newData.file = fileOfBlob;
            })
          );
        forkJoin(body, doc)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((res) => {
            this.selectedObject.next(newData);
          });
      } else {
        forkJoin(body)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((res) => {
            this.selectedObject.next(newData);
          });
      }
      //this.selectedObject.next(result);
      //this.openDialog(selectedObj);
    } else if (selectedObj) {
      this.selectedObject.next({
        id: null,
        title: "Autre",
        name: "Autre",
        body: "",
      });
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

  getTLSGroupByPracticianId() {
    console.log("group")
    return this.accountService
      .getPracticianTelesecretary()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((group: any) => {
        if (group && group.group) {
          this.sendTypeList = [
            { id: SendType.MESSAGING, text: "Messagerie" },
            { id: SendType.SEND_POSTAL, text: "Envoie Postal" },
            { id: SendType.INSTRUCTION, text: "Consignes" },
          ];
          const groupValue = group.group;
          this.getInstructionObjectListByTLSGroupId(groupValue.id);
          let item = {
            id: groupValue.accountId,
            fullName: groupValue.title,
            isSelected: true,
            img: null,
            type: "TELESECRETARYGROUP",
          };
          if (groupValue.photoId) {
            this.documentService.downloadFile(groupValue.photoId).subscribe(
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
          }
          this.practicianTLSGroup = item;
        }
      });
  }
  getInstructionObjectListByTLSGroupId(id: any) {
    this.objectsService.getAllByTLS(id).subscribe((objects) => {
      this.instructionObjectsList = objects.map((e) => {
        return { id: e.id, title: e.name, name: e.name, destination: "TLS" };
      });
    });
  }

  typeSelection(item) {
    if (
      item !== null &&
      item.type &&
      item.type !== null &&
      item.type.length > 0
    ) {
      if (this.lastSendType !== item.type[0].id) {
        this.lastSendType = item.type[0].id;
        switch (item.type[0].id) {
          case SendType.MESSAGING:
            this.isTypesVisible = true;
            this.isCCListVisible = true;
            this.isForListVisible = true;
            this.isFreeObjectVisible = this.isOtherObject() ? true : false;
            this.isObjectSelectVisible = this.isSecretary() ? false : true;
            this.isInstruction = false;
            this.objectsList = this.lastObjectList;
            this.toList.next(this.practicianFullToList);
            break;
          case SendType.SEND_POSTAL:
            this.isTypesVisible = true;
            this.isCCListVisible = false;
            this.isForListVisible = true;
            this.isFreeObjectVisible = this.isSecretary() ? true : false;
            this.isObjectSelectVisible = this.isSecretary() ? false : true;
            this.isInstruction = false;
            this.objectsList = this.lastObjectList;
            this.toList.next(this.practicianFullToList);
            break;
          case SendType.INSTRUCTION:
            this.isTypesVisible = true;
            this.isCCListVisible = true;
            this.isForListVisible = false;
            this.isFreeObjectVisible = false;
            this.isObjectSelectVisible = true;
            this.isInstruction = this.isSecretary() ? false : true;
            this.objectsList = this.instructionObjectsList;
            this.toList.next([this.practicianTLSGroup]);
            this.ccList.next(
              this.practicianFullToList.filter(
                (e) => e.id !== this.practicianTLSGroup.id
              )
            );
            break;

          default:
            break;
        }
      }
    }
  }

  sendInstruction(message) {
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
        sentForPatientFile:
          message.for && message.for[0] ? message.for[0].id : null,
        senderForCivility:
          message.for && message.for[0] ? message.for[0]?.civility : null,
        senderForPhotoId:
          message.for && message.for[0] ? message.for[0]?.photoId : null,
        senderForfullName:
          message.for && message.for[0] ? message.for[0]?.fullName : null,
      };
    }
    newMessage.sendType = message.type[0].id;
    message.object != "" &&
    message.object[0].name.toLowerCase() !=
      this.globalService.messagesDisplayScreen.other
      ? (newMessage.object = message.object[0].name)
      : (newMessage.object = message.freeObject);
    newMessage.body = message.body;

    this.messageService
      .sendMessage(newMessage)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (mess) => {
          this.featureService.sentState.next(true);
          this.spinner.hide();
          this.router.navigate(["/messagerie-envoyes"], {
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

  private isSecretary(): boolean {
    return (this.role && this.role == "SECRETARY") || false;
  }

  private isPractician(): boolean {
    return (this.role && this.role == "PRACTICIAN") || false;
  }

  private isOtherObject(): boolean {
    return (
      (this.objectsList &&
        this.objectsList.findIndex(
          (obj) => obj.id == 0 && obj.title == "Autre"
        ) !== -1) ||
      false
    );
  }
  send(message) {
    this.spinner.show();
    this.uuid = uuid();
    const newMessage = new Message();
    newMessage.sendType = this.lastSendType;
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
        sentForPatientFile:
          message.for && message.for[0] ? message.for[0].id : null,
        senderForCivility:
          message.for && message.for[0] ? message.for[0]?.civility : null,
        senderForPhotoId:
          message.for && message.for[0] ? message.for[0]?.photoId : null,
        senderForfullName:
          message.for && message.for[0] ? message.for[0]?.fullName : null,
      };
    } else {
      newMessage.sender = {
        senderId: this.featureService.getUserId(),
        originalSenderId: this.featureService.getUserId(),
        sendedForId: message.for && message.for[0] ? message.for[0].id : null,
      };
      if (message.concerns && message.concerns[0]) {
        newMessage.sender.concernsId =
          message.concerns && message.concerns[0]
            ? message.concerns[0].id
            : null;
        newMessage.sender.concernsCivility =
          message.concerns && message.concerns[0]
            ? message.concerns[0]?.civility
            : null;
        newMessage.sender.concernsPhotoId =
          message.concerns && message.concerns[0]
            ? message.concerns[0]?.photoId
            : null;
        newMessage.sender.concernsFullName =
          message.concerns && message.concerns[0]
            ? message.concerns[0]?.fullName
            : null;
      }
    }
    message.object != "" &&
    message.object[0].name.toLowerCase() !=
      this.globalService.messagesDisplayScreen.other
      ? (newMessage.object = message.object[0].name)
      : (newMessage.object = message.freeObject);
    newMessage.body = message.body;
    if (message.file !== undefined && message.file !== null) {
      newMessage.uuid = this.uuid;
      this.selectedFiles = message.file;

      const formData = new FormData();
      if (this.selectedFiles) {
        newMessage.hasFiles = true;
        formData.append("model", JSON.stringify(newMessage));
        formData.append(
          "file",
          this.selectedFiles[0],
          this.selectedFiles[0].name
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
  openConfirmModel() {
    $("#firstModal").modal("hide");
    $("#confirmModal").modal("toggle");
  }
  activateSenPostalOption() {
    if (this.addOptionConfirmed) {
      this.featureService.activateSendPostal().subscribe((res) => {
        this.sendPostal = true;
        $("#confirmModal").modal("hide");
        $("#successModal").modal("toggle");
      });
    }
  }
  checkboxChange(event) {
    if (event.target.checked) {
      this.addOptionConfirmed = true;
    } else {
      this.addOptionConfirmed = false;
    }
  }
}
