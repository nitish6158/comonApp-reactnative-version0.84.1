import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/core";
import { useAtom, useAtomValue, atom, useSetAtom } from "jotai";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import _ from "lodash";

import { useChat } from "@/hooks/useChat";
import { usePinnedMessages } from "@/hooks/conversations/usePinnedMessages";

import useFileSystem from "@Hooks/useFileSystem";
import { useAppSelector } from "@Store/Store";

import PinnedChatsSection from "./components/PinnedChatsSection";
import MessageItem from "./components/MessageItem";
import MediaPreviewModel from "./MediaPreviewModel";
import OptionModal from "./OptionModal";

import {
  createGetItemLayout,
  MESSAGE_ITEM_HEIGHTS,
} from "@/utils/messageRenderUtils";

import { chatIndexForScroll, chatMode } from "@Atoms/ChatMessageEvents";
import { singleRoom } from "@Atoms/singleRoom";

import { setDownloadFileStore } from "@/redux/Reducer/ChatReducer";
import { socketManager } from "@/utils/socket/SocketManager";
import { ChatContext } from "@/Context/ChatProvider";
import { t } from "i18next";

dayjs.extend(utc);

// Media preview atom type
type MediaPreviewAtomProps = {
  url: string;
  type: "IMAGE" | "VIDEO";
  time: number;
} | null;

export const MediaPreviewAtom = atom<MediaPreviewAtomProps>(null);
export let renderFirst = false;

/**
 * Main component for displaying chat messages with optimized rendering
 */
export default function ChatListData() {
  // Room and user information
  const display = useAtomValue(singleRoom);
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const { readComonDirectory } = useFileSystem();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const OrganisationInvites = useAppSelector(
    (state) => state.Organisation.invites
  );

  // Chat state management
  const [mode, setChatMode] = useAtom(chatMode);
  const [conversationMessageIndex, setChatMessageIndex] =
    useAtom(chatIndexForScroll);

  // Create ref for the FlatList
  const flatListRef = useRef<FlatList>(null);

  // Get all chat functionality from ChatProvider context
  const {
    conversation,
    isFetching,
    loadMoreMessages,
    isFirstLoad,
    // Search related values from combined hook
    searchEnabled,
    isSearching,
    searchResults,
    searchPaginationIndex,
    performSearch,
  } = useContext(ChatContext);



  useEffect(() => {
    // console.log('lastMessage------->',conversation[0])
  }, [conversation])

  // Load and handle download state
  useEffect(() => {
    const getDownloaded = async () => {
      const response = await readComonDirectory();
      dispatch(setDownloadFileStore(response));
    };

    getDownloaded();
  }, []);


  // Handle unread messages
  useEffect(() => {
    if (display.roomId && conversation.length > 0 && isFirstLoad) {

    }
  }, [display.roomId, conversation, isFirstLoad]);

  // Handle search changes
  useEffect(() => {
    if (conversation?.length > 0 && searchPaginationIndex >= 0) {
      performSearch(flatListRef);
    }
  }, [conversation.length, searchPaginationIndex, performSearch]);

  // Handle scrolling to specific message
  useEffect(() => {
    if (
      conversationMessageIndex != null &&
      conversationMessageIndex >= 0 &&
      conversation.length > 0
    ) {
      // Add a small delay before scrolling to allow layout calculations
      setTimeout(() => {
        flatListRef?.current?.scrollToIndex({
          index: conversationMessageIndex,
          animated: true,
          viewPosition: 0.3,
        });
        setChatMessageIndex(null);
      }, 100);
    }
  }, [conversationMessageIndex, conversation, setChatMessageIndex]);

  // Optimize function for FlatList getItemLayout
  const getItemLayout = useCallback((data, index) => {
    return createGetItemLayout(data, index);
  }, []);

  // Handle scroll events with debounce to improve performance
  const handleChatScroll = useCallback(
    _.debounce(
      () => {
        if (mode !== "scroll" && !searchEnabled && !conversationMessageIndex) {
          setChatMode("scroll");
        }
      },
      200,
      { leading: true }
    ),
    [mode, searchEnabled, conversationMessageIndex, setChatMode]
  );

  // Render message item with memoization
  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <MessageItem
          item={item}
          index={index}
          conversation={conversation}
          myProfileMode={MyProfile?.mode}
          organisationInvites={OrganisationInvites}
        />
      );
    },
    [conversation, MyProfile?.mode, OrganisationInvites]
  );

  function handleSearchLoading() {
    if (searchEnabled && isSearching) {
      return <ActivityIndicator color="#33CCFF" />;
    }
    return <></>
  }

  function handleNoResult() {
    if (isFetching && conversation.length === 0) {
      return null;
    }

    if (searchEnabled && searchResults.length == 0 && !isSearching) {
      return <View>
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          {t('chat-screen.no-result-found')}
        </Text>
      </View>
    }
    if (conversation.length < 1)
      return <View>
        <Text style={{ textAlign: "center", justifyContent: 'center', marginTop: "80%" }}>
          {t('chat-screen.start-messaging')}
        </Text>
      </View>
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Simplified pinned messages section that only needs roomId */}
      <PinnedChatsSection roomId={display.roomId} />
      {handleSearchLoading()}
      {handleNoResult()}

      {/* Main chat list */}
      <FlatList
        ref={flatListRef}
        inverted={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        keyExtractor={(item, index) => `${item._id}${index}`}
        data={searchEnabled ? searchResults : conversation}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        onEndReachedThreshold={0.5}
        onEndReached={loadMoreMessages}
        onScroll={handleChatScroll}
        extraData={[
          display.isCurrentRoomBlocked,
          display.isCurrentUserLeftRoom,
          display.participants?.length,
          display.roomId,
          display.roomPermission,
        ]}
        ListFooterComponent={
          isFetching ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator color="#33CCFF" />
            </View>
          ) : null
        }
      />

      {/* Media preview and options modals */}
      <MediaPreviewModel />
      <OptionModal />
    </View>
  );
}

const ChatMessage = React.memo(ChatListData);
