const incoming = {
  rejected: {
    msg: "REJECTED",
    audioIcon: require("../../assets/images/CallIncommingmissed.png"),
    videoIcon: require("../../assets/images/VideoIncomingMissed.png"),
  },
  accepted: {
    msg: "INCOMING",
    audioIcon: require("../../assets/images/CallIncommingAccept.png"),
    videoIcon: require("../../assets/images/VideoIncommingAccept.png"),
  },
  missed: {
    msg: "MISSED",
    audioIcon: require("../../assets/images/CallIncommingmissed.png"),
    videoIcon: require("../../assets/images/VideoIncomingMissed.png"),
  },
};
const outgoing = {
  initiator: {
    msg: "OUTGOING",
    audioIcon: require("../../assets/images/CallOutGoingMissed.png"),
    videoIcon: require("../../assets/images/VideoOutGoingMissed.png"),
  },
  rejected: {
    msg: "REJECTED",
    audioIcon: require("../../assets/images/CallOutGoingMissed.png"),
    videoIcon: require("../../assets/images/VideoOutGoingMissed.png"),
  },
  accepted: {
    msg: "OUTGOING",
    audioIcon: require("../../assets/images/CallOutGoingAccepted.png"),
    videoIcon: require("../../assets/images/VideoOutGoingAccepted.png"),
  },
  missed: {
    msg: "MISSED",
    audioIcon: require("../../assets/images/CallOutGoingMissed.png"),
    videoIcon: require("../../assets/images/VideoOutGoingMissed.png"),
  },
};

export { incoming, outgoing };
