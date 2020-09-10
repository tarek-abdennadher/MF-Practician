import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CategoryComponent } from "./category.component";
import { CategoryDetailComponent } from "./category-detail/category-detail.component";
import { DirtyCheckGuard } from "../dirty-check.guard";

const routes: Routes = [
  {
    path: "",
    component: CategoryComponent,
    children: [
      {
        path: ":id",
        component: CategoryDetailComponent,
        canDeactivate: [DirtyCheckGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryRoutingModule {}
