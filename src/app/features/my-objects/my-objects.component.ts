import { Component, OnDestroy, OnInit } from "@angular/core";
import { AccountService } from "../services/account.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { CategoryService } from "../services/category.service";
import { FeaturesService } from "../features.service";
import { GlobalService } from "@app/core/services/global.service";
import { filter, takeUntil } from "rxjs/operators";
import { DialogService } from "../services/dialog.service";
import { Subject } from "rxjs";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-my-objects",
  templateUrl: "./my-objects.component.html",
  styleUrls: ["./my-objects.component.scss"]
})
export class MyObjectsComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  public messages: any;
  itemsList = [];
  imageSource: string;
  selectedObject: any;
  searchList = [];
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
    private featureService: FeaturesService,
    private globalService: GlobalService,
    public dialogService: DialogService,
    private title: Title
  ) {
    this.title.setTitle(this.accountService.messages.my_object);
    this.messages = this.accountService.messages;
    this.avatars = globalService.avatars;
    this.imageSource = this.avatars.user;
    this.selectedObject = this.messages.select_object;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit(): void {
    this.getMyObject();
    this.getSearchList();
    // update categories after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/mes-objets?loading=true") {
          let currentRoute = this.route;
          while (currentRoute.firstChild)
            currentRoute = currentRoute.firstChild;
          this.getMyObject();
        }
      });
    setTimeout(() => {
      this.featureService.setIsMessaging(false);
    });
  }

  getSearchList() {
    this.accountService
      .getObjectSearchList()
      .pipe(takeUntil(this._destroyed$))
      .subscribe(list => {
        this.searchList = list;
      });
  }

  cardClicked(object) {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#addObject").offset().top - 100
      },
      1000
    );
    this.router.navigate(["mes-objets/" + `${object.id}`]);
  }

  deleteCategory(object) {
    this.dialogService
      .openConfirmDialog(
        "Etes vous sur de bien vouloir supprimer cet objet",
        "Confirmation de supression"
      )
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.accountService
            .deletePracticianObject(object.id)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(result => {
              this.itemsList = this.itemsList.filter(
                cat => cat.id != object.id
              );
              this.getSearchList();
            });
        }
      });
  }

  addAction() {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#addObject").offset().top - 100
      },
      1000
    );
    this.router.navigate(["mes-objets/add"]);
  }

  onChange(item) {
    const id = item.target.value;
    this.accountService
      .clonePracticianObject(id)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(requestClone => {
        this.itemsList.push(this.parseObject(requestClone));
        this.searchList = this.searchList.filter(elm => elm.id != id);
      });
  }

  getMyObject() {
    this.itemsList = [];
    this.accountService
      .getPracticianObjectList()
      .pipe(takeUntil(this._destroyed$))
      .subscribe(categories => {
        categories.forEach(res => {
          this.itemsList.push({
            id: res.id,
            isSeen: true,
            users: [
              {
                id: res.id,
                fullName:
                  res.object[0].toUpperCase() +
                  res.object.substr(1).toLowerCase()
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

  parseObject(res) {
    let parsed = {
      id: res.id,
      isSeen: true,
      users: [
        {
          id: res.id,
          fullName: res.object
        }
      ],
      isArchieve: true,
      isImportant: false,
      hasFiles: false,
      isViewDetail: false,
      isMarkAsSeen: false,
      isChecked: false
    };
    return parsed;
  }
}
