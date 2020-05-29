import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { CivilityPipe } from './civility.pipe';
import { JobtitlePipe } from './jobTitle.pipe';
import { EnumCorrespondencePipe } from './enumCorrespondencePipe';

@NgModule({
  imports: [CommonModule],
  declarations: [JobtitlePipe, CivilityPipe, EnumCorrespondencePipe],
  exports: [JobtitlePipe, CivilityPipe, EnumCorrespondencePipe]
})
export class PipesModule { }
