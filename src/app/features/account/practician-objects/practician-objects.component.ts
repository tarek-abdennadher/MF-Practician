import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CategoryService } from "@app/features/services/category.service";
import { GlobalService } from '@app/core/services/global.service';
import {FeaturesService} from '@app/features/features.service';

@Component({
  selector: "app-practician-objects",
  templateUrl: "./practician-objects.component.html",
  styleUrls: ["./practician-objects.component.scss"],
})
export class PracticianObjectsComponent implements OnInit {
  public messages: any;
  itemsList = [];
  imageSource : string;
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
    this.router.navigate([`${object.id}`], { relativeTo: this.route });
  }

  deleteCategory(object) {
    this.accountService.deletePracticianObject(object.id).subscribe((result) => {
      this.itemsList = this.itemsList.filter((cat) => cat.id != object.id);
      this.getSearchList();
    });
  }

  addAction() {
    this.router.navigate([`add`], { relativeTo: this.route });
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
