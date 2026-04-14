import { Maybe } from "@Service/generated/types";
import moment from "moment-timezone";

export const getNewDate = (miliSeconds?: number) => {
  let date = new Date();

  if (miliSeconds) {
    date = new Date(date.getTime() + miliSeconds * 1000 * 360 * 24 * 365);
  }
  return date.getTime();
};

export const isExpireAt = (expireAt?: number) => {
  if (!expireAt) {
    return false;
  }
  const now = getNewDate();

  if (now >= expireAt) {
    return true;
  }

  return false;
};
function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}
export const MessageTimeLine = (UnixDate: any) => {
  const time = moment
    .unix(Math.floor(UnixDate) / 1000)
    .tz(moment.tz.guess())
    .format("DD/MM/YYYY");

  return time;
};
export const UnixDate = (UnixDate: any) => {
  const unixTimestamp: any = moment
    .unix(Math.floor(UnixDate / 1000))
    .tz(moment.tz.guess())
    .format("DD/MM/YYYY");

  return unixTimestamp;
};
export const CalenderTime = (UnixDate: any) => {
  const unixTimestamp: any = moment
    .unix(Math.floor(UnixDate / 1000))
    .tz(moment.tz.guess())
    .format("MMMM Do YYYY, h:mm:ss a");

  return unixTimestamp;
};
export const TaskflowTime = (UnixDate: any) => {
  const isTodaysDate = "";
  const taskDate = moment
    .unix(Math.floor(UnixDate / 1000))
    .tz(moment.tz.guess())
    .format("DD/MM/YYYY");
  const currentdata = moment().format("DD/MM/YYYY");
  let unixTimestamp: any = "";
  if (taskDate == currentdata) {
    return (unixTimestamp = unixTimestamp =
      moment
        .unix(Math.floor(UnixDate / 1000))
        .tz(moment.tz.guess())
        .format("LT"));
  }
  unixTimestamp = moment
    .unix(Math.floor(UnixDate / 1000))
    .tz(moment.tz.guess())
    .calendar();

  return unixTimestamp;
};

export const currentTimeinUnix = () => {
  return +new Date();
};

export const covertUtcToLocalDate = (time?: number) => {
  const local = moment.utc(time).utcOffset(moment().utcOffset());
  return local;
};
export const getCallHistoryDate = (time: number) => {
  let str = "";
  const cDate = covertUtcToLocalDate(new Date().getTime());
  const sDate = covertUtcToLocalDate(time);
  const duration = cDate.diff(sDate, "second");
  let hours = Math.floor(duration / 3600);
  let minutes = Math.floor((duration / 60) % 60);
  const strHour = hours < 10 ? "0" + hours : hours;
  const strMinute = minutes < 10 ? "0" + minutes : minutes;
  if (hours < 24) {
    str = strHour + ":" + strMinute;
  } else if (hours > 24 && hours < 48) {
    str = sDate.format("dddd");
  } else {
    str = sDate.format("DD.MM.YY");
  }
  return str;
};

export const getLastSeen = (time: number) => {
  let str = "";
  const cDate = covertUtcToLocalDate(new Date().getTime());
  const sDate = covertUtcToLocalDate(time);
  const duration = cDate.diff(sDate, "second");
  let hours = Math.floor(duration / 3600);
  let minutes = Math.floor((duration / 60) % 60);
  const strHour = hours < 10 ? "0" + hours : hours;
  const strMinute = minutes < 10 ? "0" + minutes : minutes;
  if (hours < 24) {
    str = "Today";
  } else {
    str = sDate.format("DD.MM.YY");
  }
  return str;
};

type TimeToStartEndProps = { startTimeInMs: number; start: number; end?: Maybe<number> };
type convertTimeToStartEndType = ({ startTimeInMs, start, end }: TimeToStartEndProps) => {
  startTime: string;
  startDate: string;
  endDate: string;
};

export const convertTimeToStartEnd: convertTimeToStartEndType = ({ startTimeInMs, start, end }) => {
  const startTime = covertUtcToLocalDate(startTimeInMs).format("hh:mm");
  const startDate = moment(start).format("MMMM Do, YYYY");
  const endDate = end ? ` - ${moment(end).format("MMM DD")}` : "";

  return {
    startTime,
    startDate,
    endDate,
  };
};
