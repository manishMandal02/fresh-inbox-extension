export enum IMessageEvent {
  Unsubscribe = 'unsubscribe',
  DeleteAllMails = 'deleteAllMails',
  UnsubscribeAndDeleteAllMails = 'unsubscribeAndDeleteAllMails',
}

export interface IMessageBody {
  event: IMessageEvent;
  email: string;
  name: string;
}
