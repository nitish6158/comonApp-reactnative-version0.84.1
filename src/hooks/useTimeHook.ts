import { useMemo } from "react";
import dayjs from "dayjs";


export function formatTime(date: string | number) {
  if (!date) return "";

  const now = dayjs();
  const parsed = dayjs(date);

  if (!parsed.isValid()) return "";

  if (now.isSame(parsed, "day")) {
    return parsed.format("HH:mm");
  }

  if (now.subtract(1, "day").isSame(parsed, "day")) {
    return "Yesterday";
  }

  return parsed.format("DD/MM/YYYY");
}
// Convert formatTime back into a custom hook
export default function useTimeHook(date: string) {
 
  const time = useMemo(() => {
    if (dayjs().isSame(date, "day")) {
      return dayjs(date).format("HH:mm");
    } else if (dayjs().subtract(1, "day").isSame(dayjs(date), "day")) {
      return "Yesterday";
    } else {
      return dayjs(date).format("DD/MM/YYYY");
    }
  }, [date]);

  return { time };
}

export function getTime(date: string) {
  if (dayjs().isSame(date, "day")) {
    return dayjs(date).format("HH:mm");
  } else if (dayjs().subtract(1, "day").isSame(dayjs(date), "day")) {
    return "Yesterday";
  } else {
    return dayjs(date).format("DD/MM/YYYY");
  }
}

export function useTimeHookNew(date: string | number) {
  const parsedDate = useMemo(() => {
    if (!date) return null;

    // Handle numeric string timestamps
    if (typeof date === "string" && /^\d+$/.test(date)) {
      const numericDate = Number(date);
      if (!Number.isFinite(numericDate) || numericDate <= 0) return null;
      const normalizedDate = numericDate < 1e11 ? numericDate * 1000 : numericDate;
      return dayjs(normalizedDate);
    }

    if (typeof date === "number") {
      if (!Number.isFinite(date) || date <= 0) return null;
      const normalizedDate = date < 1e11 ? date * 1000 : date;
      return dayjs(normalizedDate);
    }

    const parsed = dayjs(date);
    if (!parsed.isValid()) return null;
    if (parsed.valueOf() <= 0) return null;
    return parsed;
  }, [date]);

  const time = useMemo(() => {
    if (!parsedDate || !parsedDate.isValid()) {
      return "";
    }

    if (dayjs().isSame(parsedDate, "day")) {
      return parsedDate.format("HH:mm");
    }

    if (dayjs().subtract(1, "day").isSame(parsedDate, "day")) {
      return "Yesterday";
    }

    return parsedDate.format("DD/MM/YYYY");
  }, [parsedDate]);


  return { time };
}
