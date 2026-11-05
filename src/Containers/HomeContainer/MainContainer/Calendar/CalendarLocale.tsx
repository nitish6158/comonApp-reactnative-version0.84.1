import { useLanguageContext } from "@/hooks";
import { getCalendarLocaleConfig } from "@Util/calendar.utils";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LocaleConfig } from "react-native-calendars";

function CalendarLocale() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageContext();
  useEffect(() => {
    if (currentLanguage) {
      const { dayNames, dayShortNames, monthFullNames, shortMonthNames } = getCalendarLocaleConfig(t);
      LocaleConfig.locales[currentLanguage] = {
        monthNames: monthFullNames,
        monthNamesShort: shortMonthNames,
        dayNames: dayNames,
        dayNamesShort: dayShortNames,
      };
      LocaleConfig.defaultLocale = currentLanguage;
    }
  }, [currentLanguage]);

  return <></>;
}

export default React.memo(CalendarLocale, (prev, next) => true);
