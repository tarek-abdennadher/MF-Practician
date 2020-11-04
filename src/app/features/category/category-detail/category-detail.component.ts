import { Component, OnInit, Input, Output, OnDestroy } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ContactsService } from "@app/features/services/contacts.service";
import { CategoryService } from "@app/features/services/category.service";
import { FeaturesService } from "@app/features/features.service";
import { ComponentCanDeactivate } from "@app/features/component-can-deactivate";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
declare var $: any;
@Component({
  selector: "app-category-detail",
  templateUrl: "./category-detail.component.html",
  styleUrls: ["./category-detail.component.scss"]
})
export class CategoryDetailComponent
  implements OnInit, ComponentCanDeactivate, OnDestroy {
  private _destroyed$ = new Subject();
  public messages: any;
  showAlert = false;
  failureAlert = false;
  public labels: any;
  public infoForm: FormGroup;
  submitted = false;
  selectedCategoryId: any;

  constructor(
    public accountService: AccountService,
    private contactsService: ContactsService,
    public router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private featureService: FeaturesService
  ) {
    this.messages = this.accountService.messages;
    this.labels = this.contactsService.messages;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  canDeactivate(): boolean {
    return !this.infoForm.dirty;
  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.selectedCategoryId = this.featureService.decrypt(params["id"]);
      this.initInfoForm();
    });
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }

  close() {
    this.showAlert = false;
  }

  initInfoForm() {
    this.infoForm = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null, Validators.required)
    });
    if (this.selectedCategoryId != "add") {
      this.categoryService
        .getCategoryById(this.selectedCategoryId)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(category => {
          this.infoForm.patchValue({
            id: category.id,
            name: category.name
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
    this.infoForm.markAsPristine();
    let model;
    model = {
      id: this.infoForm.value.id,
      name: this.infoForm.value.name
    };
    if (this.selectedCategoryId == "add") {
      this.categoryService
        .addCategory(model)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(res => {
          this.showAlert = true;
          $(".alert").alert();
          this.submitted = false;
          this.router.navigate(["mes-categories"], {
            queryParams: { loading: true }
          });
        });
    } else {
      this.categoryService
        .updateCategory(model)
        .pipe(takeUntil(this._destroyed$))
        .subscribe(res => {
          this.showAlert = true;
          $(".alert").alert();
          this.submitted = false;
          this.router.navigate(["mes-categories"], {
            queryParams: { loading: true }
          });
        });
    }
  }
  cancel() {
    this.router.navigate(["mes-categories"], {
      queryParams: { loading: false }
    });
  }
}
