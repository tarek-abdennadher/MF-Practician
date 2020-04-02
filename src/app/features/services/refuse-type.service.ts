import { Injectable } from "@angular/core";
import { RequestType } from "@app/shared/enmus/requestType";
import { GlobalService } from "@app/core/services/global.service";

@Injectable({
  providedIn: "root"
})
export class RefuseTypeService {
  constructor(private globalService: GlobalService) {}

  ngOnInit() {}

  getAllRefuseTypes() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.RefuseTypes
    );
  }
}
