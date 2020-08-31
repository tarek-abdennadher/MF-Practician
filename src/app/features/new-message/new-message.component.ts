import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import {
  FormGroup,
  Validators,
  FormControl,
  FormBuilder,
} from "@angular/forms";
import { GlobalService } from "@app/core/services/global.service";
import { ViewChild } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { NotifierService } from "angular-notifier";
import { MatDialog } from "@angular/material/dialog";
import { NewMessageWidgetService } from "../new-message-widget/new-message-widget.service";
import { takeUntil, tap } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { RequestTypeService } from "../services/request-type.service";
import { MessageService } from "../services/message.service";
import { v4 as uuid } from "uuid";
import { NodeeService } from "../services/node.service";
import { Router } from "@angular/router";
import { Message } from "@app/shared/models/message";
import { ContactsService } from "../services/contacts.service";
import { FeaturesService } from "../features.service";
import { LocalStorageService } from "ngx-webstorage";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MyPatientsService } from "../services/my-patients.service";
import { AccountService } from "../services/account.service";
import { SendType } from "@app/shared/enmus/send-type";
import { ObjectsService } from "../services/objects.service";
import { EventEmitter } from "@angular/core";
import { HlsSendMEssage } from "./hlsSendMessage.model";
import { HlsSendMessageService } from "./new-message.service";
@Component({
  selector: "app-new-message",
  templateUrl: "./new-message.component.html",
  styleUrls: ["./new-message.component.scss"],
})
export class NewMessageComponent implements OnInit {
  /////
  public uuid: string;
  private _destroyed$ = new Subject();
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
  practicianObjectList = [];
  selectedFiles: any;
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

  lastObjectList: any[];

  //////
  private _forList = [];
  private _objectsList = [];
  private _messageTypesList = [];
  imageSource: string;
  imagedropdown: string;
  imageLoading: string;
  isMessageTypesVisible: boolean;
  emergencyText: string = "";
  dropdownSettings: any;
  dropdownSettingsListObject: any;
  dropdownSettingsPatientToList: any;
  dropdownSettingsForList: any = {};
  dropdownSettingsTypesList: any;
  dropdownSettingsConcernList: any;
  showFile: any;

  set objectsList(objectsList: any) {
    this._objectsList = objectsList;
    this.objectFilteredList = objectsList;
  }
  set messageTypesList(messageTypesList: any) {
    this._messageTypesList = [
      { id: SendType.MESSAGING, text: "Messagerie" },
      { id: SendType.SEND_POSTAL, text: "Envoie Postal" },
    ];
    this.sendMessageForm.patchValue({ type: [messageTypesList[0]] });
  }

  sendPostalAction = new EventEmitter();
  sendEmailAction = new EventEmitter();
  sendInstructionAction = new EventEmitter();
  sendAction = new EventEmitter();
  toListAction = new EventEmitter();
  objectAction = new EventEmitter();
  typeAction = new EventEmitter();

  information: string = "information";
  texts: any;
  file: any;
  isPatient: boolean = false;
  isMedical: boolean;
  isTls: boolean;
  isAddress: boolean;
  hasError: boolean;
  isInfoDisplay: boolean = false;
  newFlag: boolean = false;
  showPatientFile: boolean = true;
  public sendMessageForm: FormGroup;
  otherObject = false;
  contactType = false;
  steps: any;
  toListParsed = [];
  forListParsed = [];
  public toFilteredList: any;
  public ccParsedList: any;
  public forFilteredList: any;
  public objectFilteredList: any;
  public concernFilteredList: any;
  public selectContext = false;
  maxlengthBody = 99999999999999999999;
  charactersRemaining = 500;

  submited = false;
  constructor(
    public hlsSendMessageService: HlsSendMessageService,
    private formBuilder: FormBuilder,
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
    private objectsService: ObjectsService,
    private messageWidgetService: NewMessageWidgetService
  ) {
    this.texts = hlsSendMessageService.texts;
    this.sendMessageForm = this.formBuilder.group({
      type: ["", Validators.required],
      to: ["", Validators.required],
      cc: [""],
      for: [""],
      concerns: [""],
      address: [""],
      object: ["", Validators.required],
      freeObject: ["", Validators.required],
      body: ["", Validators.required],
      file: [""],
    });
    this.isPatient = false;
    this.isMedical = false;
    this.isTls = false;
    this.isAddress = false;
    this.hasError = false;
    this.steps = { valid: false, hasError: false, click: false };

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

  get objectsList() {
    return this._objectsList;
  }

  get messageTypesList() {
    return this._messageTypesList;
  }
  get ctr() {
    return this.sendMessageForm.controls;
  }
  ngOnInit(): void {
    this._messageTypesList = [
      { id: SendType.MESSAGING, text: "Messagerie" },
      { id: SendType.SEND_POSTAL, text: "Envoie Postal" },
    ];
    this.sendMessageForm.patchValue({ type: [this.messageTypesList[0]] });
    if (this.user?.photoId) {
      this.documentService.downloadFile(this.user?.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            this.imageSource = myReader.result.toString();
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

    $(document).ready(function () {
      $(window).keydown(function (event) {
        if (event.keyCode == 13) {
          event.preventDefault();
          return false;
        }
      });
    });
    if (this.connectedUserType == "PATIENT") {
      this.isPatient = true;
    } else if (this.connectedUserType == "MEDICAL") {
      this.isMedical = true;
    } else if (this.connectedUserType == "SECRETARY") {
      this.isMedical = true;
    } else if (this.connectedUserType == "TLS") {
      this.isTls = true;
    }

    this.toListSubscription();
    this.ccListSubscription();
    this.forListSubscription();
    this.concernListSubscription();
    this.selectedObjectSubscription();
    this.dropdownSettings = {
      singleSelection: false,
      text: "Sélectionner un ou plusieurs correspondants",
      searchPlaceholderText: "Rechercher",
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      filterSelectAllText: "Sélectionner tous les résultats filtrés",
      filterUnSelectAllText: "Désélectionner tous les résultats filtrés",
      classes: "myclass custom-class",
      searchEmptyResult: "Rien n'a été trouvé...",
      noDataLabel: "Aucune données",
      badgeShowLimit: 3,
      maxHeight: "auto",
      enableCheckAll: false,
      limitSelection: 100,
    };
    this.dropdownSettingsPatientToList = {
      singleSelection: true,
      text: "Sélectionner un contact ",
      searchPlaceholderText: "Rechercher",
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      filterSelectAllText: "Sélectionner tous les résultats filtrés",
      filterUnSelectAllText: "Désélectionner tous les résultats filtrés",
      classes: "myclass custom-class",
      searchEmptyResult: "Rien n'a été trouvé...",
      noDataLabel: "Aucune données",
      badgeShowLimit: 3,
      maxHeight: "auto",
      enableCheckAll: false,
    };
    Object.assign(
      this.dropdownSettingsForList,
      this.dropdownSettingsPatientToList
    );
    this.dropdownSettingsForList.text = this.isPatient
      ? "Sélectionner une personne attachée à votre compte"
      : this.isSecretary()
      ? "Sélectionner un contact"
      : "Sélectionner un patient concerné si nécessaire";
    this.dropdownSettingsListObject = {
      singleSelection: true,
      text: "Sélectionner un objet parmi votre liste",
      searchPlaceholderText: "Rechercher",
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      filterSelectAllText: "Sélectionner tous les résultats filtrés",
      filterUnSelectAllText: "Désélectionner tous les résultats filtrés",
      classes: "myclass custom-class",
      searchEmptyResult: "Rien n'a été trouvé...",
      noDataLabel: "Aucune données",
      badgeShowLimit: 3,
      maxHeight: "auto",
      enableCheckAll: false,
    };

    this.dropdownSettingsTypesList = {
      ...this.dropdownSettingsListObject,
      text: "Sélectionner le type d'envoi",
    };

    this.dropdownSettingsConcernList = {
      ...this.dropdownSettingsListObject,
      text: "Sélectionner un patient concerné si nécessaire",
    };
  }

  ccListSubscription() {
    let selectedElements;
    if (this.ccList) {
      this.ccList.subscribe((elm) => {
        this.ccParsedList = elm;
        selectedElements = elm.filter(
          (e) => e.isSelected && e.isSelected == true
        );
        this.sendMessageForm.patchValue({
          cc: selectedElements,
        });
      });
    }
  }
  private toListSubscription() {
    let selectedElements;
    this.toList.subscribe((elm) => {
      this.toListParsed = elm;
      this.toFilteredList = elm;
      if (!this.isInstruction) {
        this.ccParsedList = elm;
      }
      selectedElements = elm.filter(
        (e) => e.isSelected && e.isSelected == true
      );
      if (!this.isPatient) {
        if (this.sendMessageForm.value.to?.length !== 0) {
          this.sendMessageForm.value.to?.forEach((to) => {
            this.contactType = to.type !== "PATIENT" ? true : false;
          });
        }
      }
      this.otherObjectUpdate();
      this.sendMessageForm.patchValue({
        to: selectedElements,
      });
    });
  }

  private forListSubscription() {
    let selectedElements;
    this.forList.subscribe((elm) => {
      this.forListParsed = elm;
      this.forFilteredList = elm;

      selectedElements = elm.filter(
        (e) => e.isSelected && e.isSelected == true
      );
      if (!this.isPatient) {
        if (
          this.sendMessageForm.value.for &&
          this.sendMessageForm.value.for.length !== 0
        ) {
          this.sendMessageForm.value.for.forEach((forItem) => {
            this.contactType = forItem.type !== "PATIENT" ? true : false;
          });
        }
      }

      this.otherObjectUpdate();
    });
    this.sendMessageForm.patchValue({
      for: selectedElements,
    });
  }
  private concernListSubscription() {
    this.concernList.subscribe((elm) => {
      this.concernFilteredList = elm;
    });
  }

  selectedObjectSubscription() {
    let selectedElements;
    this.selectedObject.subscribe((res) => {
      if (res) {
        if (res.update) {
          this.sendMessageForm.patchValue({
            body: res.body,
          });
          if (res.file) {
            this.sendMessageForm.patchValue({
              file: [res.file],
            });
            this.showFile = res.showFile;
          }
        } else {
          selectedElements = this.objectFilteredList.filter(
            (e) => e.id == res.id
          );
          selectedElements[0].name = res.name;
          this.sendMessageForm.patchValue({
            object: selectedElements,
          });
          this.sendMessageForm.patchValue({
            freeObject: res.name,
          });
          this.sendMessageForm.patchValue({
            body: res.body,
          });
          if (res.file) {
            this.sendMessageForm.patchValue({
              file: [res.file],
            });
            this.showFile = res.showFile;
          }
        }
      } else {
        this.sendMessageForm.patchValue({
          object: "",
        });
      }
    });
  }

  private otherObjectUpdate() {
    this.otherObject =
      this.sendMessageForm.value.object.length == 1
        ? this.sendMessageForm.value.object[0].title.toLowerCase() ===
          this.hlsSendMessageService.texts.other
          ? true
          : false
        : null;
    this.hasError = false;
    this.sendMessageForm.controls["body"].enable();
    this.sendMessageForm.patchValue({
      body:
        this.sendMessageForm.value.object.length == 1
          ? this.sendMessageForm.value.object[0].body
          : "",
    });
    this.onObjectChanged();
  }
  onFileChange(event) {
    this.sendMessageForm.patchValue({
      file: event.target.files,
    });
  }

  public removeAttachment() {
    this.sendMessageForm.patchValue({
      file: undefined,
    });
  }

  send() {
    if (this.sendMessageForm.invalid) {
      this.steps.hasError = true;
    }
    if (
      this.sendMessageForm.value.object.length == 1 &&
      this.sendMessageForm.value.object[0].title.toLowerCase() != "Autre"
        ? !["", undefined, null].includes(this.sendMessageForm.value.body) &&
          this.sendMessageForm.value.to.length != 0
        : !["", undefined, null].includes(this.sendMessageForm.value.body) &&
          this.sendMessageForm.value.to.length != 0 &&
          this.sendMessageForm.value.freeObject != ""
    ) {
      this.steps.click = true;
      let sendModel = new HlsSendMEssage();
      sendModel = Object.assign(this.sendMessageForm.value);
      sendModel.file = this.sendMessageForm.get("file").value;
      this.sendAction.emit(sendModel);
    }
  }
  sendPostal() {
    if (this.sendMessageForm.invalid) {
      this.steps.hasError = true;
    }
    if (
      this.sendMessageForm.value.to.length != 0 &&
      (this.sendMessageForm.value.freeObject != "" ||
        this.sendMessageForm.value.object.length == 1) &&
      !["", undefined, null].includes(this.sendMessageForm.value.body)
    ) {
      this.steps.click = true;
      // if (this.sendMessageForm.value.to.address != null || this.isAddress == true) {
      //   let sendModel = new HlsSendMEssage();
      //   sendModel = Object.assign(this.sendMessageForm.value);
      //   sendModel.file = this.file;
      //   this.sendPostalAction.emit(sendModel);
      // } else {S
      //   this.isAddress = true;
      // }
    }
  }
  checkObjectValidator(){
   if(this.contactType &&  ! this.isSecretary() || this.isInstruction){
    this.sendMessageForm.controls.object.setValidators([
      Validators.required,
    ]);

   } else {
    this.sendMessageForm.controls.object.clearValidators();
    this.sendMessageForm.controls.object.updateValueAndValidity();
   }
  }
  sendEmail() {
    this.submited = true;
    this.checkObjectValidator();
    if (this.sendMessageForm.invalid) {
      return;
    }
    if (
      this.sendMessageForm.value.object.length == 1 &&
      this.sendMessageForm.value.object[0].title.toLowerCase() != "Autre"
        ? !["", undefined, null].includes(this.sendMessageForm.value.body) &&
          this.sendMessageForm.value.to.length != 0
        : !["", undefined, null].includes(this.sendMessageForm.value.body) &&
          this.sendMessageForm.value.to.length != 0 &&
          !["", undefined, null].includes(this.sendMessageForm.value.freeObject)
    ) {
      this.steps.click = true;
      let sendModel = new HlsSendMEssage();
      sendModel = Object.assign(this.sendMessageForm.value);
      sendModel.file = this.sendMessageForm.get("file").value;
      this.sendMessage(sendModel);
    }
  }
  sendInstructionEmit() {
    if (this.sendMessageForm.invalid) {
      this.steps.hasError = true;
    }

    this.steps.click = true;
    let sendModel = new HlsSendMEssage();
    sendModel = Object.assign(this.sendMessageForm.value);
    this.sendInstruction(sendModel);
  }

  search(query: string) {
    let result = this.select(query);
    this.toList.subscribe((elm) => {
      elm = result;
    });
  }
  select(query: string): string[] {
    let result: string[] = [];
    this.toList.subscribe((areas) => {
      for (let a of areas) {
        if (a.toLowerCase().indexOf(query) > -1) {
          result.push(a);
        }
      }
    });

    return result;
  }
  checkObjectAuthorization() {
    return this.sendMessageForm.value.to[0].requestTypes &&
      this.sendMessageForm.value.to[0].requestTypes.length === 0
      ? 0
      : this.sendMessageForm.value.to[0].requestTypes.filter(
          (a) => a.id === this.sendMessageForm.value.object[0].id
        ).length;
  }
  onForChanged() {
    if (this.isSecretary()) {
      let selectedTo = [];
      let selectedFor = this.sendMessageForm.value.for;
      selectedTo = this.sendMessageForm.value.to;
      if (selectedTo && selectedTo.length > 0 && selectedFor.length == 1) {
        selectedTo = selectedTo.filter((e) =>
          selectedFor.some((s) => s.id != e.id)
        );
        this.sendMessageForm.patchValue({
          to: selectedTo,
        });
      }
    }
    if (!this.isPatient && !this.isSecretary) {
      let selectedTo = [];
      let selectedFor = this.sendMessageForm.value.for;
      selectedTo = this.sendMessageForm.value.to;
      if (selectedTo && selectedTo.length > 0) {
        selectedTo = selectedTo.filter((e) => e.id != selectedFor.id);
        this.sendMessageForm.patchValue({
          to: selectedTo,
        });
      }
    }
    if (this.isPatient) {
      let context = false;
      if (
        this.sendMessageForm.value.for &&
        this.sendMessageForm.value.for.length > 0
      ) {
        context = true;
      }
      const obj = {
        forContext: context,
        formValue: this.sendMessageForm.value,
      };
      this.objectSelection(obj);
    }
  }
  updateSelectionSeting(limitSelection) {
    this.dropdownSettings = {
      singleSelection: false,
      text: "Sélectionner des contacts",
      searchPlaceholderText: "Rechercher",
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      filterSelectAllText: "Sélectionner tous les résultats filtrés",
      filterUnSelectAllText: "Désélectionner tous les résultats filtrés",
      classes: "myclass custom-class",
      searchEmptyResult: "Rien n'a été trouvé...",
      noDataLabel: "Aucune données",
      badgeShowLimit: 3,
      maxHeight: "auto",
      enableCheckAll: false,
      limitSelection: limitSelection,
    };
  }
  onObjectChanedSelect() {
    this.selectContext = true;
    this.onObjectChanged();
  }

  onObjectChanged() {
    if (this.sendMessageForm && this.sendMessageForm.value.to) {
      this.getSelectedToList(this.sendMessageForm.value);
    } else {
      this.getSelectedToList(null);
    }
    if (
      this.selectContext &&
      this.sendMessageForm &&
      this.sendMessageForm.value.object
    ) {
      this.objectSelection(this.sendMessageForm.value);
      this.selectContext = false;
    } else {
      this.sendMessageForm.patchValue({
        object: "",
      });
      this.sendMessageForm.patchValue({
        file: null,
      });

      this.selectContext = false;
    }
    this.isInfoDisplay =
      this.sendMessageForm.value.object.length == 1 ? true : false;
    this.information =
      this.sendMessageForm.value.object.length == 1
        ? this.sendMessageForm.value.object[0].information
          ? this.sendMessageForm.value.object[0].information
          : "information"
        : "";
    if (this.isInfoDisplay == false) {
      this.sendMessageForm.patchValue({ body: null });
      this.otherObject = false;
    }
    if (
      this.isPatient &&
      this.sendMessageForm.value.to?.length == 1 &&
      this.sendMessageForm.value.object?.length == 1 &&
      this.checkObjectAuthorization() !== 0
    ) {
      this.hasError = true;
      this.sendMessageForm.controls["body"].disable();
      this.sendMessageForm.patchValue({
        body: null,
      });
    } else {
      if (!this.isPatient && !this.isTls) {
        if (this.sendMessageForm.value.to.length == 1) {
          this.contactType = true;
        } else {
          this.contactType = false;
          this.otherObject = true;
          this.sendMessageForm.patchValue({
            freeObject: "",
            body: null,
          });
        }
      }
      if (
        this.sendMessageForm.value.object &&
        this.sendMessageForm.value.object.length > 0
      ) {
        this.otherObject =
          this.sendMessageForm.value.object.length == 1
            ? this.sendMessageForm.value.object[0].title.toLowerCase() ==
              this.hlsSendMessageService.texts.other
              ? true
              : false
            : null;
        this.newFlag = this.otherObject;
        this.maxlengthBody = this.isPatient
          ? this.sendMessageForm.value.object.length == 1 &&
            this.sendMessageForm.value.object[0].title.toLowerCase() ==
              this.hlsSendMessageService.texts.other
            ? 500
            : 99999999999999999999
          : null;

        this.hasError = false;
        this.sendMessageForm.controls["body"].enable();
        this.sendMessageForm.patchValue({
          body: this.sendMessageForm.value.object[0].body,
        });
      } else {
        this.otherObject = false;
      }
    }
    if (this.isSecretary()) {
      let selectedFor = [];
      selectedFor = this.sendMessageForm.value.for;
      let selectedTo = this.sendMessageForm.value.to;
      if (
        selectedTo &&
        selectedTo.length > 0 &&
        selectedFor &&
        selectedFor.length > 0
      ) {
        selectedFor = selectedFor.filter((e) =>
          selectedTo.some((s) => s.id != e.id)
        );
        this.sendMessageForm.patchValue({
          for: null,
        });
      }
    }
    if (!this.isPatient && !this.isSecretary) {
      let selectedTo = [];
      let selectedFor = this.sendMessageForm.value.for;
      selectedTo = this.sendMessageForm.value.to;
      if (
        selectedTo &&
        selectedTo.length > 0 &&
        selectedFor != "" &&
        selectedFor != null
      ) {
        if (selectedTo.some((s) => s.id == selectedFor.id)) {
          this.sendMessageForm.patchValue({
            for: null,
          });
        }
      }
    }
    if (this.isMedical && !this.isSecretary()) {
      if (
        this.sendMessageForm.value.to &&
        this.sendMessageForm.value.to.length == 1 &&
        this.sendMessageForm.value.to[0].type == "PATIENT"
      ) {
        this.showPatientFile = false;
      } else {
        this.showPatientFile = true;
      }
    }
  }
  charactersRemainingKeyup() {
    this.charactersRemaining = 500 - this.sendMessageForm.value.body.length;
  }
  onConcernChanged() {}
  onTypeChanged() {
    this.onObjectChanged();
    this.typeSelection(this.sendMessageForm.value);
  }

  ///

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
            this.messageWidgetService.toggleObs.next();
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
            this.messageWidgetService.toggleObs.next();
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
    return this.accountService
      .getPracticianTelesecretary()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((group: any) => {
        if (group && group.group) {
          this._messageTypesList = [
            { id: SendType.MESSAGING, text: "Messagerie" },
            { id: SendType.SEND_POSTAL, text: "Envoie Postal" },
            { id: SendType.INSTRUCTION, text: "Consignes" },
          ];
          this.sendMessageForm.patchValue({ type: [this.messageTypesList[0]] });
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
    this.submited = true;
    if (this.sendMessageForm.invalid) {
      return;
    }
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
          this.messageWidgetService.toggleObs.next();
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

  public isSecretary(): boolean {
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
}
