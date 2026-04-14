import { Alert, PermissionsAndroid, Platform } from "react-native";
import {
  askCameraPermission,
  askMediaPermission,
  checkCameraPermission,
  checkMediaPermission,
  checkMicrophonePermission,
} from "@Util/permission";
import _ from "lodash";

import Contacts from "react-native-contacts";
import { uniqBy } from "lodash";
import { useState } from "react";
import PermissionHandler from "@Components/PermissionHandler";
import { TFunction } from "react-i18next";
import { countryCodes } from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/countrycodes";

const digitReg = new RegExp(/\D/);

export type formattedPhoneBook = {
  localId: string;
  name: string;
  phone: string;
  hasComon: boolean;
  hasInvited: boolean;
  lastName: string;
};

function getPhoneBookContactName(display: string, prefix: string | null, suffix: string | null) {
  //Phone book is not providing proper name of contact so we decided to get is from display name and extract first and last name.
  //display name from phone book have suffix and prefix we need to remove it then extract the first name and last name.
  //Ticket:- https://websenor-infotech.atlassian.net/browse/CP-37
  if (prefix || suffix) {
    display = display
      .replace(prefix ?? "", "")
      .trim()
      .replace(suffix ?? "", "")
      .trim();

    //If suffix added on phone book then it will add additional "," symbol at the end of last name
    if (suffix && display.endsWith(",")) {
      display = display.slice(0, -1);
    }

    const names = display.split(" ");
    const lastName = names.length > 1 ? names.slice(1).reduce((prev, la) => prev + " " + la) : "";
    return {
      firstName: `${names[0] ?? ""}`.trim(),
      lastName: lastName.trim().replace(",", ""),
    };
  } else {
    const names = display.split(" ");
    const lastName = names.length > 1 ? names.slice(1).reduce((prev, la) => prev + " " + la) : "";
    return {
      firstName: `${names[0] ?? ""}`.trim(),
      lastName: lastName.trim(),
    };
  }
}

export function removeDuplicateNumber(numbers: Array<{ number: string; label: string }>) {
  return _.uniqBy(numbers, (contact) => contact.number.replace(/[\+\(\)\s-]/g, ""));
}

const getAndFormateContact = async () => {
  try {
    const contacts = await Contacts.getAll();
    const con: contacts[] = [];
    for (let i = 0; i < contacts.length; i++) {
      const item = contacts[i];

      let value = {
        firstName: "",
        lastName: "",
      };

      if (Platform.OS == "android") {
        //if display is null then don not include it to contact
        if (!item.displayName) {
          i++;
        }
        //extract contact name from display name
        value = getPhoneBookContactName(item.displayName ?? "", item.prefix, item.suffix);
      }

      if (Platform.OS == "ios") {
        value = {
          firstName: item.givenName,
          lastName: item.familyName,
        };
      }

      if (item?.phoneNumbers?.length > 0) {
        //If sibling contact have duplicate numbers then remove it
        const uniqueContacts = removeDuplicateNumber(item?.phoneNumbers);
        //if add phone numers to local list

        let isEmptyName = `${value.firstName ?? ""}${value.lastName ?? ""}`.split(" ").join().length == 0;

        uniqueContacts.forEach((pn, phi) => {
          const contact = {
            name: isEmptyName ? pn.number.replace(/\(|\)|\s|-/g, "") : value.firstName,
            lastName: isEmptyName ? "" : value.lastName,
            phone: pn.number.replace(/\(|\)|\s|-/g, ""),
            localId: `${item.recordID}_${phi}`,
            hasComon: false,
            hasInvited: false,
          };
          con.push(contact);
        });
      }
    }

    //If Sibling contact and main contact both have same number then remove duplicate.

    const NoDuplicate = uniqBy(con, (v) => {
      let found = countryCodes.find((b) => v.phone.startsWith(b));
      if (found) {
        return v.phone.replace(found, "");
      } else {
        return v.phone;
      }
    });
    return NoDuplicate;
  } catch (error) {
    return []
  }
};

export async function addContact(t: TFunction<"translation", undefined>): Promise<Array<formattedPhoneBook>> {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === "android") {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
        .then(async (response) => {
          if (!response) {
            async function handlePressAgree(type: "contact" | "media") {
              const contacts = await requestContactPermission();
              await handleAllPermissions(t);
              if(contacts){
                return resolve(contacts);
              }else{
                return reject();
              }
            }
            const permissionType = PermissionHandler({ type: "contact", handlePressAgree, t });
            return permissionType;
          } else {
            await handleAllPermissions(t);
            const contacts = await getAndFormateContact();
            return resolve(contacts);
          }
        })
        .catch((Err) => {
          console.log("Error in checking contact permission", Err);
        });
    } else {
      const permissionStatus = await Contacts.requestPermission();
      let cameraPermission = await checkCameraPermission();
      if (!cameraPermission) await askCameraPermission();
      const microphonePermission = await checkMicrophonePermission();
      if (permissionStatus === "authorized") {
        const contacts = await getAndFormateContact();
        return resolve(contacts);
      }
      if (permissionStatus == "denied" || permissionStatus == "undefined") {
        return reject();
      }
    }
  });
}

async function handleAllPermissions(t: any) {
  const mediaPermission = await checkMediaPermission();
  if (!mediaPermission) {
    async function handlePressAgree(type: "contact" | "media") {
      if (type === "media") {
        await askMediaPermission();
        const cameraPermission = await checkCameraPermission();
        if (!cameraPermission) await askCameraPermission();
        const microphonePermission = await checkMicrophonePermission();
        console.log("Microphone permission", microphonePermission);
      }
    }
    return PermissionHandler({ type: "media", handlePressAgree, t });
  } else {
    const cameraPermission = await checkCameraPermission();
    if (!cameraPermission) await askCameraPermission();
    const microphonePermission = await checkMicrophonePermission();
    console.log("Microphone permission", microphonePermission);
  }
}

async function requestContactPermission() {
  let permissionRes = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
  ]);
  if (permissionRes["android.permission.READ_CONTACTS"] == "granted") {
    const contacts = await getAndFormateContact();
    return contacts;
  } else {
    return null
  }
}

const useSyncContactCommon = () => {
  const [syncContactRequest, sycContactResponse] = useState([]);
  return {
    syncContactRequest,
    sycContactResponse,
  };
};

export default useSyncContactCommon;
