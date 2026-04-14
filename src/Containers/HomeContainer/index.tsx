import React from "react";
import { atom } from "jotai";
import { GlobalCallEvent } from "../SessionContainer/GlobalCallEvent";
import _ from "lodash";
import GlobalCalenderEvent from "../SessionContainer/GlobalCalenderEvent";

import UserSessionData from "../SessionContainer/UserSessionData";
import UserSession from "../SessionContainer/UserSession";
import RealmSyncContainer from "../SessionContainer/RealmSyncContainer";
import { CheckAppVersion } from "../SessionContainer/CheckAppVersion";
import GlobalContactSyncEvent from "../SessionContainer/GlobalContactSyncEvent";
import AndroidBackgroundService from "../SessionContainer/AndroidBackgroundService";
import PlatformForegroundService from "../SessionContainer/PlatformForegroundService";

export const SessionStatus = atom<boolean>(false);
export const ComonSyncStatus = atom<boolean>(false);

export function GlobalContainer() {
  return (
    <>
      <RealmSyncContainer />
      <CheckAppVersion />
      {/* <UserSessionData /> */}
      {/* <UserSession /> */}

      <PlatformForegroundService />
      <AndroidBackgroundService />

      <GlobalCallEvent />
      <GlobalCalenderEvent />
      <GlobalContactSyncEvent />
    </>
  );
}
