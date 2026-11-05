import { GooglePlaceData, GooglePlaceDetail } from "react-native-google-places-autocomplete";

export const MaxCustom = {
  MINUTE: 600,
  HOUR: 120,
  DAY: 28,
  WEEK: 4,
};

export enum Days {
  Mon = "MON",
  Tue = "TUE",
  Wed = "WED",
  Thu = "THU",
  Fri = "FRI",
  Sat = "SAT",
  Sun = "SUN",
}

export const DaysNum = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 0,
};

export type availableMonthType = {
  name: string;
  selectable: boolean;
  occurrenceDate: string | undefined;
};

export const daysData = Object.values(Days).map((day) => ({ day }));

export enum Months {
  Jan = "JAN",
  Feb = "FEB",
  Mar = "MAR",
  Apr = "APR",
  May = "MAY",
  Jun = "JUN",
  Jul = "JUL",
  Aug = "AUG",
  Sep = "SEP",
  Oct = "OCT",
  Nov = "NOV",
  Dec = "DEC",
}

export const MonthNum = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

export const MonthText = {
  JAN: "January",
  FEB: "February",
  MAR: "March",
  APR: "April",
  MAY: "May",
  JUN: "June",
  JUL: "July",
  AUG: "August",
  SEP: "September",
  OCT: "October",
  NOV: "November",
  DEC: "December",
};

export const weekText = {
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
  SUN: "sunday",
};

export const monthsData = Object.values(Months).map((day) => day);

export const weekNumbers = [
  { label: "first", value: 1 },
  { label: "second", value: 2 },
  { label: "third", value: 3 },
  { label: "forth", value: 4 },
  { label: "last", value: 5 },
];

export const weekFormat = {
  1: "st",
  2: "nd",
  3: "rd",
  4: "th",
};

export const weekDays = [
  { label: "monday", value: Days["Mon"] },
  { label: "tuesday", value: Days["Tue"] },
  { label: "wednesday", value: Days["Wed"] },
  { label: "thursday", value: Days["Thu"] },
  { label: "friday", value: Days["Fri"] },
  { label: "saturday", value: Days["Sat"] },
  { label: "sunday", value: Days["Sun"] },
];

export const reminderOccurrence = [
  { label: "once", value: "ONCE" },
  { label: "daily", value: "DAILY" },
  { label: "weekly", value: "WEEKLY" },
  { label: "monthly", value: "MONTHLY" },
  // { label: "Annually", value: "ANNUALLY" },
];

export type CustomNotificationProps = {
  onClose: () => void;
  onValueChange: ({ count, unit }: { count: number; unit: string }) => void;
  isVisible: boolean;
  selectedDateTime?: string;
};

export type LocationSelectionProps = {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (data: GooglePlaceData, detail: GooglePlaceDetail | null) => void;
  defaultText?: string;
};

export type OccurrenceOfWeekProps = {
  startDate: string;
  weekNumber: number;
  dayOfWeek: number;
  endDate: string;
};
