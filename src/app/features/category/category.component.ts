import { Component, OnDestroy, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { CategoryService } from "@app/features/services/category.service";
import { GlobalService } from "@app/core/services/global.service";
import { FeaturesService } from "@app/features/features.service";
import { filter, takeUntil } from "rxjs/operators";
import { DialogService } from "../services/dialog.service";
import { Subject } from "rxjs";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"]
})
export class CategoryComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  public messages: any;
  itemsList = [];
  imageSource: string;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };

  constructor(
    public accountService: AccountService,
    public router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private globalService: GlobalService,
    private featureService: FeaturesService,
    public dialogService: DialogService,
    private title: Title
  ) {
    this.title.setTitle(this.accountService.messages.categories);
    this.messages = this.accountService.messages;
    this.avatars = globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit(): void {
    this.featureService.setActiveChild(null);
    this.getMyCategories();
    // update categories after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/mes-categories?loading=true") {
          let currentRoute = this.route;
          while (currentRoute.firstChild)
            currentRoute = currentRoute.firstChild;
          this.getMyCategories();
        }
      });
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }

  cardClicked(category) {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#categoty").offset().top - 100
      },
      1000
    );
    this.router.navigate([
      "mes-categories/" + this.featureService.encrypt(`${category.id}`)
    ]);
  }

  deleteCategory(category) {
    this.dialogService
      .openConfirmDialog(
        "Etes vous sur de bien vouloir supprimer cette cat??gorie",
        "Confirmation de supression"
      )
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.categoryService
            .deleteCategory(category.id)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(result => {
              if (result) {
                this.itemsList = this.itemsList.filter(
                  cat => cat.id != category.id
                );
              }
            });
        }
      });
  }

  addAction() {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#categoty").offset().top - 100
      },
      1000
    );
    this.router.navigate(["mes-categories/add"]);
  }

  getMyCategories() {
    this.itemsList = [];
    this.categoryService
      .getMyCategories()
      .pipe(takeUntil(this._destroyed$))
      .subscribe(categories => {
        categories.forEach(category => {
          this.itemsList.push({
            id: category.id,
            isSeen: true,
            users: [
              {
                id: category.id,
                fullName:
                  category.name[0].toUpperCase() +
                  category.name.substr(1).toLowerCase()
              }
            ],
            isArchieve: true,
            isImportant: false,
            hasFiles: false,
            isViewDetail: false,
            isMarkAsSeen: false,
            isChecked: false
          });
        });
        this.itemsList.sort((a, b) =>
          a.users[0].fullName > b.users[0].fullName ? 1 : -1
        );
      });
  }
}
