export function getExportMessageText(chat: any): string {
  const type = String(chat?.type ?? "").toUpperCase();
  const rawMessage = typeof chat?.message === "string" ? chat.message.trim() : "";

  if (type === "TEXT" || type === "") {
    return rawMessage || "Sent a message";
  }

  if (type === "IMAGE") {
    return "Sent an image";
  }

  if (type === "VIDEO") {
    return "Sent a video";
  }

  if (type === "AUDIO") {
    return "Sent an audio";
  }

  if (type === "DOCUMENT") {
    return "Sent a document";
  }

  if (type === "CONTACT") {
    return "Sent a contact";
  }

  return `Sent a ${type.toLowerCase()} message`;
}
