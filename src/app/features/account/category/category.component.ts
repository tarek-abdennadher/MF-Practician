import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/features/services/account.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CategoryService } from "@app/features/services/category.service";

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"],
})
export class CategoryComponent implements OnInit {
  public messages: any;
  itemsList = [];
  imageSource = "assets/imgs/user.png";

  constructor(
    public accountService: AccountService,
    public router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) {
    this.messages = this.accountService.messages;
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
