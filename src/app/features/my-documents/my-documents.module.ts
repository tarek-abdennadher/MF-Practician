import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MyDocumentsComponent } from "./my-documents.component";
import { HlsLinksModule } from "hls-links";
import { MyDocumentsRoutingModule } from "./my-documents-routing.module";
import {HlsDocumentsModule} from 'hls-documents';

@NgModule({
  declarations: [MyDocumentsComponent],
  imports: [CommonModule, HlsLinksModule, MyDocumentsRoutingModule,HlsDocumentsModule]
})
export class MyDocumentsModule {}
