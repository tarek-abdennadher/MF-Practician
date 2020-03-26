export class MessageParent {
  public id?: number;
  public sender?: any;

  constructor();
  constructor(message?: any) {
    this.id = (message && message.id) || "";
    this.sender = (message && message.sender) || "";
  }
}
