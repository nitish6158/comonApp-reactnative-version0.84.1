export type ChatProfileActionVisibility = {
  showShareContact: boolean;
  showExportChat: boolean;
  showClearChat: boolean;
  showBlockOrUnblock: boolean;
  showReportContact: boolean;
  showLeaveGroup: boolean;
};

type RoomContext = {
  roomType: string;
  isBroadcastRoom: boolean;
  hasLeftRoom: boolean;
  isCurrentRoomBlocked: boolean;
};

export function getChatProfileActionVisibility(
  context: RoomContext
): ChatProfileActionVisibility {
  const isGroup = context.roomType === "group";
  const isIndividual = context.roomType === "individual";
  const isSelf = context.roomType === "self";
  const isActiveMember = !context.hasLeftRoom;

  return {
    showShareContact: !isGroup && !context.isBroadcastRoom && !isSelf,
    showExportChat: isActiveMember,
    showClearChat: isActiveMember,
    showBlockOrUnblock: isIndividual,
    showReportContact: isIndividual && !context.isCurrentRoomBlocked,
    showLeaveGroup: isActiveMember && isGroup && !context.isBroadcastRoom,
  };
}
