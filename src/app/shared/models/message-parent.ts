export class MessageParent {
  public id?: number;
  public sender?: any;
  public messageStatus: string;
  public sendType: string;


  constructor();
  constructor(message?: any) {
    this.id = (message && message.id) || "";
    this.sender = (message && message.sender) || "";
    this.messageStatus = (message && message.messageStatus) || "";
    this.sendType = (message && message.sendType) || "";
  }
}
