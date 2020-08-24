import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { FeaturesService } from '../features.service';
import { GlobalService } from '@app/core/services/global.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-my-objects',
  templateUrl: './my-objects.component.html',
  styleUrls: ['./my-objects.component.scss']
})
export class MyObjectsComponent implements OnInit {
  public messages: any;
  itemsList = [];
  imageSource: string;
  selectedObject: any;
  searchList = [];
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };

  constructor(
    public accountService: AccountService,
    public router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private featureService: FeaturesService,
    private globalService: GlobalService
  ) {
    this.messages = this.accountService.messages;
    this.avatars = globalService.avatars;
    this.imageSource = this.avatars.user;
    this.selectedObject = this.messages.select_object;
  }

  ngOnInit(): void {
    this.getMyObject();
    this.getSearchList();
    // update categories after detail view
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      let currentRoute = this.route;
      while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;
      this.getMyObject();
    });
    this.featureService.setIsMessaging(false);
  }

  getSearchList() {
    this.accountService
      .getObjectSearchList()
      .subscribe((list) => {
        this.searchList = list;
      });
  }

  cardClicked(object) {
    this.router.navigate(["mes-objets/" + `${object.id}`]);
  }

  deleteCategory(object) {
    this.accountService.deletePracticianObject(object.id).subscribe((result) => {
      this.itemsList = this.itemsList.filter((cat) => cat.id != object.id);
      this.getSearchList();
    });
  }

  addAction() {
    this.router.navigate(["mes-objets/add"]);
  }

  onChange(item) {
    const id = item.target.value;
    this.accountService
      .clonePracticianObject(id)
      .subscribe((requestClone) => {
        this.itemsList.push(this.parseObject(requestClone))
        this.searchList = this.searchList.filter((elm) => elm.id != id);
      });
  }

  getMyObject() {
    this.itemsList = [];
    this.accountService.getPracticianObjectList().subscribe((categories) => {
      categories.forEach((res) => {
        this.itemsList.push({
          id: res.id,
          isSeen: true,
          users: [
            {
              id: res.id,
              fullName: res.object,
            },
          ],
          isArchieve: true,
          isImportant: false,
          hasFiles: false,
          isViewDetail: false,
          isMarkAsSeen: false,
          isChecked: false,
        });
      });
    });
  }

  parseObject(res) {
    let parsed = {
      id: res.id,
      isSeen: true,
      users: [
        {
          id: res.id,
          fullName: res.object,
        },
      ],
      isArchieve: true,
      isImportant: false,
      hasFiles: false,
      isViewDetail: false,
      isMarkAsSeen: false,
      isChecked: false,
    }
    return parsed;
  }
}
