export class MessageParent {
  public id?: number;
  public sender?: any;
  public messageStatus: string;
  public sendType: string;
  public assignedToId: string | number;

  constructor();
  constructor(message?: any) {
    this.id = (message && message.id) || "";
    this.sender = (message && message.sender) || "";
    this.messageStatus = (message && message.messageStatus) || "";
    this.sendType = (message && message.sendType) || "";
    this.assignedToId = (message && message.assignedToId) || null;
  }
}
