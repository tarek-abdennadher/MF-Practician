import { SafeUrl } from "@angular/platform-browser";

export class MyPatients {
  users: any;
  isMarkAsSeen: boolean;
  isPatientFile: boolean;
  isSeen: boolean;
  isProhibited: boolean;
  isArchived: boolean;
  isViewDetail: boolean;
  photoId: string;
  fullInfo: any;
  id: number;
  isAddedByPatient : boolean
}

export class PatientSerch {
  fullName: string;
  img: string | SafeUrl;
  photoId: string;
  id: number;
}
export class CitySerch {
  name: string;
}
