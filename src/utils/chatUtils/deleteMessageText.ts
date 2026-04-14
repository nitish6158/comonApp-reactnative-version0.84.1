export default function DeleteMessageText(_item: any, _MyId: string, t: any) {
  let Deleteby = "";
  if (_item[0]?.user_id == _MyId) {
    Deleteby = t("delete-chat.you-deleted-this-message");
  } else {
    Deleteby = t("deletedMessage");
  }

  return `${Deleteby}`;
}
