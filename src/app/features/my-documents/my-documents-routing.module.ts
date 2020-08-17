import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MyDocumentsComponent } from "./my-documents.component";
import { DocumentsListComponent } from "./documents-list/documents-list.component";

const routes: Routes = [
  {
    path: "",
    component: MyDocumentsComponent,
    children: [
      {
        path: "list/:id",
        component: DocumentsListComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyDocumentsRoutingModule {}
