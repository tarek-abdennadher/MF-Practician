export class PracticianSearch {
  id: number;
  isSeen: boolean;
  users: [
    {
      id: number;
      fullName: string;
      img: any;
      title: string;
      type: string;
      civility: string;
      fonction: string;
    }
  ];
  object: {
    name: string;
    isImportant: boolean;
    isLocalisation: boolean;
  };
  time: string;
  isImportant: boolean;
  hasFiles: boolean;
  isViewDetail: boolean;
  isArchieve: boolean;
  isChecked: boolean;
  photoId: string;
}
