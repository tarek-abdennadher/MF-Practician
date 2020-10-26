import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormArray,
  FormControl,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Subject, BehaviorSubject } from "rxjs";
import { emailValidator } from "@app/core/Validators/email.validator";
import { isBefore } from "ngx-bootstrap/chronos";
import { PatientFileService } from "./patient-file.service";
import { CorrespondencePipe } from "@app/shared/pipes/correspondence.pipe";
import { CivilityPipe } from "@app/shared/pipes/civility.pipe";
import { Router } from "@angular/router";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { MessagingListService } from "@app/features/services/messaging-list.service";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { GlobalService } from "@app/core/services/global.service";
import { DialogService } from "@app/features/services/dialog.service";
import { PaginationService } from "@app/features/services/pagination.service";
import { DomSanitizer } from "@angular/platform-browser";
import { takeUntil } from "rxjs/operators";
import { DateValidator } from "./date-validator";
declare var $: any;
function requiredValidator(c: AbstractControl): { [key: string]: any } {
  const email = c.get("email");
  const phoneNumber = c.get("phoneNumber");
  if (!email.value && !phoneNumber.value) {
    return { requiredValidator: true };
  }
  return null;
}
@Component({
  selector: "app-patient-file",
  templateUrl: "./patient-file.component.html",
  styleUrls: ["./patient-file.component.scss"],
  providers: [CorrespondencePipe, CivilityPipe],
})
export class PatientFileComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  public selectedTabIndex: number = 0;
  labels;
  placement = "bottom";
  errors;
  displayMaidenName: boolean = false;
  displayMaidenName2: boolean = false;
  displayOtherCorrespondence: boolean = false;
  isList: boolean = true;
  isnoteList: boolean = true;
  public personalInfoForm: FormGroup;
  public addAttachedInfoForm: FormGroup;
  public attachedInfoForm: FormGroup;
  public noteForm: FormGroup;
  public maxDate = new Date();
  submitted = false;
  noteSubmitted = false;
  patientSubmitted = false;
  patientUpdated = false;
  attachedImageSource: string;
  /** Messaging attributes */
  patientFileId: number;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
    tls: string;
  };
  messages: Array<any> = new Array();
  itemsList: Array<any>;
  pageNo = 0;
  direction: OrderDirection = OrderDirection.DESC;
  filtredItemList: Array<any> = new Array();
  scroll = false;
  isCheckbox = false;
  click: boolean = false;
  /** Inputs */
  @Input("imageSource") imageSource: string;
  @Input("practicianImage") practicianImage: string;
  @Input("noteimageSource") noteimageSource: string;
  @Input("userRole") userRole: string;
  @Input("popup") popup: boolean = false;
  @Input() isAdd: boolean = false;
  /* Patient file information */
  @Input("patient") patient = new Subject();
  /* Linked patients information */
  @Input("linkedPatients") linkedPatients = new Subject<[]>();
  /* Category List */
  @Input("categoryList") categoryList = new Subject<[]>();
  /* Outputs */
  @Output("submitAction") submitAction = new EventEmitter();
  @Output("submitNoteAction") submitNoteAction = new EventEmitter();
  @Output("submitAttachedAction") submitAttachedAction = new EventEmitter();
  @Output("updateAttachedAction") updateAttachedAction = new EventEmitter();
  @Output("archieveNoteAction") archieveNoteAction = new EventEmitter();
  @Output("cancelAction") cancelAction = new EventEmitter();
  @Input("notes") notes = new BehaviorSubject([]);
  categories = [];
  attachedPatients = [];
  isLabelShow: boolean = false;
  phones = [];
  noteList = [];
  addnewPhone = new Subject<boolean>();
  otherPhones = new Subject<any[]>();
  isFutureDate: boolean;
  public isPhonesValid = false;
  public info: any;
  isAddPatient: boolean = false;
  correspondenceList = [];
  civilityList = [];
  constructor(
    private formBuilder: FormBuilder,
    private patientFileService: PatientFileService,
    private documentService: MyDocumentsService,
    private messagesServ: MessagingListService,
    private router: Router,
    private globalService: GlobalService,
    public dialogService: DialogService,
    public pagination: PaginationService,
    private sanitizer: DomSanitizer
  ) {
    this.isnoteList = true;
    this.isLabelShow = false;
    this.labels = this.patientFileService.labels;
    this.errors = this.patientFileService.errors;
    this.maxDate.setDate(new Date().getDate() - 1);
    this.avatars = this.globalService.avatars;
    this.click = false;
  }
  get ctr() {
    return this.personalInfoForm.controls;
  }
  get f() {
    return this.noteForm.controls;
  }
  get f1() {
    return this.addAttachedInfoForm.controls;
  }
  get f2() {
    return this.attachedInfoForm.controls;
  }
  get phoneList() {
    return <FormArray>this.personalInfoForm.get("otherPhones");
  }
  ngOnInit(): void {
    this.selectedTabIndex = 0;
    this.filtredItemList = [];
    this.itemsList = [];
    this.noteList = [];
    this.attachedPatients = [];
    this.getCivility();
    this.getCorrespondence();
    this.maxDate.setDate(new Date().getDate() - 1);
    this.initPersonalForm();
    this.initNoteForm();
    this.initAddAttachedInfoForm();
    this.initAttachedInfoForm();
    this.categoryList.pipe(takeUntil(this._destroyed$)).subscribe((res) => {
      if (res) {
        this.categories = res;
      }
    });
    this.patient.pipe(takeUntil(this._destroyed$)).subscribe((val) => {
      this.isList = true;
      this.click = false;
      if (val) {
        this.selectedTabIndex = 0;
        this.info = val;
        this.pageNo = 0;
        this.getPersonalInformation(val);
        this.filtredItemList = [];
        this.itemsList = [];
      }
    });
    this.linkedPatients.pipe(takeUntil(this._destroyed$)).subscribe((res) => {
      if (res) {
        this.attachedPatients = res;
      }
    });
    this.notes.pipe(takeUntil(this._destroyed$)).subscribe((res) => {
      if (res) {
        this.noteList = res;
      }
    });
    setTimeout(() => {
      $(".selectpicker").selectpicker("refresh");
    }, 500);
  }
  getCorrespondence() {
    this.patientFileService
      .getCorrespondence()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        this.correspondenceList = resp;
      });
  }
  getCivility() {
    this.patientFileService
      .getCivility()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        this.civilityList = resp;
      });
  }
  initPersonalForm() {
    this.personalInfoForm = this.formBuilder.group({
      id: new FormControl(null),
      patientId: new FormControl(null),
      practicianId: new FormControl(null),
      civility: new FormControl(null, Validators.required),
      birthday: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      maidenName: new FormControl(null),
      phoneNumber: new FormControl(null),
      email: new FormControl(null, emailValidator),
      address: new FormControl(null),
      zipCode: new FormControl(null),
      city: new FormControl(null),
      additionalAddress: new FormControl(null),
      photoId: new FormControl(null),
      category: new FormControl(null),
      invitationStatus: new FormControl(null),
    });
    this.personalInfoForm.setValidators(requiredValidator);
  }

  initAttachedInfoForm() {
    this.attachedInfoForm = new FormGroup({
      id: new FormControl(null),
      civility: new FormControl(null, Validators.required),
      correspondence: new FormControl(null, Validators.required),
      otherCorrespondence: new FormControl(null),
      birthday: new FormControl(null, [
        Validators.required,
        DateValidator.dateVaidator,
      ]),
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      maidenName: new FormControl(null),
      phoneNumber: new FormControl(null),
      address: new FormControl(null),
      zipCode: new FormControl(null),
      city: new FormControl(null),
      additionalAddress: new FormControl(null),
      photoId: new FormControl(null),
    });
  }
  initAddAttachedInfoForm() {
    this.addAttachedInfoForm = new FormGroup({
      civility: new FormControl(null, Validators.required),
      correspondence: new FormControl(null, Validators.required),
      otherCorrespondence: new FormControl(null),
      birthday: new FormControl(null, [
        Validators.required,
        DateValidator.dateVaidator,
      ]),
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      maidenName: new FormControl(null),
      phoneNumber: new FormControl(null),
      address: new FormControl(null),
      zipCode: new FormControl(null),
      city: new FormControl(null),
      additionalAddress: new FormControl(null),
      photoId: new FormControl(null),
    });
  }
  initNoteForm() {
    this.noteForm = this.formBuilder.group({
      id: new FormControl(null),
      value: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
    });
  }

  getPersonalInformation(patient) {
    this.patientFileId = patient.id;
    if (patient.phones && patient?.phones.length != 0) {
      this.isLabelShow = true;
      this.otherPhones.next(patient.phones);
    }
    if (patient?.civility == "MME") {
      this.displayMaidenName = true;
    } else {
      this.displayMaidenName = false;
    }
    this.personalInfoForm.patchValue({
      id: patient.id ? patient.id : null,
      patientId: patient.patientId ? patient.patientId : null,
      practicianId: patient.practicianId ? patient.practicianId : null,
      civility: patient.civility ? patient.civility : null,
      birthday: patient.birthday ? new Date(patient.birthday) : null,
      lastName: patient.lastName ? patient.lastName : null,
      firstName: patient.firstName ? patient.firstName : null,
      maidenName: patient.maidenName ? patient.maidenName : null,
      phoneNumber: patient.phoneNumber ? patient.phoneNumber : "+33",
      email: patient.email ? patient.email : null,
      address: patient.address ? patient.address : null,
      zipCode: patient.zipCode ? patient.zipCode : null,
      city: patient.city ? patient.city : null,
      additionalAddress: patient.additionalAddress
        ? patient.additionalAddress
        : null,
      photoId: patient.photoId ? patient.photoId : null,
      category: patient.category ? patient.category.id : null,
      invitationStatus: patient.invitationStatus
        ? patient.invitationStatus
        : null,
    });
    this.getPatientInbox(this.pageNo);
  }
  changeMaidenName() {
    if (this.personalInfoForm.value.civility == "MME") {
      this.displayMaidenName = true;
    } else {
      this.displayMaidenName = false;
    }
  }
  cardClicked(item) {
    this.isList = false;
    this.initAttachedInfoForm();
    if (item) {
      let patient = this.attachedPatients.find(
        (element) => element.fullInfo.id == item.fullInfo.id
      );
      if (
        patient.fullInfo.correspondence == "OTHER" ||
        patient.fullInfo.correspondence == "PARENT"
      ) {
        this.displayOtherCorrespondence = true;
      } else {
        this.displayOtherCorrespondence = false;
      }
      this.attachedImageSource = patient.users[0].img;
      this.attachedInfoForm.patchValue({
        id: patient.fullInfo.id ? patient.fullInfo.id : null,
        civility: patient.fullInfo.civility ? patient.fullInfo.civility : null,
        birthday: patient.fullInfo.birthday
          ? new Date(patient.fullInfo.birthday)
          : null,
        lastName: patient.fullInfo.lastName ? patient.fullInfo.lastName : null,
        firstName: patient.fullInfo.firstName
          ? patient.fullInfo.firstName
          : null,
        maidenName: patient.fullInfo.maidenName
          ? patient.fullInfo.maidenName
          : null,
        address: patient.fullInfo.address ? patient.fullInfo.address : null,
        additionalAddress: patient.fullInfo.additionalAddress
          ? patient.fullInfo.additionalAddress
          : null,
        zipCode: patient.fullInfo.zipCode ? patient.fullInfo.zipCode : null,
        city: patient.fullInfo.city ? patient.fullInfo.city : null,
        phoneNumber: patient.fullInfo.phoneNumber
          ? patient.fullInfo.phoneNumber
          : null,
        correspondence: patient.fullInfo.correspondence
          ? patient.fullInfo.correspondence
          : null,
        otherCorrespondence: patient.fullInfo.otherCorrespondence
          ? patient.fullInfo.otherCorrespondence
          : null,
        photoId: patient.fullInfo.photoId ? patient.fullInfo.photoId : null,
      });
    }
  }
  cancel() {
    this.isList = true;
  }
  cancelNoteAdd() {
    this.noteForm.reset();
    this.isnoteList = true;
    this.initNoteForm();
  }
  patientSubmit() {
    this.submitted = true;
    if (this.personalInfoForm.controls["phoneNumber"].errors?.phoneEmptyError) {
      this.personalInfoForm.controls["phoneNumber"].setErrors(null);
    }
    if (this.personalInfoForm.invalid) {
      return;
    }
    const model = {
      id: this.personalInfoForm.value.id,
      patientId: this.personalInfoForm.value.patientId,
      practicianId: this.personalInfoForm.value.practicianId,
      civility: this.personalInfoForm.value.civility,
      birthday: this.personalInfoForm.value.birthday,
      lastName: this.personalInfoForm.value.lastName,
      firstName: this.personalInfoForm.value.firstName,
      maidenName: this.personalInfoForm.value.maidenName,
      phoneNumber: this.personalInfoForm.value.phoneNumber,
      email: this.personalInfoForm.value.email,
      address: this.personalInfoForm.value.address,
      zipCode: this.personalInfoForm.value.zipCode,
      city: this.personalInfoForm.value.city,
      additionalAddress: this.personalInfoForm.value.additionalAddress,
      photoId: this.personalInfoForm.value.photoId,
      categoryId: this.personalInfoForm.value.category,
      phones: this.phones,
      invitationStatus: this.personalInfoForm.value.invitationStatus,
    };
    this.click = !this.click;
    this.submitAction.emit(model);
  }
  addNote() {
    this.noteForm.reset();
    this.isnoteList = false;
    this.initNoteForm();
  }
  NoteSubmit() {
    this.noteSubmitted = true;
    if (this.noteForm.invalid) {
      return;
    }
    const model = {
      id: this.noteForm.value.id,
      value: this.noteForm.value.value,
      noteDate: this.noteForm.value.date,
    };
    this.submitNoteAction.emit(model);
    this.isnoteList = true;
    this.noteForm.reset();
    this.initNoteForm();
  }
  noteCardClicked(item) {
    this.isnoteList = false;
    let note = this.noteList.find((element) => element.id == item.id);
    this.noteForm.patchValue({
      id: note.id ? note.id : null,
      value: note.users[0].fullName ? note.users[0].fullName : null,
      date: note.time ? new Date(note.time) : null,
    });
  }
  archieveNote(item) {
    this.dialogService
      .openConfirmDialog(
        "Etes vous sur de bien vouloir supprimer cette note",
        "Confirmation de supression"
      )
      .afterClosed()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        if (res) {
          this.archieveNoteAction.emit(item.id);
        }
      });
  }

  maxDatecheck(): Date {
    this.isFutureDate = false;
    let maxDate = new Date();
    if (isBefore(maxDate, this.personalInfoForm.controls["birthday"].value)) {
      this.isFutureDate = true;
    }
    maxDate.setDate(new Date().getDate() - 1);
    return maxDate;
  }
  cancelActionClicked() {
    this.cancelAction.emit();
  }
  addPhone() {
    this.addnewPhone.next(true);
    this.isLabelShow = true;
  }
  getPhoneList(event) {
    this.phones = event.value;
    if (this.phones.length > 0) {
      this.isLabelShow = true;
    } else {
      this.isLabelShow = false;
    }
  }
  submitPhones(event) {
    this.isPhonesValid = event;
  }

  onCheckboxChange($event) {
    if ($event.target.checked) {
      this.personalInfoForm.patchValue({
        invitationStatus: "NOT_SENT",
      });
    }
  }

  getPatientInbox(pageNo) {
    this.messagesServ
      .getMessagesByPatientFile(
        this.patientFileId,
        this.personalInfoForm.value.practicianId,
        pageNo,
        this.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        this.messages = res;
        this.messages.sort(function (m1, m2) {
          return (
            new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
          );
        });
        this.itemsList = this.messages.map((item) => this.parseMessage(item));
        this.filtredItemList = this.itemsList;
      });
  }
  getPatientNextInbox(pageNo) {
    this.messagesServ
      .getMessagesByPatientFile(
        this.patientFileId,
        this.personalInfoForm.value.practicianId,
        pageNo,
        this.direction
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        this.messages = res;
        this.messages.sort(function (m1, m2) {
          return (
            new Date(m2.updatedAt).getTime() - new Date(m1.updatedAt).getTime()
          );
        });
        this.itemsList.push(
          ...this.messages.map((item) => this.parseMessage(item))
        );
        this.filtredItemList = this.itemsList;
      });
  }
  parseMessage(message): any {
    let parsedMessage = {
      id: message.id,
      isSeen: message.seenAsReceiver,
      users: [
        {
          id: message.sender.id,
          fullName: message.sender.fullName,
          img: null,
          title: message.sender.jobTitle,
          civility: message.sender.civility,
          type:
            message.sender.role == "PRACTICIAN"
              ? "MEDICAL"
              : message.sender.role,
        },
      ],
      object: {
        name: message.object,
        isImportant: message.importantObject,
      },
      time: message.updatedAt,
      isImportant: message.important,
      hasFiles: message.hasFiles,
      isViewDetail: message.hasViewDetail,
      isMarkAsSeen: true,
      photoId: message.sender.photoId,
      sendType: message.sendType ? message.sendType : null,
    };
    this.documentService
      .getDefaultImageEntity(
        message.sender.senderId,
        message.sendType && message.sendType == "HISTORY"
          ? "PATIENT_FILE"
          : "ACCOUNT"
      )
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            parsedMessage.users[0].img = this.sanitizer.bypassSecurityTrustUrl(
              myReader.result as string
            );
          };
          let ok = myReader.readAsDataURL(response);
        },
        (error) => {
          parsedMessage.users[0].img = this.avatars.user;
        }
      );
    return parsedMessage;
  }

  onScroll() {
    if (this.filtredItemList.length > 9) {
      this.pageNo++;
      this.getPatientNextInbox(this.pageNo);
    }
  }

  messageClicked(item) {
    if (item.sendType && item.sendType == "HISTORY") {
      this.router.navigate(["/messagerie-lire/" + item.id], {
        queryParams: {
          context: "patient",
        },
      });
    } else {
      this.markMessageAsSeen(item);
      this.router.navigate(["/messagerie-lire/" + item.id], {
        queryParams: {
          context: "inbox",
        },
      });
    }
  }

  markMessageAsSeen(event) {
    let messageId = event.id;
    this.messagesServ
      .markMessageAsSeen(messageId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(
        (resp) => {
          if (resp == true) {
            let filtredIndex = this.filtredItemList.findIndex(
              (item) => item.id == messageId
            );
            if (filtredIndex != -1) {
              this.filtredItemList[filtredIndex].isSeen = true;
            }
          }
        },
        (error) => {
          //We have to find a way to notify user by this error
        }
      );
  }

  isInvalidDate(event) {
    let test = event.target.value;

    if (test == "Invalid date") {
      event.target.value = this.errors.invalid_date;
    }
  }
  addPerson() {
    this.isAddPatient = !this.isAddPatient;
    this.initAddAttachedInfoForm();
  }
  changeMaidenName2(civility) {
    if (civility == "MME") {
      this.displayMaidenName2 = true;
      this.attachedImageSource = "assets/imgs/avatar_femme.svg";
    } else {
      if (civility == "M") {
        this.displayMaidenName2 = false;
        this.attachedImageSource = "assets/imgs/avatar_homme.svg";
      } else {
        this.displayMaidenName2 = false;
        this.attachedImageSource = "assets/imgs/avatar_enfant.svg";
      }
    }
  }
  changeCorrespondance(correspondance) {
    if (correspondance == "OTHER" || correspondance == "PARENT") {
      this.displayOtherCorrespondence = true;
    } else {
      this.displayOtherCorrespondence = false;
    }
  }
  attachedPatientSubmit() {
    this.patientSubmitted = true;
    if (this.addAttachedInfoForm.invalid) {
      return;
    }
    const model = {
      civility: this.addAttachedInfoForm.value.civility,
      birthday: this.addAttachedInfoForm.value.birthday,
      lastName: this.addAttachedInfoForm.value.lastName,
      firstName: this.addAttachedInfoForm.value.firstName,
      maidenName: this.addAttachedInfoForm.value.maidenName,
      phoneNumber: this.addAttachedInfoForm.value.phoneNumber,
      address: this.addAttachedInfoForm.value.address,
      zipCode: this.addAttachedInfoForm.value.zipCode,
      city: this.addAttachedInfoForm.value.city,
      additionalAddress: this.addAttachedInfoForm.value.additionalAddress,
      correspondence: this.addAttachedInfoForm.value.correspondence,
      otherCorrespondence: this.addAttachedInfoForm.value.otherCorrespondence,
    };
    this.submitAttachedAction.emit(model);
    this.isAddPatient = false;
  }
  cancelAddPatient() {
    this.isAddPatient = false;
    this.initAddAttachedInfoForm();
  }
  cancelUpdatePatient() {
    this.isList = true;
    this.initAttachedInfoForm();
  }
  attachedPatientupdate() {
    this.patientUpdated = true;
    if (this.attachedInfoForm.invalid) {
      return;
    }
    const model = {
      id: this.attachedInfoForm.value.id,
      civility: this.attachedInfoForm.value.civility,
      birthday: this.attachedInfoForm.value.birthday,
      lastName: this.attachedInfoForm.value.lastName,
      firstName: this.attachedInfoForm.value.firstName,
      maidenName: this.attachedInfoForm.value.maidenName,
      phoneNumber: this.attachedInfoForm.value.phoneNumber,
      address: this.attachedInfoForm.value.address,
      zipCode: this.attachedInfoForm.value.zipCode,
      city: this.attachedInfoForm.value.city,
      additionalAddress: this.attachedInfoForm.value.additionalAddress,
      correspondence: this.attachedInfoForm.value.correspondence,
      otherCorrespondence: this.attachedInfoForm.value.otherCorrespondence,
    };
    this.updateAttachedAction.emit(model);
    this.isList = true;
  }
  // destory any subscribe to avoid memory leak
  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
