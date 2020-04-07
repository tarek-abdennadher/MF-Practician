export class Message {
  public id?: number;
  public body?: string;
  public object?: any;
  public toReceivers?: any;
  public ccReceivers?: any;
  public sender?: any;
  public parent_id?: number;
  public sender_id?: number;
  public address?: string;
  public freeObject?: string;
  public uuid?: string;
  public hasFiles:boolean;

  constructor();
  constructor(message?: any) {
    this.id = (message && message.id) || "";
    this.body = (message && message.body) || "";
    this.toReceivers = (message && message.toReceivers) || [];
    this.ccReceivers = (message && message.ccReceivers) || [];
    this.sender = (message && message.sender) || "";
    this.parent_id = (message && message.parent_id) || "";
    this.sender_id = (message && message.sender_id) || "";
    this.address = (message && message.address) || "";
    this.freeObject = (message && message.freeObject) || "";
    this.uuid = (message && message.uuid) || "";
    this.hasFiles=(message && message.hasFiles) || false;
  }
}
