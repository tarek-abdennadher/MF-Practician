export class MessageArchived {
  id: number;
  isSeen: boolean;
  users: [
    {
      fullName: string;
      img: string;
      title: string;
      type: string;
    }
  ];
  object: {
    name: string;
    isImportant: boolean;
  };
  time: string;
  isImportant: boolean;
  hasFiles: boolean;
  isViewDetail: boolean;
  isChecked: boolean;
}
