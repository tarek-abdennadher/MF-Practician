import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
@Pipe({
  name: "role_object"
})
export class RoleObjectPipe implements PipeTransform {
  transform(value: string, args?: any): string {
    let res: string;
    switch (value) {
      case "SUPERVISOR":
      case "SUPER_SUPERVISOR":
      case "SECRETARY":
      case "OPERATOR":
        res = "telesecretary"
        break;
      case "TELESECRETARYGROUP":
        res = "telesecretaryGroup"
        break;
        case "MEDICAL":
        res = "practician"
        break;
      case "SYSTEM":
      res = "systemUser"
      break;
      case "PATIENT_FILE":
      res = "patientFile"
      break;
      default:
        res = value && value.toLowerCase() || "";
        break;
    }
    return res;
  }
}
