import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { OrderDirection } from '@app/shared/enmus/order-direction';
import { LocalStorageService } from "ngx-webstorage";

@Injectable({
  providedIn: "root"
})
export class PaginationService {

  public direction: OrderDirection = OrderDirection.DESC;
  public maxPages: number = 1;
  public pageSize: number = 10;
  public pageNo = 0;
  public text: string;
  public hasNext: boolean;
  public hasPrevious: boolean;

  constructor(
    private globalService: GlobalService,
    private localSt: LocalStorageService
  ) {

  }

  init(max) {
    this.pageSize = 10;
    this.maxPages = Math.ceil(max / this.pageSize);
    this.pageNo = 0;
    this.loadPage();
  }

  setMaxPages(max: number) {
    this.maxPages = max;
  }

  setPageSize(size: number) {
    this.pageSize = size;
  }

  hasNextPage() {
    if (this.hasNext) {
      this.pageNo++;
      this.loadPage();
      return true;
    }
    return false;
  }

  hasPreviousPage() {
    if (this.hasPrevious) {
      this.pageNo--;
      this.loadPage();
      return true;
    }
    return false;
  }

  loadPage() {
    switch (this.maxPages) {
      case 0:
        this.text = `${this.maxPages} Page`;
        break;
      case 1:
        this.text = `${this.pageNo + 1}-${this.maxPages} Page`;
        break;
      default:
        this.text = `${this.pageNo + 1}-${this.maxPages} Pages`;
        break;
    }
    this.hasNext = this.maxPages > (this.pageNo + 1);
    this.hasPrevious = this.pageNo > 0;
  }

}
