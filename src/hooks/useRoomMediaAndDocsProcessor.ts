import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/core";
import { useAtom, useSetAtom } from "jotai";
import moment from "moment";
import { useSelector } from "react-redux";
import { createStorage } from "@/utils/mmkvStorage";
import { RoomAudioAtom, RoomDocsAtom, RoomLinksAtom, RoomMediaAtom } from "@/Atoms";
import { ReduxChat } from "@Types/types";
import { singleRoom } from "@Atoms/singleRoom";
import { socketManager } from "@/utils/socket/SocketManager";
import { storage as chatMessageStorage } from "@/Context/ChatProvider";

// Create MMKV instance for media cache
const mediaCache = createStorage({ id: 'room-media-cache' });

export function useRoomMediaAndDocsProcessor() {
  const setDocsValue = useSetAtom(RoomDocsAtom);
  const setMediaValue = useSetAtom(RoomMediaAtom);
  const setAudioValue = useSetAtom(RoomAudioAtom);
  const setLinksValue = useSetAtom(RoomLinksAtom);

  const MyProfile: any = useSelector<ReduxChat>(
    (state) => state.Chat.MyProfile
  );

  const RoomMediaData: any = useSelector<ReduxChat>(
    (state) => state.Chat.RoomMediaData
  );

  const [display] = useAtom(singleRoom);

  const normalizePayloadItems = (result: any): any[] => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.messages)) return result.messages;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  };

  const getRoomConversationItems = (roomId: string): any[] => {
    try {
      const raw = chatMessageStorage.getString(`conversations_${roomId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error reading room conversations from cache:", error);
      return [];
    }
  };

  const resolveMessageKey = (item: any): string => {
    return String(
      item?._id ??
        item?.server_id ??
        item?.id_local ??
        item?.local_Id ??
        `${item?.sender ?? ""}_${item?.created_at ?? ""}_${item?.fileURL ?? ""}`
    );
  };

  const mergeUniqueMessages = (...lists: any[][]): any[] => {
    const mergedMap = new Map<string, any>();
    lists.flat().forEach((item: any) => {
      if (!item) return;
      const key = resolveMessageKey(item);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, item);
      } else {
        mergedMap.set(key, { ...mergedMap.get(key), ...item });
      }
    });
    return Array.from(mergedMap.values());
  };

  useFocusEffect(
    useCallback(() => {
      if (display.roomId) {
        // Check for cached data first
        const cacheKey = `${display.roomId}:media`;
        const cachedData = mediaCache.getString(cacheKey);

        const roomConversations = getRoomConversationItems(display.roomId);

        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            const combinedCachedData = mergeUniqueMessages(
              normalizePayloadItems(parsedData),
              normalizePayloadItems(RoomMediaData),
              roomConversations
            );
            prepareMediaData(combinedCachedData);
          } catch (error) {
            console.error("Error parsing cached media data:", error);
          }
        }

        // Fetch fresh data from server
        socketManager.chatRoom.getMediaChats(display.roomId, 'all', (payload) => {
          // console.log("getMediaChats------>", JSON.stringify(payload));
          if (payload) {
            // Cache the response
            try {
              mediaCache.set(cacheKey, JSON.stringify(payload));
            } catch (error) {
              console.error("Error caching media data:", error);
            }
            const combinedPayload = mergeUniqueMessages(
              normalizePayloadItems(payload),
              normalizePayloadItems(RoomMediaData),
              roomConversations
            );
            prepareMediaData(combinedPayload);
          }
        });
      }
    }, [RoomMediaData, display.roomId])
  );
  const getBucketByMessage = (element: any): "media" | "docs" | "audio" | "links" | null => {
    const rawType = String(element?.type ?? "").toLowerCase();
    const fileUrl = String(element?.fileURL ?? element?.fileUrl ?? "").toLowerCase();
    const message = String(element?.message ?? "");
    const hasUrl = /(https?:\/\/[^\s]+)/i.test(message);

    const isLoadingType = rawType.startsWith("loading/");
    const loadingTail = isLoadingType ? rawType.replace(/^loading\//, "") : rawType;
    const loadingHead = loadingTail.split("/")[0];
    const normalizedType = loadingHead.toLowerCase();
    const majorType = normalizedType;

    const isImage =
      majorType === "image" ||
      normalizedType === "image" ||
      /\.(png|jpe?g|gif|webp|heic|bmp)$/i.test(fileUrl);

    const isVideo =
      majorType === "video" ||
      normalizedType === "video" ||
      /\.(mp4|mov|m4v|3gp|mkv|avi|mpeg)$/i.test(fileUrl);

    const isAudio =
      majorType === "audio" ||
      normalizedType === "audio" ||
      loadingTail.includes("recording") ||
      /\.(mp3|wav|m4a|aac|ogg|amr|caf)$/i.test(fileUrl);

    const isDocument =
      majorType === "application" ||
      normalizedType === "document" ||
      normalizedType === "file" ||
      normalizedType === "pdf" ||
      /\.(pdf|docx?|xlsx?|pptx?|csv|txt|zip|rar|7z)$/i.test(fileUrl);

    if (isImage || isVideo) return "media";
    if (isAudio) return "audio";
    if (isDocument) return "docs";
    if (normalizedType === "link" || (normalizedType === "text" && hasUrl)) return "links";
    return null;
  };

  async function prepareMediaData(result: Array<{ type: string, created_at: string }> | any) {
    try {
      const mediaItems = Array.isArray(result)
        ? result
        : Array.isArray(result?.messages)
        ? result.messages
        : Array.isArray(result?.data)
        ? result.data
        : [];

      const tempFilteredData = { media: [], docs: [], audio: [], links: [] };

      mediaItems.forEach((element) => {
        const bucket = getBucketByMessage(element);
        switch (bucket) {
          case "media":
            tempFilteredData.media.push(element);
            break;
          case "docs":
            tempFilteredData.docs.push(element);
            break;
          case "audio":
            tempFilteredData.audio.push(element);
            break;
          case "links":
            tempFilteredData.links.push(element);
            break;
          default:
            break;
        }
      });

      const today = moment().format("MMM YYYY");
      const currentYear = today.substring(4, 8);

      Object.keys(tempFilteredData).forEach((key) => {
        tempFilteredData[key].sort(
          (a, b) =>
            moment(b.created_at).valueOf() - moment(a.created_at).valueOf()
        );

        const groupedData = tempFilteredData[key].reduce((acc: any[], elm) => {
          const getMonthAndYear = moment(elm.created_at).format("MMM YYYY");
          let title = getMonthAndYear;

          if (getMonthAndYear === today) {
            title = "This Month";
          } else if (getMonthAndYear.substring(4, 8) === currentYear) {
            title = getMonthAndYear.substring(0, 4);
          }

          const lastGroup = acc[acc.length - 1];
          if (lastGroup?.title === title) {
            lastGroup.data.push(elm);
          } else {
            acc.push({ title, data: [elm] });
          }
          return acc;
        }, []);

        tempFilteredData[key] = groupedData;
      });

      // console.log("tempFilteredData: ", tempFilteredData.links);
      setLinksValue(tempFilteredData.links);
      setAudioValue(tempFilteredData.audio);
      setDocsValue(tempFilteredData.docs);
      setMediaValue(tempFilteredData.media);
    } catch (error) {
      console.error("Error preparing media data:", error);
    }
  }
}
