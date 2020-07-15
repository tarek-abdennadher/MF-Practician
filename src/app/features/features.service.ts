import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, BehaviorSubject } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import * as jwt_decode from "jwt-decode";
import { search } from "./practician-search/search.model";

@Injectable({
  providedIn: "root",
})
export class FeaturesService {
  public listNotifications = [];
  public selectedPracticianId = 0;
  private _numberOfInbox = new BehaviorSubject<number>(0);
  numberOfArchieve: number = 0;
  numberOfAccepted: number = 0;
  private _numberOfPending = new BehaviorSubject<number>(0);
  numberOfProhibited: number = 0;
  numberOfArchivedPatient: number = 0;
  myPracticians: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public imageSource: string | ArrayBuffer;
  private searchSource = new BehaviorSubject(new search());
  currentSearch = this.searchSource.asObservable();
  initialSearch = false;
  public fullName: string;
  avatars: { doctor: string; child: string; women: string; man: string; secretary: string; user: string; };

  public searchInboxFiltered = new BehaviorSubject([]);
  public searchInbox = new BehaviorSubject([]);
  public searchPracticianInboxFiltered = new Map();
  public searchPracticianInbox = new Map();
  public searchFiltredPractician = new BehaviorSubject([]);
  public searchFilteredSent = new BehaviorSubject([]);
  public searchSent = new BehaviorSubject([]);
  public searchFilteredArchive = new BehaviorSubject([]);
  public searchArchive = new BehaviorSubject([]);
  public activeChild = new BehaviorSubject("inbox");

  public inboxState = new BehaviorSubject(false);
  public sentState = new BehaviorSubject(false);
  public archiveState = new BehaviorSubject(false);

  public isMessaging = new BehaviorSubject<boolean>(false);


  constructor(
    private globalService: GlobalService,
    private localSt: LocalStorageService
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;

  }
  getNumberOfPendingObs() {
    return this._numberOfPending.asObservable();
  }

  getNumberOfPendingValue() {
    return this._numberOfPending.getValue();
  }

  setNumberOfPending(numberOfPending) {
    this._numberOfPending.next(numberOfPending);
  }

  setIsMessaging(isMessaging) {
    this.isMessaging.next(isMessaging);
  }
  getIsMessaging() {
    return this.isMessaging.asObservable();
  }

  getNumberOfInboxValue() {
    return this._numberOfInbox.getValue();
  }

  getNumberOfInbox() {
    return this._numberOfInbox.asObservable();
  }

  setNumberOfInbox(number) {
    this._numberOfInbox.next(number);
  }

  // InboxSearch getter and setter

  getSearchInboxValue() {
    return this.searchInbox.getValue();
  }
  setSearchInbox(list) {
    this.searchInbox.next(list);
  }
  getFilteredInboxSearch() {
    return this.searchInboxFiltered.asObservable();
  }

  setFilteredInboxSearch(list) {
    this.searchInboxFiltered.next(list);
  }

  // SentSearch getter and setter

  getSearchSentValue() {
    return this.searchSent.getValue();
  }
  setSearchSent(list) {
    this.searchSent.next(list);
  }
  getFilteredSentSearch() {
    return this.searchFilteredSent.asObservable();
  }

  setFilteredSentSearch(list) {
    this.searchFilteredSent.next(list);
  }

  // SentSearch getter and setter

  getSearchArchiveValue() {
    return this.searchArchive.getValue();
  }
  setSearchArchive(list) {
    this.searchArchive.next(list);
  }
  getFilteredArchiveSearch() {
    return this.searchFilteredArchive.asObservable();
  }

  setFilteredArchiveSearch(list) {
    this.searchFilteredArchive.next(list);
  }

  // PracticianSearch getter and setter

  getSearchFiltredPractician() {
    return this.searchFiltredPractician.asObservable();
  }

  setSearchFiltredPractician(list) {
    this.searchFiltredPractician.next(list);
  }

  setActiveChild(text) {
    this.activeChild.next(text);
  }

  markAsSeen(obsList, ids) {
    let val = obsList.getValue();
    val.forEach(elm => {
      if (ids.includes(elm.id)) {
        elm.isSeen = true;
      }
    })
    obsList.next(val);
  }

  updateNumberOfInboxForPractician(accountId, inboxNumber) {
    let list: any[] = this.myPracticians.getValue();
    if (list && list.length > 0) {
      list.find((p) => p.id == accountId).number = inboxNumber;
    }
    this.myPracticians.next(list);
  }

  getMyNotificationsByMessagesNotSeen(seen: boolean): Observable<[any]> {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.BASE_URL_MA + "/notifications/messagesNotSeen"
    );
  }

  markMessageAsSeenByNotification(messageId: number): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.BASE_URL_MA + "/receivers/markMessageSeen/" + messageId
    );
  }

  markNotificationAsSeen(notidId: number): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.BASE_URL_MA +
      "/notifications/" +
      notidId +
      "/markAsSeen"
    );
  }

  markNotificationAsSeenBySenderId(senderId: number): Observable<boolean> {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.BASE_URL_MA +
      "/notifications/" +
      senderId +
      "/INVITATION/markAsSeen"
    );
  }
  markReceivedNotifAsSeen() {
    return this.globalService.call(
      RequestType.POST,
      this.globalService.BASE_URL_MA +
      "/notifications/markAsSeenByType/INVITATION"
    );
  }

  getUserId(): number {
    const token = this.localSt.retrieve("token");
    var decoded = jwt_decode(token);
    return decoded.cred_key;
  }

  getExpiretime() {
    const token = this.localSt.retrieve("token");
    var decoded = jwt_decode(token);
    return new Date(decoded.exp * 1000);
  }

  getCountOfMyArchieve() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.archived_messages + "countMine"
    );
  }
  getSecretaryPracticians() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.secretary + "/my-practicians"
    );
  }
  getSecretaryPracticiansId() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.secretary + "/my-practicians-id"
    );
  }
  changeSearch(search: search) {
    this.searchSource.next(search);
  }

  getCountOfMyPatientPending() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "myPatient/countPending"
    );
  }
  countPendingInvitations() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.favorite + "count-invitations"
    );
  }
}
