import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { emailValidator } from '@app/core/Validators/email.validator';
import { isBefore } from 'ngx-bootstrap/chronos';
import { PatientFileService } from './patient-file.service';
import { CorrespondencePipe } from '@app/shared/pipes/correspondence.pipe';
import { CivilityPipe } from '@app/shared/pipes/civility.pipe';
import { Router } from '@angular/router';
import { MyDocumentsService } from '@app/features/my-documents/my-documents.service';
import { MessagingListService } from '@app/features/services/messaging-list.service';
import { OrderDirection } from '@app/shared/enmus/order-direction';
import { GlobalService } from '@app/core/services/global.service';

function requiredValidator(c: AbstractControl): { [key: string]: any } {
  const email = c.get("email");
  const phoneNumber = c.get("phoneNumber");
  if (!email.value && !phoneNumber.value) {
    return { requiredValidator: true };
  }
  return null;
}
@Component({
  selector: 'app-patient-file',
  templateUrl: './patient-file.component.html',
  styleUrls: ['./patient-file.component.scss']
})
export class PatientFileComponent implements OnInit {
  labels;
  placement = "bottom";
  errors;
  displayMaidenName: boolean = false;
  displayOtherCorrespondence: boolean = false;
  isList: boolean = true;
  isnoteList: boolean = true;
  public personalInfoForm: FormGroup;
  public attachedInfoForm: FormGroup;
  public noteForm: FormGroup;
  public maxDate = new Date();
  submitted = false;
  noteSubmitted = false;
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
  /** Inputs */
  @Input("imageSource") imageSource: string;
  @Input("practicianImage") practicianImage: string;
  @Input("noteimageSource") noteimageSource: string;
  @Input("userRole") userRole: string;
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
  @Output("archieveNoteAction") archieveNoteAction = new EventEmitter();
  @Output("cancelAction") cancelAction = new EventEmitter();
  categories = [];
  attachedPatients = [];
  isLabelShow: boolean = false;
  phones = [];
  notes: Array<any> = new Array();
  noteList: Array<any> = new Array();
  addnewPhone = new Subject<boolean>();
  otherPhones = new Subject<any[]>();
  isFutureDate: boolean;
  public isPhonesValid = false;
  public info: any;
  displayInvite: boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private patientFileService: PatientFileService,
    private correspondencePipe: CorrespondencePipe,
    private civilityPipe: CivilityPipe,
    private documentService: MyDocumentsService,
    private messagesServ: MessagingListService,
    private router: Router,
    private globalService: GlobalService
  ) {
    this.isList = true;
    this.isnoteList = true;
    this.isLabelShow = false;
    this.labels = this.patientFileService.labels;
    this.errors = this.patientFileService.errors;
    this.maxDate.setDate(new Date().getDate() - 1);
    this.avatars = this.globalService.avatars;
  }
  get ctr() {
    return this.personalInfoForm.controls;
  }
  get f() {
    return this.noteForm.controls;
  }
  get phoneList() {
    return <FormArray>this.personalInfoForm.get("otherPhones");
  }
  ngOnInit(): void {
    this.maxDate.setDate(new Date().getDate() - 1);
    this.initPersonalForm();
    this.initNoteForm();
    this.categoryList.subscribe((res) => {
      if (res) {
        this.categories = res;
      }
    });
    this.patient.subscribe((val) => {
      if (val) {
        this.info = val;
        this.getPersonalInformation(val);
      }
    });
    this.linkedPatients.subscribe((res) => {
      if (res) {
        this.attachedPatients = res;
      }
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
      invitationStatus: new FormControl(null)
    });
    this.personalInfoForm.setValidators(requiredValidator);
  }

  initAttachedInfoForm() {
    this.attachedInfoForm = new FormGroup({
      id: new FormControl(null),
      civility: new FormControl(null),
      correspondence: new FormControl(null),
      otherCorrespondence: new FormControl(null),
      birthday: new FormControl(null),
      lastName: new FormControl(null),
      firstName: new FormControl(null),
      maidenName: new FormControl(null),
      phoneNumber: new FormControl(null),
      address: new FormControl(null),
      zipCode: new FormControl(null),
      city: new FormControl(null),
      additionalAddress: new FormControl(null),
      photoId: new FormControl(null),
    });
    this.attachedInfoForm.disable();
  }
  initNoteForm() {
    this.noteForm = this.formBuilder.group({
      id: new FormControl(null),
      value: new FormControl(null, Validators.required),
      date: new FormControl(null, Validators.required),
    });
  }

  getPersonalInformation(patient) {
    this.patientFileId = patient.id;
    if (patient.patientId) {
      this.getPatientInbox(this.pageNo);
    }
    if (patient.invitationStatus && patient.invitationStatus == "SENT") {
      this.displayInvite = false;
    }
    if (patient.phones && patient?.phones.length != 0) {
      this.isLabelShow = true;
      this.otherPhones.next(patient.phones);
    }
    if (patient.notes) {
      this.noteList = [];
      this.notes = patient.notes;
      this.notes.forEach((note) => {
        this.noteList.push({
          id: note.id,
          users: [
            {
              fullName:
                note.value.length < 60
                  ? note.value
                  : note.value.substring(0, 60) + "...",
            },
          ],
          time: note.noteDate,
          isViewDetail: false,
          isArchieve: true,
          isSeen: true,
        });
      });
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
      invitationStatus: patient.invitationStatus ? patient.invitationStatus : null
    });
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
        civility: patient.fullInfo.civility
          ? this.civilityPipe.transform(patient.fullInfo.civility)
          : null,
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
          ? this.correspondencePipe.transform(patient.fullInfo.correspondence)
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
      notes: this.notes,
      invitationStatus: this.personalInfoForm.value.invitationStatus
    };
    if (this.personalInfoForm.value.invitationStatus == "NOT_SENT") {
      this.displayInvite = false;
    }
    this.submitAction.emit(model);
  }
  addNote() {
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
    if (this.noteForm.value.id == null) {
      this.noteList.push({
        id: this.noteForm.value.id,
        users: [
          {
            fullName:
              this.noteForm.value.value.length < 60
                ? this.noteForm.value.value
                : this.noteForm.value.value.substring(0, 60) + "...",
          },
        ],
        time: this.noteForm.value.date,
        isViewDetail: false,
        isArchieve: true,
        isSeen: true,
      });
      this.notes.push(model);
    } else {
      let noteToUpdate = this.noteList.find((n) =>
        n.id
          ? n.id == this.noteForm.value.id
          : n.time == this.noteForm.value.date
      );
      let index = this.noteList.indexOf(noteToUpdate);
      if (index !== -1) {
        this.noteList[index] = {
          id: this.noteForm.value.id,
          users: [
            {
              fullName:
                this.noteForm.value.value.length < 60
                  ? this.noteForm.value.value
                  : this.noteForm.value.value.substring(0, 60) + "...",
            },
          ],
          time: this.noteForm.value.date,
          isViewDetail: false,
          isArchieve: true,
          isSeen: true,
        };
      }
      noteToUpdate = this.notes.find((n) =>
        n.id
          ? n.id == this.noteForm.value.id
          : n.noteDate == this.noteForm.value.date
      );
      index = this.notes.indexOf(noteToUpdate);
      if (index !== -1) {
        this.notes[index] = model;
      }
    }
    this.submitNoteAction.emit(model);
    this.isnoteList = true;
  }
  noteCardClicked(item) {
    this.isnoteList = false;
    const noteToUpdate = this.notes.find((n) =>
      n.id && n.id != null ? n.id == item.id : n.noteDate == item.noteDate
    );
    this.noteForm.patchValue({
      id: noteToUpdate.id ? noteToUpdate.id : null,
      value: noteToUpdate.value ? noteToUpdate.value : null,
      date: noteToUpdate.noteDate ? new Date(noteToUpdate.noteDate) : null,
    });
  }
  archieveNote(item) {
    this.archieveNoteAction.emit(item.id);
    this.notes = this.notes.filter((n) =>
      n.id && n.id != null ? n.id != item.id : n.noteDate != item.noteDate
    );
    this.noteList = this.noteList.filter((n) =>
      n.id && n.id != null ? n.id != item.id : n.time != item.time
    );
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
        invitationStatus: "NOT_SENT"
      });
    }
  }

  getPatientInbox(pageNo) {
    this.messagesServ.getMessagesByPatientFile(this.patientFileId, pageNo, this.direction).subscribe(res => {
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
    this.messagesServ.getMessagesByPatientFile(this.patientFileId, pageNo, this.direction).subscribe(res => {
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
          img: this.avatars.user,
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
    };
    if (parsedMessage.photoId) {
      this.documentService.downloadFile(parsedMessage.photoId).subscribe(
        (response) => {
          let myReader: FileReader = new FileReader();
          myReader.onloadend = (e) => {
            parsedMessage.users[0].img = myReader.result.toString();
          };
          let ok = myReader.readAsDataURL(response.body);
        },
        (error) => {
          parsedMessage.users[0].img = this.avatars.user;
        }
      );
    } else {
      parsedMessage.users.forEach((user) => {
        if (user.type == "MEDICAL") {
          user.img = this.avatars.doctor;
        } else if (user.type == "SECRETARY") {
          user.img = this.avatars.secretary;
        } else if (user.type == "TELESECRETARYGROUP") {
          user.img = this.avatars.tls;
        } else if (user.type == "PATIENT") {
          if (user.civility == "M") {
            user.img = this.avatars.man;
          } else if (user.civility == "MME") {
            user.img = this.avatars.women;
          } else if (user.civility == "CHILD") {
            user.img = this.avatars.child;
          }
        }
      });
    }
    return parsedMessage;
  }


  onScroll() {
    if (this.filtredItemList.length > 9) {
      this.pageNo++;
      this.getPatientNextInbox(this.pageNo);
    }
  }

  messageClicked(item) {
    this.router.navigate(["/messagerie-lire/" + item.id], {
      queryParams: {
        context: "inbox",
      },
    });
  }
}
