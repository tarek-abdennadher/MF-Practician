import { Injectable } from "@angular/core";
import { GlobalService } from "../services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import {
  FormControl,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class EmailUniqueValidatorService {
  constructor(private globalService: GlobalService) {}

  checkEmailExist(email) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.account + "/" + email + "/isUnique"
    );
  }

  checkEmailExistExceptCurrent(email, current) {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.account +
        "/" +
        email +
        "/isUniqueExcept/" +
        current
    );
  }

  emailExist(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return control.value
        ? this.checkEmailExist(control.value).pipe(
            map((res) => {
              // if res is false, email exists, return true
              return !res ? { emailExist: true } : null;
            })
          )
        : null;
    };
  }

  emailExistExceptCurrent(current): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.checkEmailExistExceptCurrent(control.value, current).pipe(
        map((res) => {
          // if res is false, email exists, return true
          return !res ? { emailExist: true } : null;
        })
      );
    };
  }
}
