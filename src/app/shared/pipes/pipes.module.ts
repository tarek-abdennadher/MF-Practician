import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CivilityPipe } from './civility.pipe';
import { JobtitlePipe } from './jobTitle.pipe';
import { EnumCorrespondencePipe } from './enumCorrespondencePipe';
import { CorrespondencePipe } from './correspondence.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [JobtitlePipe, CivilityPipe, EnumCorrespondencePipe, CorrespondencePipe],
  exports: [JobtitlePipe, CivilityPipe, EnumCorrespondencePipe, CorrespondencePipe]
})
export class PipesModule { }
