import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyObjectsRoutingModule } from './my-objects-routing.module';
import { ObjectDetailComponent } from './object-detail/object-detail.component';
import { MyObjectsComponent } from './my-objects.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HlsGenericListModule } from 'hls-generic-list';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [ObjectDetailComponent, MyObjectsComponent],
  imports: [
    CommonModule,
    MyObjectsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HlsGenericListModule,
    SharedModule
  ]
})
export class MyObjectsModule { }
