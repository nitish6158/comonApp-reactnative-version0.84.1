import {
  calendarGlobalReminder,
  eventDeleteRequestAtom,
  eventStatusRequestAtom,
} from "@/Atoms/CalendarAtom";
import { seniorChatAlertAtom } from "@/Atoms/seniorModeAtom";
import { useAtom } from "jotai";
import ChatAlertModal from "../HomeContainer/SeniorContainer/components/ChatAlertModal";
import ReminderStatusChangeView from "../HomeContainer/MainContainer/ReminderContainer/ViewReminderScreen/components/ReminderStatusChangeView";
import DeleteReminderView from "../HomeContainer/MainContainer/ReminderContainer/ViewReminderScreen/components/DeleteReminderView";
import React from "react";
import SingleViewReminder from "../HomeContainer/MainContainer/ReminderContainer/ViewReminderScreen/components/SingleViewReminder";
import ScheduleModel from "../HomeContainer/MainContainer/Calendar/components/ScheduleModel";
import { calendarRefreshAtom } from "@/Atoms/CalendarAtom";
export default function GlobalCalenderEvent() {
  const [selectedReminder, setCalendarReminder] = useAtom(
    calendarGlobalReminder,
  );
  const [deleteReminder, setDeleteReminder] = useAtom(eventDeleteRequestAtom);
  const [statusReminder, setStatusReminder] = useAtom(eventStatusRequestAtom);
  const [seniorChat, setSeniorChat] = useAtom(seniorChatAlertAtom);
  const [, triggerRefresh] = useAtom(calendarRefreshAtom);

  if (seniorChat) {
    return (
      <ChatAlertModal
        event={seniorChat}
        onClose={() => {
          setSeniorChat(null);
        }}
      />
    );
  }

  if (statusReminder) {
    return (
      <ReminderStatusChangeView
        event={statusReminder}
        onClose={() => {
          setStatusReminder(null);
        }}
        onSuccess={() => {
          triggerRefresh((v) => v + 1); // ✅ refresh
        }}
      />
    );
  }

  if (deleteReminder) {
    return (
      <DeleteReminderView
        reminder={deleteReminder}
        onClose={() => {
          setDeleteReminder(null);
        }}
        onSuccess={() => {
          triggerRefresh((v) => v + 1); // ✅ refresh after delete
        }}
      />
    );
  }

  if (selectedReminder && selectedReminder?.type !== "SCHEDULE") {
    return (
      <SingleViewReminder
        reminder={selectedReminder}
        onClose={() => {
          setCalendarReminder(null);
        }}
        onDelete={(reminder) => {
          setCalendarReminder(null);
          setTimeout(() => {
            setDeleteReminder(reminder);
          }, 1000);
        }}
        onStatusChange={(event) => {
          setCalendarReminder(null);
          setTimeout(() => {
            setStatusReminder(event);
          }, 1000);
        }}
        onSuccess={() => {
          triggerRefresh((v) => v + 1); // ✅ only after success
        }}
      />
    );
  }

  if (selectedReminder?.type === "SCHEDULE")
    return (
      <ScheduleModel
        event={selectedReminder}
        onClose={() => {
          setCalendarReminder(null);
        }}
        onDelete={(reminder) => {
          setCalendarReminder(null);
          setTimeout(() => {
            setDeleteReminder(reminder);
          }, 1000);
        }}
        onStatusChanged={(event) => {
          setCalendarReminder(null);
          setTimeout(() => {
            setStatusReminder(event);
          }, 1000);
        }}
      />
    );
  else {
    return <></>;
  }
}
