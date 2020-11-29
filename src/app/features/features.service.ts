import { Injectable } from "@angular/core";
import { GlobalService } from "@app/core/services/global.service";
import { RequestType } from "@app/shared/enmus/requestType";
import { Observable, BehaviorSubject } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import * as jwt_decode from "jwt-decode";
import { search } from "./practician-search/search.model";
import { SafeUrl } from "@angular/platform-browser";
import * as CryptoJS from "crypto-js";
import { HttpUrlEncodingCodec } from "@angular/common/http";
@Injectable({
  providedIn: "root"
})
export class FeaturesService {
  public photosArray = new Map();
  encode = new HttpUrlEncodingCodec();
  public listNotifications = [];
  public selectedPracticianId = 0;
  private _numberOfInbox = new BehaviorSubject<number>(0);
  numberOfForwarded: number = 0;
  numberOfArchieve: number = 0;
  numberOfAccepted: number = 0;
  private _numberOfPending = new BehaviorSubject<number>(0);
  numberOfProhibited: number = 0;
  numberOfArchivedPatient: number = 0;
  myPracticians: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public imageSource: string | ArrayBuffer | SafeUrl;
  private searchSource = new BehaviorSubject(new search());
  currentSearch = this.searchSource.asObservable();
  initialSearch = false;
  public fullName: string;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };

  public searchInboxFiltered = new BehaviorSubject([]);
  public searchInbox = new BehaviorSubject([]);
  public searchPracticianInboxFiltered = new Map();
  public searchPracticianInbox = new Map();
  public searchFiltredPractician = new BehaviorSubject([]);
  public searchFilteredSent = new BehaviorSubject([]);
  public searchSent = new BehaviorSubject([]);
  public searchFilteredForwarded = new BehaviorSubject([]);
  public searchForwarded = new BehaviorSubject([]);
  public searchFilteredArchive = new BehaviorSubject([]);
  public searchArchive = new BehaviorSubject([]);
  public activeChild = new BehaviorSubject("inbox");
  public historyPatient = new BehaviorSubject(false);

  public searchPatientsFiltered = new BehaviorSubject([]);
  public searchPatients = new BehaviorSubject([]);

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
  getIsMessagingValue() {
    return this.isMessaging.getValue();
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
  getSearchForwardedValue() {
    return this.searchForwarded.getValue();
  }
  setSearchForwarded(list) {
    this.searchForwarded.next(list);
  }
  getFilteredForwardedSearch() {
    return this.searchFilteredForwarded.asObservable();
  }

  setFilteredForwardedSearch(list) {
    this.searchFilteredForwarded.next(list);
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
  setHistoryPatient(value) {
    this.historyPatient.next(value);
  }

  // patient Search getter and setter

  getSearchPatientsValue() {
    return this.searchPatients.getValue();
  }
  setSearchPatients(list) {
    this.searchPatients.next(list);
  }
  getFilteredPatientsSearch() {
    return this.searchPatientsFiltered.asObservable();
  }

  setFilteredPatientsSearch(list) {
    this.searchPatientsFiltered.next(list);
  }

  markAsSeen(obsList, ids) {
    let val = obsList.getValue();
    val.forEach(elm => {
      if (ids.includes(elm.id)) {
        elm.isSeen = true;
      }
    });
    obsList.next(val);
  }

  markAsSeenById(obsList, ids) {
    obsList.forEach(elm => {
      if (ids.includes(elm.id) && !elm.isSeen) {
        elm.isSeen = true;
        this.setNumberOfInbox(this.getNumberOfInboxValue() - 1);
      }
    });
  }

  markAsNotSeenById(obsList, ids) {
    obsList.forEach(elm => {
      if (ids.includes(elm.id) && elm.isSeen) {
        elm.isSeen = false;
        this.setNumberOfInbox(this.getNumberOfInboxValue() + 1);
      }
    });
  }

  removeNotificationByIdMessage(ids) {
    let i = 0;
    let copyListNotifications = [...this.listNotifications];
    for (let elm of this.listNotifications) {
      if (ids.includes(elm.messageId)) {
        copyListNotifications.splice(i, 1);
      } else {
        i++;
      }
    }
    this.listNotifications = copyListNotifications;
  }

  addNotificationByIdMessage(obsList, ids) {
    obsList.forEach(elm => {
      if (ids.includes(elm.id)) {
        let notif = {
          civility: elm.users[0].civility,
          id: elm.users[0].id,
          messageId: elm.id,
          photoId: elm.photoId,
          picture: elm.users[0].img,
          role: elm.users[0].type,
          sender: elm.users[0].fullName,
          type: "MESSAGE"
        };
        this.listNotifications.push(notif);
      }
    });
  }

  updateNumberOfInboxForPractician(accountId, inboxNumber) {
    let list: any[] = this.myPracticians.getValue();
    if (list && list.length > 0) {
      list.find(p => p.id == accountId).number = inboxNumber;
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

  getCountOfForwarded() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.message + "/countForwarded"
    );
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

  public firstLetterUpper(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  checkIfSendPostalEnabled() {
    return this.globalService.call(
      RequestType.GET,
      this.globalService.url.option + "/check-postal/" + this.getUserId()
    );
  }
  activateSendPostal() {
    return this.globalService.call(
      RequestType.PUT,
      this.globalService.url.option + "/activate-postal/" + this.getUserId()
    );
  }
  encrypt(data) {
    try {
      return encodeURIComponent(
        CryptoJS.AES.encrypt(
          JSON.stringify(data),
          this.globalService.encyptionKey
        ).toString()
      );
    } catch (e) {
      console.log(e);
    }
  }

  decrypt(data) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        decodeURIComponent(data),
        this.globalService.encyptionKey
      );
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }
}
