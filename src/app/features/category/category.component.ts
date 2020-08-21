import { Component, OnInit, AfterViewChecked, AfterContentChecked } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { CategoryService } from "@app/features/services/category.service";
import { GlobalService } from '@app/core/services/global.service';
import { FeaturesService } from '@app/features/features.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"],
})
export class CategoryComponent implements OnInit {
  public messages: any;
  itemsList = [];
  imageSource: string;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };
  private componentBeforeNavigation = null;

  constructor(
    public accountService: AccountService,
    public router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private globalService: GlobalService,
    private featureService: FeaturesService
  ) {
    this.messages = this.accountService.messages;
    this.avatars = globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.getMyCategories();
    // update categories after detail view
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      let currentRoute = this.route;
      while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;
      this.getMyCategories();
    });
    this.featureService.setIsMessaging(false);
  }

  cardClicked(category) {
    this.router.navigate(["mes-categories/" + `${category.id}`]);
  }

  deleteCategory(category) {
    this.categoryService.deleteCategory(category.id).subscribe((result) => {
      if (result) {
        this.itemsList = this.itemsList.filter((cat) => cat.id != category.id);
      }
    });
  }

  addAction() {
    this.router.navigate(["mes-categories/add"]);
  }

  getMyCategories() {
    this.itemsList = [];
    this.categoryService.getMyCategories().subscribe((categories) => {
      categories.forEach((category) => {
        this.itemsList.push({
          id: category.id,
          isSeen: true,
          users: [
            {
              id: category.id,
              fullName: category.name,
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
}
