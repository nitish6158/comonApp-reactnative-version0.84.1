import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/Store";
import { filterInObject } from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/FilterContact";
import getAlphabatic from "@Util/alphabeticOrder";
import { socketManager } from "@/utils/socket/SocketManager";
import { createStorage } from "@/utils/mmkvStorage";
import { ContactDetailsDto } from "@/graphql/generated/types";

// Create MMKV storage instance for active contacts
const storage = createStorage({
  id: `active-contacts-storage`,
  encryptionKey: 'active-contacts-key'
});

export default function useActiveContacts() {
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [activeContactsData, setActiveContactsData] = useState<ContactDetailsDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  useEffect(() => {
    setIsLoading(true);
    const loadContacts = async () => {
      let receivedSocketData = false;
      const loadingTimeout = setTimeout(() => {
        if (!receivedSocketData) {
          setIsLoading(false);
        }
      }, 4000);

      try {
        const savedContacts = storage.getString("activeContacts");
        if (savedContacts) {
          const parsedContacts = JSON.parse(savedContacts);
          if (Array.isArray(parsedContacts)) {
            setActiveContactsData(parsedContacts);
            setIsLoading(false);
            console.log("Loaded active contacts from storage", parsedContacts.length);
          }
        }
      } catch (error) {
        console.error("Error parsing stored active contacts", error);
      }

      // Always fetch fresh data from socket
      socketManager.chatRoom.getActiveContacts((data) => {
        receivedSocketData = true;
        clearTimeout(loadingTimeout);

        if (Array.isArray(data)) {
          console.log("active contact from socket", data.length);
          try {
            storage.set("activeContacts", JSON.stringify(data));
            setActiveContactsData(data);
          } catch (error) {
            console.error("Error saving active contacts", error);
          }
        }
        setIsLoading(false);
      });
    };

    loadContacts();
  }, []);

  // useEffect(() => {
  //   setIsLoading(true);
  //   socketManager.chatRoom.getActiveContacts((data) => {
  //     if (data) {
  //       // Save to MMKV storage
  //       console.log("active contact from socket", data.length);
  //       try {
  //         storage.set('activeContacts', JSON.stringify(data));
  //         setActiveContactsData(data);
  //       } catch (error) {
  //         console.error("Error saving active contacts to storage", error);
  //       }
  //       setIsLoading(false);
  //     } else {
  //       setIsLoading(false);
  //     }
  //   });
  // }, []);

  const activeUsers = useMemo(() => {
    return activeContactsData
      .filter((v) => {
        let find = MyProfile?.blockedRooms.find((b) => v.userId?._id === b.pid);
        if (find) {
          return false;
        } else {
          return true;
        }
      })
      .map((v) => v.userId?._id) ?? []
  }, [MyProfile?.blockedRooms, activeContactsData]);


  const getContactById = (id: string) => {
    return activeContactsData.find((v) => v.userId?._id === id) ?? null;
  };

  // Type casting to make sure the return type matches what filterInObject expects
  const getContactList = useCallback(
  (searchValue: string) => {
    if (!activeContactsData || activeContactsData.length === 0) {
      return [];
    }

    if (!searchValue || searchValue.length === 0) {
      return activeContactsData;
    }

    const filtered = filterInObject({
      searchText: searchValue,
      data: activeContactsData as any,
    });

    return filtered ?? [];
  },
  [activeContactsData]
);

  return {
    getContactList,
    getContactById,
    activeContactsData,
    isLoading,
  };
}
