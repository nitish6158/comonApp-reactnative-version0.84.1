

export function getTranslatedMessage(message: string, t: any) {
  if (message.includes("changed the name of group")) {
    const croppedGroupName = message.replace("changed the name of group", "");
    return `${t("groupNameChanged")} ${croppedGroupName.trim()}`;
  } else if (message.includes("changed the description of group")) {
    const croppedGroupName = message.replace("changed the description of group", "");
    return `${t("groupDescription")} ${croppedGroupName?.trim()}`;
  } else if (message.includes("created group")) {
    const croppedMessage = message.replace("created group", "");
    return `${t("createdGroup")} ${croppedMessage?.trim()}`;
  } else {
    switch (message.trim()) {
      case "turned on disappearing messages. All new messages will disappear from this chat 7 days after they're send.":
        return t("disappearingMessage");
      case "changed the picture of the group":
        return t("groupPictureChanged");
      case "left the group":
        return t("leftGroup");
      case "Started Audio Call":
        return t("audioCall");
      case "Started Video Call":
        return t("videoCall");
      case "added":
        return t("added");
      case "turned off disappearing messages":
        return t("turnedOffDisappearingMessage");
      case "removed":
        return t("removed");
      default:
        return message;
    }
  }
}