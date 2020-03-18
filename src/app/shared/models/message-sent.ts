export class MessageSent {
  id: number;
  isSeen: boolean;
  users: any;
  object: {
    name: string;
    isImportant: boolean;
  };
  time: string;
  isImportant: boolean;
  hasFiles: boolean;
  hasViewDetail: boolean;
}
