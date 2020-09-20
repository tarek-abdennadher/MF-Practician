import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
@Pipe({
  name: "correspondence"
})
export class CorrespondencePipe implements PipeTransform {
  transform(value: string, args?: any): string {
    if (value == "WIFE_HUSBAND") {
      return "Conjoint(e)";
    } else if (value == "CHILD") {
      return "Enfant";
    } else if (value == "PARENT") {
      return "Parent";
    } else if (value == "UNDER_GUARDIANSHIP") {
      return "Sous tutelle";
    } else if (value == "UNDER_CURATORSHIP") {
      return "Sous curatelle";
    } else if (value == "OTHER") {
      return "Autre";
    }
  }
}
