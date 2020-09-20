import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
@Pipe({
  name: "civility"
})
export class CivilityPipe implements PipeTransform {
  transform(value: string, args?: any): string {
    return value === "M"
      ? "Monsieur"
      : value === "MME"
        ? "Madame"
        : value === "CHILD"
          ? "Enfant"
          : "";
  }
}
