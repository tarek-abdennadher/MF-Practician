import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({ name: "EnumCorrespondence" })
@Injectable({
  providedIn: "root",
})
export class EnumCorrespondencePipe implements PipeTransform {
  transform(value): Object {
    return value === "WIFE_HUSBAND"
      ? "Conjoint(e)"
      : value === "CHILD"
      ? "Enfant"
      : value === "PARENT"
      ? "Parent"
      : value === "UNDER_GUARDIANSHIP"
      ? "Sous tutelle"
      : value === "UNDER_CURATORSHIP"
      ? "Sous curatelle"
      : value === "OTHER"
      ? "Autre"
      : "";
  }
}
