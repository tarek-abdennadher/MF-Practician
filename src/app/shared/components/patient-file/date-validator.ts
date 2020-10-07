import { AbstractControl } from "@angular/forms";
import { isBefore } from "date-fns";

export class DateValidator {
  static dateVaidator(AC: AbstractControl) {
    let maxDate = new Date();
    if (AC && AC.value && isBefore(maxDate, AC.value)) {
      return { dateVaidator: true };
    }
    return null;
  }
}
