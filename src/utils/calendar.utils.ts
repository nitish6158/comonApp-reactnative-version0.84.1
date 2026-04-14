import { IAllCalendarData, IDailyModeData } from "@/Atoms/CalendarAtom";
import { Colors } from "@/Constants";
import moment from "moment";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export const CURRENT_DATE = moment().format("YYYY-MM-DD");

interface IDot {
  key: string;
  color: string;
  selectedDotColor: string;
}
export interface IUniqueDate {
  dot: Array<IDot>;
  selected: boolean;
  selectedColor: string;
  marked: boolean;
}

export function getFormattedCalendarData(
  dataType: "monthly" | "weekly" | "daily",
  data: IAllCalendarData[],
  selectedDate: string
) {
  switch (dataType) {
    case "monthly":
      return getMonthlyFormattedData(data,selectedDate);
    case "daily":
      return getDailyFormattedData(data, selectedDate);
    case "weekly":
      return getWeeklyFormattedData(data, selectedDate);
    default:
      return "";
  }
}

export function getWeeklyFormattedData(data: IAllCalendarData[], selectedDate: string) {
  let uniqueDatesData: Record<string, any[]> = {};
  const withoutAnytimeTask = data.filter((e) => e.recurrent != "ANYTIME");
  const withAnytimeTask = data.filter((e) => e.recurrent == "ANYTIME");
  for (let item of withoutAnytimeTask) {
    const startDate = moment(startOfWeek(new Date(selectedDate)));
    let endDate = moment(endOfWeek(new Date(selectedDate)));
    if (
      !moment(selectedDate).isBetween(moment(new Date(item?.startDate)), moment(new Date(item?.endDate)), "day", "[]")
    )
      continue;
    for (let i = startDate; i <= endDate; startDate.add(1, "day")) {
      const formattedDate = moment(i).format("YYYY-MM-DD");
      console.log("frequencyAnalyzer", frequencyAnalyzer(item, i));
      if (!frequencyAnalyzer(item, i)) continue;
      if (uniqueDatesData[formattedDate]) {
        const clonedDateData = [...uniqueDatesData[formattedDate]];
        clonedDateData.push(item);
        uniqueDatesData[formattedDate] = clonedDateData;
      } else {
        uniqueDatesData[formattedDate] = [item];
      }
    }
  }
  for (let anytimeTask of withAnytimeTask) {
    for (let key in uniqueDatesData) {
      const clonedDateData = [...uniqueDatesData[key]];
      clonedDateData.push(anytimeTask);
      uniqueDatesData[key] = clonedDateData;
    }
  }
  const arrToSend = Object.entries(uniqueDatesData).map(([key, value]) => ({
    title: key,
    data: value,
  }));
  return arrToSend;
}

export function getDailyFormattedData(data: IAllCalendarData[], selectedDate: string) {
  const dailyFormattedData: Record<string, IDailyModeData[]> = {};
  for (let item of data) {
    const startDate = moment(new Date(item?.startDate));
    const endDate = item?.recurrent == "ONCE" ? moment(new Date(item?.startDate)) : moment(new Date(item?.endDate));
    if (item?.recurrent == "ONCE" || item?.recurrent == "DAILY") {
      for (let i = startDate; i <= endDate; startDate.add(1, "day")) {
        const formattedData: IDailyModeData = {
          start: moment(i).format("YYYY-MM-DD HH:mm:ss"),
          end: moment(i).add(40, "minutes").format("YYYY-MM-DD HH:mm:ss"),
          title: item?.label,
          summary: item?.description,
          color: "#eee",
        };
        const formattedDate = moment(i).format("YYYY-MM-DD");
        if (!dailyFormattedData[formattedDate]) {
          dailyFormattedData[formattedDate] = [formattedData];
        } else {
          const clonedData = [...dailyFormattedData[formattedDate]];
          clonedData.push(formattedData);
          dailyFormattedData[formattedDate] = clonedData;
        }
      }
    } else {
      if (item?.recurrent == "WEEKLY") {
        for (let i = startDate; i <= endDate; startDate.add(item?.daylyParams?.everyWeek, "week")) {
          for (let day of item?.daylyParams?.dayOfWeeks) {
            const index = daysOfWeek.indexOf(day, 0);
            const diff = index - startDate.day();
            const date = diff >= 0 ? moment(i).add(diff, "day") : moment(i).subtract(-diff, "day");
            const formattedDate = date.format("YYYY-MM-DD");
            if (moment(new Date(item.startDate)).isSame(i)) {
              if (startDate.day() <= index) {
                const formattedData = {
                  start: date.format("YYYY-MM-DD HH:mm:ss"),
                  end: date.add(40, "minutes").format("YYYY-MM-DD HH:mm:ss"),
                  title: item?.label,
                  summary: item?.description,
                  color: item?.type == "TASK" ? "#eee" : "green",
                };
                if (dailyFormattedData[formattedDate]) {
                  const clonedData = [...dailyFormattedData[formattedDate]];
                  clonedData.push(formattedData);
                  dailyFormattedData[formattedDate] = clonedData;
                } else {
                  dailyFormattedData[formattedDate] = [formattedData];
                }
              } else {
                continue;
              }
            } else {
              const formattedData = {
                start: date.format("YYYY-MM-DD HH:mm:ss"),
                end: date.add(40, "minutes").format("YYYY-MM-DD HH:mm:ss"),
                title: item?.label,
                summary: item?.description,
                color: item?.type == "TASK" ? "#eee" : "green",
              };
              if (dailyFormattedData[formattedDate]) {
                const clonedData = [...dailyFormattedData[formattedDate]];
                clonedData.push(formattedData);
                dailyFormattedData[formattedDate] = clonedData;
              } else {
                dailyFormattedData[formattedDate] = [formattedData];
              }
            }
          }
        }
      } else if (item?.recurrent == "MONTHLY") {
        for (let i = startDate; i <= endDate; startDate.add(1, "year")) {
          for (let month of item?.montlyParams?.months) {
            const index = months.indexOf(month);
            const startMonthIndex = moment(i).month();
            const diff = index - startMonthIndex;
            const newFormattedDate = moment(i).add(diff, "month");
            const dateFormatted = newFormattedDate.format("YYYY-MM-DD");
            if (
              moment(newFormattedDate).isSameOrAfter(moment(new Date(item?.startDate))) &&
              moment(newFormattedDate).isSameOrBefore(moment(new Date(item?.endDate)))
            ) {
              const formattedData = {
                start: newFormattedDate.format("YYYY-MM-DD HH:mm:ss"),
                end: newFormattedDate.add(40, "minutes").format("YYYY-MM-DD HH:mm:ss"),
                title: item?.label,
                summary: item?.description,
                color: item?.type == "TASK" ? "#eee" : "green",
              };
              if (dailyFormattedData[dateFormatted]) {
                const clonedData = [...dailyFormattedData[dateFormatted]];
                clonedData.push(formattedData);
                dailyFormattedData[dateFormatted] = clonedData;
              } else {
                dailyFormattedData[dateFormatted] = formattedData;
              }
            } else {
              continue;
            }
          }
        }
      } else {
        break;
      }
    }
  }
  return dailyFormattedData;
}

export function getMonthlyFormattedData(data: IAllCalendarData[],selectedDate:string) {
  let uniqueDatesData: Record<string, any[]> = {};
  for (let item of data) {
    const startDate = moment(item?.startDate);
    let endDate = moment(item?.endDate);
    const difference = moment(endDate).diff(startDate, "day");
    if (difference > 30) {
      endDate = moment(item?.startDate).endOf("month");
    }
    for (let i = startDate; i <= endDate; startDate.add(1, "day")) {
      const formattedDate = moment(i).format("YYYY-MM-DD");
      if (uniqueDatesData[formattedDate]) {
        const clonedDateData = [...uniqueDatesData[formattedDate]];
        clonedDateData.push(item);
        uniqueDatesData[formattedDate] = clonedDateData;
      } else {
        uniqueDatesData[formattedDate] = [item];
      }
    }
  }
  const arrToSend = Object.entries(uniqueDatesData).map(([key, value]) => ({
    title: key,
    data: value,
  }));
  return arrToSend;
}

function frequencyAnalyzer(assignment: IAllCalendarData, selectedDate: string) {
  const startDate = new Date(assignment?.startDate);
  const endDate = new Date(assignment?.endDate);
  const majorCondition =
    moment(startDate).isSameOrAfter(moment(startOfWeek(selectedDate))) &&
    moment(moment(endOfWeek(selectedDate))).isSameOrBefore(moment(endDate));

  switch (assignment.recurrent) {
    case "DAILY":
      if (majorCondition) return true;
      return false;

    case "ONCE":
      if (majorCondition && moment(startDate).isSame(selectedDate)) return true;
      return false;
    case "WEEKLY":
      if (majorCondition) {
        console.log(
          "moment(selectedDate).isSame(moment(startDate))",
          moment(selectedDate).utc().isSame(moment(startDate).utc()),
          selectedDate,
          moment(startDate)
        );
        if (moment(selectedDate).isSame(moment(startDate))) return true;
        const weekToCheck = moment(selectedDate).week();
        const startingOfMonthWeek =
          moment(selectedDate).startOf("month").week() + assignment?.daylyParams?.everyWeek - 1;
        console.log(moment(selectedDate).day(), startingOfMonthWeek, weekToCheck);

        if (startingOfMonthWeek == weekToCheck) {
          if (assignment.daylyParams?.dayOfWeeks.includes(daysOfWeek[moment(selectedDate).day()])) return true;
          return false;
        }
        return false;
      }
      return false;
    case "MONTHLY":
      if (majorCondition) {
        if (assignment.montlyParams?.months.includes(months[moment(selectedDate).month()])) {
          const start = moment(startDate);
          const end = moment(endDate);
          for (let i = start; i <= end; start.add(1, "month")) {
            if (moment(selectedDate).isSame(i)) {
              return true;
            }
          }
          return false;
        }
        return false;
      }
      return false;
    default:
      return true;
  }
}

export function getCalendarLocaleConfig(t: any) {
  const monthFullNames = [
    t("calendarConfig.jan"),
    t("calendarConfig.feb"),
    t("calendarConfig.march"),
    t("calendarConfig.april"),
    t("calendarConfig.may"),
    t("calendarConfig.june"),
    t("calendarConfig.july"),
    t("calendarConfig.aug"),
    t("calendarConfig.sept"),
    t("calendarConfig.oct"),
    t("calendarConfig.nov"),
    t("calendarConfig.dec"),
  ];
  const shortMonthNames = [
    t("calendarConfig.shortJan"),
    t("calendarConfig.shortFeb"),
    t("calendarConfig.shortMarch"),
    t("calendarConfig.shortApril"),
    t("calendarConfig.shortMay"),
    t("calendarConfig.shortJune"),
    t("calendarConfig.shortJuly"),
    t("calendarConfig.shortAug"),
    t("calendarConfig.shortSept"),
    t("calendarConfig.shortOct"),
    t("calendarConfig.shortNov"),
    t("calendarConfig.shortDec"),
  ];
  const dayNames = [
    t("calendarConfig.sun"),
    t("calendarConfig.mon"),
    t("calendarConfig.tue"),
    t("calendarConfig.wed"),
    t("calendarConfig.thru"),
    t("calendarConfig.fri"),
    t("calendarConfig.sat"),
  ];
  const dayShortNames = [
    t("calendarConfig.shortSun"),
    t("calendarConfig.shortMon"),
    t("calendarConfig.shortTue"),
    t("calendarConfig.shortWed"),
    t("calendarConfig.shortThurs"),
    t("calendarConfig.shortFri"),
    t("calendarConfig.shortSat"),
  ];
  return { monthFullNames, shortMonthNames, dayNames, dayShortNames };
}

function startOfWeek(date: Date | string) {
  const startOfWeekDate = new Date(date);
  const diff = startOfWeekDate.getDate() - startOfWeekDate.getDay() + (startOfWeekDate.getDay() === 0 ? -6 : 1);
  return startOfWeekDate.setDate(diff);
}

function endOfWeek(date: Date | string) {
  const endOfWeek = new Date(date);
  let lastday = endOfWeek.getDate() - (endOfWeek.getDay() - 1) + 6;
  return endOfWeek.setDate(lastday);
}
