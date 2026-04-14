import React from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarLocale from "./CalendarLocale";
import CalendarDataManipulator from "./CalendarDataManipulator";
import CalendarView from "./CalendarView";
import { SurveyChecker } from "../SurveyContainer/SurveyChecker";
import { SurveyEventType } from "@/graphql/generated/types";

export default function Calendar() {
  return (
    <>
      <CalendarHeader />
      <CalendarView />
      <SurveyChecker type={SurveyEventType['Calendar']} />
    </>
  );
}

