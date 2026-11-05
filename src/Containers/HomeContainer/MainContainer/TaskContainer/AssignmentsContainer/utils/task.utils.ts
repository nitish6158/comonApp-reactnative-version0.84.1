import { FirstHalfOfYear, SecondHalfOfYear } from "./task";

import { Assignment } from "@Service/generated/types";
import allMonthsWithDays from "@Util/month.json";
import { getBatches } from "../../../../../../utils/batches.utils";
import moment from "moment";
import { useAtomValue } from "jotai";
import { currentUserIdAtom } from "@/Atoms";

//calculate start time from today's 12:00am

const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const allMonths = FirstHalfOfYear.concat(SecondHalfOfYear);
const todaysDay = daysOfWeek[new Date().getUTCDay() - 1];
const currentMonth = allMonths[new Date().getUTCMonth()];
const currentYear = moment().year();

export function taskExecutor(currentTask: Assignment | null): { isCorrectTime: boolean; executingTime: string } {
  const myId = useAtomValue(currentUserIdAtom);

  const utcDateTime = currentTask?.start
    ? +moment.utc(currentTask?.start).startOf("day") + currentTask?.startTimeInMs
    : +moment.utc();
  const utcDateTimeFormatted = moment(utcDateTime);
  const taskExecuteTime = moment(utcDateTimeFormatted).calendar();

  switch (currentTask?.recurrent) {
    case "ONCE":
      return onceTaskExecutor(currentTask, taskExecuteTime, myId);
    case "DAILY":
      return commonTaskExecutor(currentTask, taskExecuteTime, myId);
    case "WEEKLY":
      return weeklyTaskExecutor(currentTask, taskExecuteTime, myId);
    case "MONTHLY":
      return monthlyTaskExecutor(currentTask, taskExecuteTime, myId);
    case "QUARTERLY":
      return timelyTaskExecutor(currentTask, taskExecuteTime, true);
    case "HALFYEARLY":
      return timelyTaskExecutor(currentTask, taskExecuteTime, false);
    case "ANNUALLY":
      return yearlyTaskExecutor(currentTask, taskExecuteTime);
    default:
      return {
        isCorrectTime: true,
        executingTime: taskExecuteTime,
      };
  }
}

function checkIfTaskCompleted(currentTask: Assignment, myId: string) {
  const checkMember = currentTask?.members?.find((e) => e?.member?.user?._id === myId);
  if (checkMember?.completeTime) {
    return checkMember?.completeTime;
  }
  return null;
}

function checkWeek(currentTask: Assignment, myId: string) {
  const date = +moment().utc();
  const myCompletionTime = checkIfTaskCompleted(currentTask, myId);
  if (myCompletionTime) {
    const startofWeek = +moment.utc(myCompletionTime).startOf("week");
    const endofWeek = +moment.utc(myCompletionTime).endOf("week");
    if (startofWeek < date && endofWeek > date) {
      return false;
    }
  }
  return checkCurrentWeek(currentTask.daylyParams?.everyWeek);
}

function yearlyTaskExecutor(
  currentTask: Assignment,
  taskExecutionTime: string
): { isCorrectTime: boolean; executingTime: string } {
  if (hasExceededEndDate(currentTask)) {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  } else {
    const taskExecutingYear = moment.utc(currentTask.start).year();

    const completionYear = currentTask?.completeTime ? moment.utc(currentTask.completeTime).year() : null;
    if (taskExecutingYear === currentYear) {
      if (completionYear && completionYear === currentYear) {
        return {
          isCorrectTime: false,
          executingTime: taskExecutionTime,
        };
      } else {
        const isCorrectTime = isCorrectTimeToExecuteTask(currentTask.start, currentTask.startTimeInMs);
        return {
          isCorrectTime: isCorrectTime,
          executingTime: taskExecutionTime,
        };
      }
    } else {
      if (completionYear) {
        if (completionYear === currentYear) {
          return {
            isCorrectTime: false,
            executingTime: taskExecutionTime,
          };
        }
      }
      return {
        isCorrectTime: true,
        executingTime: taskExecutionTime,
      };
    }
  }
}

function timelyTaskExecutor(
  currentTask: Assignment,
  taskExecutionTime: string,
  isQuaterly: boolean
): { isCorrectTime: boolean; executingTime: string } {
  if (hasExceededEndDate(currentTask)) {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  } else {
    const totalDays = getTotalDays(currentTask, isQuaterly ? true : false);
    const epochToCompare = currentTask?.start + totalDays * 24 * 60 * 60 * 1000;
    if (currentTask.start <= +moment.utc() && +moment.utc() <= epochToCompare) {
      const isCorrectTime = isCorrectTimeToExecuteTask(currentTask.start, currentTask.startTimeInMs);
      if (
        currentTask?.completeTime &&
        currentTask?.start <= currentTask?.completeTime &&
        epochToCompare >= currentTask?.completeTime
      ) {
        return {
          isCorrectTime: false,
          executingTime: taskExecutionTime,
        };
      } else {
        return {
          isCorrectTime: isCorrectTime,
          executingTime: taskExecutionTime,
        };
      }
    }
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  }
}

function monthlyTaskExecutor(
  currentTask: Assignment,
  taskExecutionTime: string,
  myId: string
): { isCorrectTime: boolean; executingTime: string } {
  if (hasExceededEndDate(currentTask)) {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  } else if (currentTask?.montlyParams?.months?.length) {
    const isCorrectTime = isCorrectTimeToExecuteTask(currentTask.start, currentTask.startTimeInMs);
    const completionTime = checkIfTaskCompleted(currentTask, myId);

    const CompletTimeMonth = completionTime ? moment.utc(completionTime).month() : 0;
    const currentMonthNumber = moment.utc().month();
    if (currentTask?.montlyParams?.months.includes(currentMonth) && CompletTimeMonth != currentMonthNumber) {
      return {
        isCorrectTime: isCorrectTime,
        executingTime: taskExecutionTime,
      };
    } else {
      return {
        isCorrectTime: false,
        executingTime: taskExecutionTime,
      };
    }
  } else {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  }
}

function weeklyTaskExecutor(
  currentTask: Assignment,
  taskExecutionTime: string,
  myId: string
): { isCorrectTime: boolean; executingTime: string } {
  if (hasExceededEndDate(currentTask)) {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  } else if (+moment.utc() < currentTask?.start) {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  } else if (currentTask?.daylyParams?.dayOfWeeks?.length) {
    const isCorrectTime = isCorrectTimeToExecuteTask(currentTask.start, currentTask.startTimeInMs);
    if (currentTask.daylyParams?.dayOfWeeks.includes(todaysDay) && checkWeek(currentTask, myId)) {
      return {
        isCorrectTime: isCorrectTime,
        executingTime: taskExecutionTime,
      };
    } else {
      return {
        isCorrectTime: false,
        executingTime: taskExecutionTime,
      };
    }
  } else {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  }
}

function commonTaskExecutor(
  currentTask: Assignment,
  taskExecutionTime: string,
  myId: string
): { isCorrectTime: boolean; executingTime: string } {
  const isCorrectTime = isCorrectTimeToExecuteTask(currentTask.start, currentTask.startTimeInMs);

  const completionTime = checkIfTaskCompleted(currentTask, myId);
  const currentDate = moment().utc().date();

  const completedDate = completionTime ? moment.utc(completionTime).date() : null;

  if (currentTask.end && +moment.utc() > currentTask.end) {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  } else {
    if (completedDate && completedDate !== currentDate) {
      return {
        isCorrectTime: isCorrectTime,
        executingTime: taskExecutionTime,
      };
    } else {
      return {
        isCorrectTime: isCorrectTime,
        executingTime: taskExecutionTime,
      };
    }
  }
}

function onceTaskExecutor(
  currentTask: Assignment,
  taskExecutionTime: string,
  myId: string
): { isCorrectTime: boolean; executingTime: string } {
  const isCorrectTime = isCorrectTimeToExecuteTask(currentTask.start, currentTask.startTimeInMs);
  const myCompletionTime = checkIfTaskCompleted(currentTask, myId);
  if (myCompletionTime) {
    return {
      isCorrectTime: false,
      executingTime: taskExecutionTime,
    };
  } else {
    if (currentTask?.end && new Date().getTime() > new Date(currentTask.end).getTime()) {
      return {
        isCorrectTime: false,
        executingTime: taskExecutionTime,
      };
    } else if (isCorrectTime) {
      return {
        isCorrectTime: isCorrectTime,
        executingTime: taskExecutionTime,
      };
    } else {
      return {
        isCorrectTime: false,
        executingTime: taskExecutionTime,
      };
    }
  }
}

function hasExceededEndDate(currentTask: Assignment) {
  if (currentTask.end && +moment.utc() > currentTask.end) {
    return true;
  }
  return false;
}

function isCorrectTimeToExecuteTask(start: number, timeToStartTask: number) {
  // checking time with start timestamp on 12:00 am basis and adding timeToStartTask to find out the correct time to execute task
  if (start) {
    const startingFromMidnight = +moment.utc(start).startOf("day");
    const executingTimestamp = startingFromMidnight + timeToStartTask;

    if (+moment.utc() >= executingTimestamp) return true;
    return false;
  }
  return false;
}

function getTotalDays(currentTask: Assignment, isQuaterly: boolean) {
  const month = +moment.utc(currentTask?.start).month();
  const startTimeMonth = allMonths[month];
  const newCalendarWillBe = allMonths
    .slice(month, allMonths.length)
    .concat(allMonths.slice(0, allMonths.length - month));
  const allQuaters = getBatches(newCalendarWillBe, isQuaterly ? 3 : 6);
  let totalDays = 0;
  for (let item of allQuaters) {
    if (item.includes(startTimeMonth)) {
      item.map((e) => {
        if (e === "FEB" && moment().isLeapYear()) {
          totalDays += allMonthsWithDays[e] + 1;
        } else {
          totalDays += allMonthsWithDays[e];
        }
      });
      break;
    }
  }
  return totalDays;
}

function checkCurrentWeek(weekToCheck: number) {
  if (!weekToCheck) return false;
  if (weekToCheck === 1) return true;
  const weekOfStartMonth = moment.utc().startOf("month").week();
  const currentWeek = moment.utc().week();
  const weekCheck = weekOfStartMonth + weekToCheck - 1;
  if (weekCheck == currentWeek) {
    return true;
  }
  return false;
}

export function getOverdueStatus(start: number) {
  const currentTime = Date.now();
  if (currentTime >= start + 5 * 60 * 1000) {
    return "Overdue";
  }
  if (start <= currentTime) {
    return "To Perform";
  }
  return "";
}
