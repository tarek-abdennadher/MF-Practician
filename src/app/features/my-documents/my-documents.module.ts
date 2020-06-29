import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MyDocumentsComponent } from "./my-documents.component";
import { HlsLinksModule } from "hls-links";
import { MyDocumentsRoutingModule } from "./my-documents-routing.module";
import { HlsDocumentsModule } from "hls-documents";
import { HlsMessagingListModule } from "@app/core/lib-messaging-list/hls-messaging-list.module";
import { DocumentsListComponent } from "./documents-list/documents-list.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CivilityPipe } from '@app/shared/pipes/civility.pipe';
@NgModule({
  declarations: [MyDocumentsComponent, DocumentsListComponent],
  imports: [
    CommonModule,
    HlsLinksModule,
    MyDocumentsRoutingModule,
    HlsDocumentsModule,
    HlsMessagingListModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule
  ],
  providers:[
    CivilityPipe
  ]
})
export class MyDocumentsModule {}
