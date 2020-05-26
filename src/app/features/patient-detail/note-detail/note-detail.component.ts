import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ContactsService } from "@app/features/services/contacts.service";
import { NoteService } from "@app/features/services/note.service";
import { Location } from "@angular/common";
import { GlobalService } from '@app/core/services/global.service';

declare var $: any;
@Component({
  selector: "app-note-detail",
  templateUrl: "./note-detail.component.html",
  styleUrls: ["./note-detail.component.scss"],
})
export class NoteDetailComponent implements OnInit {
  public messages: any;
  itemsList = [];
  showAlert = false;
  failureAlert = false;
  public labels: any;
  public infoForm: FormGroup;
  submitted = false;
  selectedNoteId: any;
  patientId: any;
  practicianId: any;

  page = this.globalService.messagesDisplayScreen.notes;
  topText = this.globalService.messagesDisplayScreen.notes;

  backButton = true;
  placement = "right";

  constructor(
    public accountService: AccountService,
    private contactsService: ContactsService,
    public router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    private _location: Location,
    private globalService:GlobalService
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.selectedNoteId = params["idNote"];
      this.patientId = params["idAccount"];
      this.practicianId = params["idPractician"];
      this.initInfoForm();
    });
  }

  close() {
    this.showAlert = false;
  }

  initInfoForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      value: new FormControl(null, Validators.required),
      date: new FormControl(null, Validators.required)
    });
    if (this.selectedNoteId != "add") {
      this.noteService
        .getnoteById(this.selectedNoteId)
        .subscribe((note) => {
          this.infoForm.patchValue({
            id: note.id,
            value: note.value,
            date: new Date(note.noteDate)
          });
        });
    }
  }
  get ctr() {
    return this.infoForm.controls;
  }

  submit() {
    this.submitted = true;

    if (this.infoForm.invalid) {
      return;
    }
    let model;
    model = {
      id: this.infoForm.value.id,
      value: this.infoForm.value.value,
      noteDate: this.infoForm.value.date
    };
    if (this.selectedNoteId == "add") {
      if(this.practicianId){
        this.noteService.addNoteforPractician(model, this.patientId,this.practicianId).subscribe((res) => {
          this.showAlert = true;
          $(".alert").alert();
          this.submitted = false;
          this.BackButton();
        });
      }else{
        this.noteService.addNote(model, this.patientId).subscribe((res) => {
          this.showAlert = true;
          $(".alert").alert();
          this.submitted = false;
          this.BackButton();
        });
      }

    } else {
      this.noteService.updateNote(model).subscribe((res) => {
        this.showAlert = true;
        $(".alert").alert();
        this.submitted = false;
        this.BackButton();
      });
    }
  }
  BackButton() {
    this._location.back();
  }
}
