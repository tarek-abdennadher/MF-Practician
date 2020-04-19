import { FormControl } from "@angular/forms";

export function emailValidator(control: FormControl): { [key: string]: any } {
  var emailRegexp = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
  if (control.value && !emailRegexp.test(control.value)) {
    return { email: true };
  }
}
