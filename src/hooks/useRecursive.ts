import { View, Text } from "react-native";
import React, { useState } from "react";
import dayjs from "dayjs";
import _ from "lodash";
import { DaysNum } from "@/Containers/HomeContainer/MainContainer/ReminderContainer/CreateReminderScreen/reminder.types";
var weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

type monthWeekConfig = {
  startDate: string;
  endDate: string;
  weekNumber: number;
  dayOfWeek: number;
};

type monthDayConfig = {
  startDate: string;
  endDate: string;
  day: number;
};

type monthDateConfig = {
  monthISO: string;
  weekNumber: number;
  dayOfWeek: number;
};

type recursiveList = {
  occurrencesDate: string;
};

type dailyRecurrence = {
  startDate: string;
  endDate: string;
};

type onceRecurrence = {
  startDate: string;
};

type weeklySingleDayRecurrence = {
  startDate: string;
  endDate: string;
  weekNumber: number;
  dayOfWeek: number[];
};

type weeklyRecurrence = {
  startDate: string;
  endDate: string;
  weekNumber: number;
  daysOfWeek: string[];
};

type monthlyRecurrence = {
  startDate: string;
  endDate: string;
  day: number;
  weekNumber: number;
  dayOfWeek: number;
  isMonthDay: boolean;
};

type calculateRecurrenceType = {
  type: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
  startDate: string;
  endDate: string;
  day?: number;
  weekNumber?: number;
  weekRepeatNumber?: number;
  daysOfWeek?: string[];
  dayOfWeek?: number;
  isMonthDay?: boolean;
};

export default function useRecursive() {
  const [recursiveList, setRecursiveList] = useState<recursiveList[]>([]);

  function getDailyRecurrence(config: dailyRecurrence) {
    let diff = dayjs(config.endDate).diff(config.startDate, "day",true) + 1
    let list = [];

    for (let i = 0; i < diff; i++) {
      const date = dayjs(config.startDate).add(i, "days").toISOString();
      list.push({
        occurrencesDate: date,
      });
    }

    setRecursiveList(list);
    return list

    // let format = `${dayjs(getValues("startDate")).format("DD MMM YYYY")} & ${t("reminders.repeat-till")} ${dayjs(
    //   getValues("endDate")
    // ).format("DD MMM YYYY")}`;
  }

  function getOnceRecurrence(config: onceRecurrence) {
    let date = dayjs(config.startDate).toISOString();
    setRecursiveList([{ occurrencesDate: date }]);
    return [{ occurrencesDate: date }]
  }

  function shortDaysFromStart(date: string, listOfDays: string[]) {
    let weekDayArrange = {} as { [x: string]: string };

    for (let i = 0; i < 7; i++) {
      let index = dayjs(date).add(i + 1, "day");

      weekDayArrange[index.format("ddd").toUpperCase()] = index.toISOString();
    }

    listOfDays.sort((a, b) => {
      return weekDayArrange[a] > weekDayArrange[b] ? 1 : -1;
    });
    return listOfDays;
  }

  function getDateOfOccurrenceOfWeek(config: weeklySingleDayRecurrence) {
    let startPoint = dayjs(config.startDate);
    let startWeekCount = startPoint.week()
    let weekly = [];

    let occurrenceCount = 0;

    while (startPoint.isSameOrBefore(config.endDate,'dates')) {
   
      if (config.dayOfWeek.includes(startPoint.day())) {
        occurrenceCount++;
        let currentWeek = startPoint.week()

        if ((currentWeek - startWeekCount) % config.weekNumber == 0) {
          weekly.push(startPoint.toISOString());
        }
      }

      startPoint = startPoint.add(1, "day");
    }

    let validate = weekly.filter((occurrenceDate) => {
      let isAfterStart = dayjs(occurrenceDate).isSameOrAfter(config.startDate);
      let isBeforeEnd = dayjs(occurrenceDate).isSameOrBefore(config.endDate,'dates');
      if (isAfterStart && isBeforeEnd) {
        return true;
      } else {
        return false;
      }
    });

    return validate;
  }

  function getWeeklyRecurrence(config: weeklyRecurrence) {
    
    let weekday = config.daysOfWeek;
    let weekNumber = config.weekNumber;
    if (weekday && weekNumber) {
      let w = shortDaysFromStart(config.startDate, weekday).map(v=> DaysNum[v])
      let v = getDateOfOccurrenceOfWeek({
        startDate: config.startDate,
        endDate: config.endDate,
        weekNumber,
        dayOfWeek: w,
      });

      let recurrence = [] as recursiveList[];
      v.sort((a,b)=> dayjs(b).isBefore(dayjs(a)))

      v.forEach((date) => {
        recurrence.push({ occurrencesDate: date });
      });

      setRecursiveList(recurrence);
   
      return recurrence

      // if (v[0]) {
      //   let form = `${dayjs(v[0]).format("DD MMM YYYY")} & ${t("reminders.repeat-every")} ${
      //     weekNumber == 1 ? "week" : `${weekNumber}${weekFormat[weekNumber]} week`
      //   } ${weekday.map((v) => weekText[v]).join(", ")} `;
      //   setFirstRecurent(form);
      // } else {
      //   setFirstRecurent(null);
      // }
    }else{
      return []
    }
  }

  function calculateMonthDayRecurrence(config: monthDayConfig) {
    // Get the start and end dates
    let start = dayjs(config.startDate);
    let end = dayjs(config.endDate);
    let hour = dayjs(start).get("hours");
    let minute = dayjs(start).get("minutes");
    let dayNumber = config.day ?? 1;

    // Array to store the list of available months
    let availableMonths = [];

    // Validate if the start day is less than or equal to the specified day number
    if (start.date() <= dayNumber) {
      // Format the start month to get its name

      let occurrencesDate = start.set("date", dayNumber).set("hours", hour).set("minutes", minute).toISOString();
      // Add the start month to the list of available months
      availableMonths.push({ occurrencesDate });
    }

    // Loop through each month between start and end
    let currentDate = start.add(1, "month").startOf("month");
    while (currentDate.isBefore(end.endOf("month")) || currentDate.isSame(end.endOf("month"))) {
      // Validate if the start day is less than or equal to the specified day number
      let validStart = currentDate.startOf("month").date() <= dayNumber;

      // Validate if the end day is greater than or equal to the specified day number
      let validEnd = currentDate.endOf("month").date() >= dayNumber;

      // Check if both start and end days are valid
      if (validStart && validEnd) {
        let occurrencesDate = currentDate
          .set("date", dayNumber)
          .set("hours", hour)
          .set("minutes", minute)
          .toISOString();

        // Add the month to the list of available months
        availableMonths.push({ occurrencesDate });
      }

      // Move to the next month
      currentDate = currentDate.add(1, "month").startOf("month");
    }

    // If the last month's day is less than the specified day number, remove it from the list
    if (end.date() < dayNumber && availableMonths.length > 0) {
      availableMonths.pop();
    }

    // Return the list of available months
    // let value = _.uniqBy(availableMonths, (v) => v.month);
    // console.log(value)
    setRecursiveList(availableMonths);
    return availableMonths
  }

  function calculateMonthWeekOccurrences(config: monthWeekConfig) {
    const startDate = dayjs(config.startDate);
    const endDate = dayjs(config.endDate);
    let hour = dayjs(startDate).get("hours");
    let minute = dayjs(startDate).get("minutes");
    const weekNumber = config.weekNumber;
    const dayOfWeek = config.dayOfWeek;

    // Calculate the number of months between the start and end dates
    const monthDiff = endDate.diff(startDate, "month") + 1;

    // Initialize an array to store the occurrence dates
    const occurrenceDates = [];

    // Iterate through each month and calculate the occurrence date
    for (let i = 0; i < monthDiff; i++) {
      const currentMonth = startDate.add(i, "month").toISOString();

      const occurrencesDate = getDateOfOccurrenceOfMonth({
        monthISO: currentMonth,
        weekNumber,
        dayOfWeek,
      });
      // console.log(occurrenceDate, monthDiff);
      // Check if occurrenceDate is defined before adding it to the array
      if (occurrencesDate !== undefined) {
        occurrenceDates.push({ occurrencesDate: dayjs(occurrencesDate).set("hours", hour).set("minutes", minute) });
      }
    }

    let validate = occurrenceDates.filter((item, index) => {
      let isToday = dayjs(item.occurrencesDate).isToday();
      if (isToday) {
        let isAfterCurrentTime = dayjs(item.occurrencesDate).isAfter(dayjs(), "minutes");
        return isAfterCurrentTime;
      } else {
        let isAfterStart = dayjs(item.occurrencesDate).isSameOrAfter(startDate);
        let isBeforeEnd = dayjs(item.occurrencesDate).isSameOrBefore(endDate);
        if (isAfterStart && isBeforeEnd) {
          return true;
        } else {
          return false;
        }
      }
    });
    setRecursiveList(validate);

    return validate;
  }

  function getDateOfOccurrenceOfMonth(config: monthDateConfig) {
    // Parse the ISO string to get the month
    const month = dayjs(config.monthISO);

    // Initialize a counter for the occurrences of the specified day of the week
    let occurrenceCount = 0;
    let currentDate = month.startOf("month");

    // Iterate through each day of the month
    while (currentDate.month() === month.month()) {
      // Check if the current day matches the specified day of the week
      if (currentDate.day() === config.dayOfWeek) {
        // Increment the occurrence count
        occurrenceCount++;

        // If the occurrence count matches the desired week number, return the date
        if (occurrenceCount === config.weekNumber) {
          return currentDate.toISOString();
        }
      }

      // Move to the next day
      currentDate = currentDate.add(1, "day");
    }

    // If the desired occurrence is not found and the specified week number is less than 5,
    // return the date of the 4th occurrence
    if (occurrenceCount !== 0 && config.weekNumber === 5) {
      return getDateOfOccurrenceOfMonth({
        monthISO: config.monthISO,
        weekNumber: 4,
        dayOfWeek: config.dayOfWeek,
      });
    }
  }

  function getMonthlyRecurrence(config: monthlyRecurrence) {
    if (config.isMonthDay) {
      return calculateMonthDayRecurrence({
        startDate: config.startDate,
        endDate: config.endDate,
        day: config.day,
      });
    } else {
      return calculateMonthWeekOccurrences({
        startDate: config.startDate,
        endDate: config.endDate,
        weekNumber: config.weekNumber,
        dayOfWeek: config.dayOfWeek,
      });
    }
  }

  function calculateRecurrence(config: calculateRecurrenceType) {

    switch (config.type) {
      case "ONCE":
        return getOnceRecurrence({
          startDate: config.startDate,
        });
       
      case "DAILY":
        return getDailyRecurrence({
          startDate: config.startDate,
          endDate: config.endDate,
        });
       
      case "WEEKLY":
        return getWeeklyRecurrence({
          startDate: config.startDate,
          endDate: config.endDate,
          weekNumber: config.weekRepeatNumber ?? 1,
          daysOfWeek: config.daysOfWeek ?? [],
        });
       
      case "MONTHLY":
        return getMonthlyRecurrence({
          startDate: config.startDate,
          endDate: config.endDate,
          day: config.day ?? 1,
          weekNumber: config.weekNumber ?? 1,
          dayOfWeek: config.dayOfWeek ?? 1,
          isMonthDay: config.isMonthDay ?? true,
        });
      default:
        return []
    }
  }

  return {
    recursiveList,
    calculateRecurrence,
  };
}
