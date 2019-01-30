export interface IFrom {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  language_code: string;
}

export interface IChat {
  id: number;
  first_name: string;
  username: string;
  type: string;
}

export interface IMessage {
  message_id: number;
  from: IFrom;
  chat: IChat;
  date: number;
  text: string;
}

export interface IUpdate {
  update_id: number;
  message: IMessage;
}
