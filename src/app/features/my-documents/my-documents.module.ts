import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MyDocumentsComponent } from "./my-documents.component";
import { HlsLinksModule } from "hls-links";
import { MyDocumentsRoutingModule } from "./my-documents-routing.module";
import { HlsDocumentsModule } from "hls-documents";
import { HlsMessagingListModule } from "hls-messaging-list";
import { DocumentsListComponent } from "./documents-list/documents-list.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MyDocumentsComponent, DocumentsListComponent],
  imports: [
    CommonModule,
    HlsLinksModule,
    MyDocumentsRoutingModule,
    HlsDocumentsModule,
    HlsMessagingListModule,
    FormsModule,
    ReactiveFormsModule
  ],
})
export class MyDocumentsModule {}
