import type { FC } from "react";
import type { SvgProps } from "react-native-svg";
import type { IconName } from "./iconNames";

import back from "../../../assets/icons/svg/back.svg";
import close from "../../../assets/icons/svg/close.svg";
import more from "../../../assets/icons/svg/more.svg";
import search from "../../../assets/icons/svg/search.svg";
import filter from "../../../assets/icons/svg/filter.svg";
import send from "../../../assets/icons/svg/send.svg";
import mic from "../../../assets/icons/svg/mic.svg";
import camera from "../../../assets/icons/svg/camera.svg";
import attach from "../../../assets/icons/svg/attach.svg";
import emoji from "../../../assets/icons/svg/emoji.svg";
import reply from "../../../assets/icons/svg/reply.svg";
import forward from "../../../assets/icons/svg/forward.svg";
import pin from "../../../assets/icons/svg/pin.svg";
import star from "../../../assets/icons/svg/star.svg";
import check from "../../../assets/icons/svg/check.svg";
import doubleCheck from "../../../assets/icons/svg/doubleCheck.svg";
import clock from "../../../assets/icons/svg/clock.svg";
import phone from "../../../assets/icons/svg/phone.svg";
import video from "../../../assets/icons/svg/video.svg";
import phoneMissed from "../../../assets/icons/svg/phoneMissed.svg";
import videoMissed from "../../../assets/icons/svg/videoMissed.svg";
import mute from "../../../assets/icons/svg/mute.svg";
import unmute from "../../../assets/icons/svg/unmute.svg";
import speaker from "../../../assets/icons/svg/speaker.svg";
import speakerOff from "../../../assets/icons/svg/speakerOff.svg";
import switchCamera from "../../../assets/icons/svg/switchCamera.svg";
import endCall from "../../../assets/icons/svg/endCall.svg";
import user from "../../../assets/icons/svg/user.svg";
import users from "../../../assets/icons/svg/users.svg";
import addUser from "../../../assets/icons/svg/addUser.svg";
import contacts from "../../../assets/icons/svg/contacts.svg";
import edit from "../../../assets/icons/svg/edit.svg";
import deleteIcon from "../../../assets/icons/svg/delete.svg";
import info from "../../../assets/icons/svg/info.svg";
import settings from "../../../assets/icons/svg/settings.svg";
import notification from "../../../assets/icons/svg/notification.svg";
import calendar from "../../../assets/icons/svg/calendar.svg";
import location from "../../../assets/icons/svg/location.svg";
import link from "../../../assets/icons/svg/link.svg";
import image from "../../../assets/icons/svg/image.svg";
import document from "../../../assets/icons/svg/document.svg";
import lock from "../../../assets/icons/svg/lock.svg";
import eye from "../../../assets/icons/svg/eye.svg";
import eyeOff from "../../../assets/icons/svg/eyeOff.svg";
import chevronDown from "../../../assets/icons/svg/chevronDown.svg";
import chevronUp from "../../../assets/icons/svg/chevronUp.svg";
import plus from "../../../assets/icons/svg/plus.svg";
import minus from "../../../assets/icons/svg/minus.svg";
import checkCircle from "../../../assets/icons/svg/checkCircle.svg";
import database from "../../../assets/icons/svg/database.svg";
import folder from "../../../assets/icons/svg/folder.svg";
import briefcase from "../../../assets/icons/svg/briefcase.svg";
import dialpad from "../../../assets/icons/svg/dialpad.svg";
import keyboard from "../../../assets/icons/svg/keyboard.svg";
import target from "../../../assets/icons/svg/target.svg";
import chat from "../../../assets/icons/svg/chat.svg";
import chatFilled from "../../../assets/icons/svg/chatFilled.svg";
import home from "../../../assets/icons/svg/home.svg";
import copy from "../../../assets/icons/svg/copy.svg";
import share from "../../../assets/icons/svg/share.svg";
import download from "../../../assets/icons/svg/download.svg";
import upload from "../../../assets/icons/svg/upload.svg";
import play from "../../../assets/icons/svg/play.svg";
import pause from "../../../assets/icons/svg/pause.svg";
import refresh from "../../../assets/icons/svg/refresh.svg";
import warning from "../../../assets/icons/svg/warning.svg";
import checkboxBlank from "../../../assets/icons/svg/checkboxBlank.svg";
import checkboxMarked from "../../../assets/icons/svg/checkboxMarked.svg";
import radioOn from "../../../assets/icons/svg/radioOn.svg";
import radioOff from "../../../assets/icons/svg/radioOff.svg";
import arrowRight from "../../../assets/icons/svg/arrowRight.svg";
import phoneAdd from "../../../assets/icons/svg/phoneAdd.svg";
import bluetooth from "../../../assets/icons/svg/bluetooth.svg";
import outgoingCall from "../../../assets/icons/svg/outgoingCall.svg";
import incomingCall from "../../../assets/icons/svg/incomingCall.svg";

export type SvgIconComponent = FC<SvgProps>;

/** Single source of truth: semantic name → SVG component. */
export const iconRegistry: Record<IconName, SvgIconComponent> = {
  back,
  close,
  more,
  search,
  filter,
  send,
  mic,
  camera,
  attach,
  emoji,
  reply,
  forward,
  pin,
  star,
  check,
  doubleCheck,
  clock,
  phone,
  video,
  phoneMissed,
  videoMissed,
  mute,
  unmute,
  speaker,
  speakerOff,
  switchCamera,
  endCall,
  user,
  users,
  addUser,
  contacts,
  edit,
  delete: deleteIcon,
  info,
  settings,
  notification,
  calendar,
  location,
  link,
  image,
  document,
  lock,
  eye,
  eyeOff,
  chevronDown,
  chevronUp,
  plus,
  minus,
  checkCircle,
  database,
  folder,
  briefcase,
  dialpad,
  keyboard,
  target,
  chat,
  chatFilled,
  home,
  copy,
  share,
  download,
  upload,
  play,
  pause,
  refresh,
  warning,
  checkboxBlank,
  checkboxMarked,
  radioOn,
  radioOff,
  arrowRight,
  phoneAdd,
  bluetooth,
  outgoingCall,
  incomingCall,
};
