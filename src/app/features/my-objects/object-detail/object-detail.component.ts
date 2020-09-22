import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AccountService } from "@app/features/services/account.service";
import { ContactsService } from "@app/features/services/contacts.service";
import { Router, ActivatedRoute } from "@angular/router";
import { FeaturesService } from "@app/features/features.service";
import { ComponentCanDeactivate } from "@app/features/component-can-deactivate";
declare var $: any;
@Component({
  selector: "app-object-detail",
  templateUrl: "./object-detail.component.html",
  styleUrls: ["./object-detail.component.scss"],
})
export class ObjectDetailComponent implements OnInit, ComponentCanDeactivate {
  public messages: any;
  itemsList = [];
  showAlert = false;
  failureAlert = false;
  public labels: any;
  public infoForm: FormGroup;
  submitted = false;
  selectedCategoryId: any;
  documentModelList = [];

  constructor(
    public accountService: AccountService,
    private contactsService: ContactsService,
    public router: Router,
    private route: ActivatedRoute,
    private featureService: FeaturesService
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
  }
  canDeactivate(): boolean {
    return !this.infoForm.dirty;
  }
  ngOnInit(): void {
    this.getAllDocumentModel();
    this.route.params.subscribe((params) => {
      this.selectedCategoryId = params["id"];
      this.initInfoForm();
    });
    this.featureService.setIsMessaging(false);
  }

  close() {
    this.showAlert = false;
  }

  initInfoForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      object: new FormControl(null, Validators.required),
      content: new FormControl(null, Validators.required),
      destination: new FormControl("PRACTICIAN"),
      allowDocument: new FormControl(false),
      docBody: new FormControl(null),
      documentModelId: new FormControl(null),
      accountId: new FormControl(null),
      originalCloneId: new FormControl(null),
    });
    if (this.selectedCategoryId != "add") {
      this.accountService
        .getPracticianObjectById(this.selectedCategoryId)
        .subscribe((object) => {
          this.infoForm.patchValue({
            id: object.id,
            object: object.object,
            content: object.content,
            destination: object.destination,
            allowDocument: object.allowDocument,
            docBody: object?.docBody,
            documentModelId: object?.documentModel?.id,
            accountId: object?.accountId,
            originalCloneId: object?.originalCloneId,
          });
        });
    }
  }
  get ctr() {
    return this.infoForm.controls;
  }

  getAllDocumentModel() {
    this.accountService.getAllDocumentModel().subscribe((res) => {
      this.documentModelList = res;
    });
  }

  setRequiredValidatorDocument() {
    if (this.ctr.allowDocument.value == true) {
      this.ctr.docBody.setValidators(Validators.required);
      this.ctr.docBody.updateValueAndValidity();
      this.ctr.documentModelId.setValidators(Validators.required);
      this.ctr.documentModelId.updateValueAndValidity();
    } else {
      this.ctr.docBody.clearValidators();
      this.ctr.documentModelId.clearValidators();
      this.ctr.docBody.updateValueAndValidity();
      this.ctr.documentModelId.updateValueAndValidity();
    }
  }

  submit() {
    this.submitted = true;

    if (this.infoForm.invalid) {
      return;
    }
    this.infoForm.markAsPristine();
    let model = this.infoForm.value;
    model.accountId = this.featureService.getUserId();
    if (this.selectedCategoryId == "add") {
      this.accountService.createPracticianObject(model).subscribe((res) => {
        this.showAlert = true;
        $(".alert").alert();
        this.submitted = false;
        this.router.navigate(["mes-objets"], { queryParams: { loading: true }});
      });
    } else {
      this.accountService.updatePracticianObject(model).subscribe((res) => {
        this.showAlert = true;
        $(".alert").alert();
        this.submitted = false;
        this.router.navigate(["mes-objets"],  {queryParams: { loading: true }});
      });
    }
  }
  cancel() {
    this.router.navigate(["mes-objets"] ,{ queryParams: { loading: false }});
  }
}
