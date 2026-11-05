import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { OccurrenceOfWeekProps } from "./reminder.types";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export function notLessThenStartDate(value: string, start: string) {
  let isLessThenStart = dayjs(value).isBefore(dayjs(start, "date"));
  return !isLessThenStart || "End Date can't be less then start date";
}

export function shortDaysFromStart(date: string, listOfDays: string[]) {
  let weekDayArrange = {};

  for (let i = 0; i < 7; i++) {
    let index = dayjs(date).add(i + 1, "day");

    weekDayArrange[index.format("ddd").toUpperCase()] = index.toISOString();
  }

  listOfDays.sort((a, b) => {
    return weekDayArrange[a] > weekDayArrange[b] ? 1 : -1;
  });
  return listOfDays;
}

export function getDateOfOccurrenceOfWeek({ startDate, weekNumber, dayOfWeek, endDate }: OccurrenceOfWeekProps) {
  let startPoint = dayjs(startDate);
  let weekly = [];

  let occurrenceCount = 0;

  while (startPoint.isSameOrBefore(endDate)) {
    if (startPoint.day() === dayOfWeek) {
      occurrenceCount++;

      if (occurrenceCount % weekNumber == 0) {
        weekly.push(startPoint.format("YYYY-MM-DD"));
      }
    }

    startPoint = startPoint.add(1, "day");
  }

  let validate = weekly.filter((occurrenceDate) => {
    let isAfterStart = dayjs(occurrenceDate).isSameOrAfter(startDate);
    let isBeforeEnd = dayjs(occurrenceDate).isSameOrBefore(endDate);
    if (isAfterStart && isBeforeEnd) {
      return true;
    } else {
      return false;
    }
  });

  return validate;
}
