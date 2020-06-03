import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CategoryService } from "@app/features/services/category.service";
import { GlobalService } from '@app/core/services/global.service';

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"],
})
export class CategoryComponent implements OnInit {
  public messages: any;
  itemsList = [];
  imageSource : string;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };

  constructor(
    public accountService: AccountService,
    public router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private globalService: GlobalService
  ) {
    this.messages = this.accountService.messages;
    this.avatars = globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.getMyCategories();
  }

  cardClicked(category) {
    this.router.navigate([`${category.id}`], { relativeTo: this.route });
  }

  deleteCategory(category) {
    this.categoryService.deleteCategory(category.id).subscribe((result) => {
      if (result) {
        this.itemsList = this.itemsList.filter((cat) => cat.id != category.id);
      }
    });
  }

  addAction() {
    this.router.navigate([`add`], { relativeTo: this.route });
  }

  getMyCategories() {
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
