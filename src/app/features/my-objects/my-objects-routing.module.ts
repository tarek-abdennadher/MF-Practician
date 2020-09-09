import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MyObjectsComponent } from "./my-objects.component";
import { ObjectDetailComponent } from "./object-detail/object-detail.component";
import { DirtyCheckGuard } from "../dirty-check.guard";

const routes: Routes = [
  {
    path: "",
    component: MyObjectsComponent,
    children: [
      {
        path: ":id",
        component: ObjectDetailComponent,
        canDeactivate: [DirtyCheckGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyObjectsRoutingModule {}
