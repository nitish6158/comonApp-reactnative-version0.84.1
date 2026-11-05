import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useCallback, useState } from "react";
import { chatIndexForScroll, chatMode } from "@Atoms/ChatMessageEvents";
import { navigate } from "@Navigation/utility";
import { windowWidth } from "@Util/ResponsiveView";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useFavouriteMessages } from "@/hooks/conversations/useFavouriteMessages";

import AudioMessageComponent from "../ChatMessages/MessageComponents/AudioMessageComponent";
import BottomView from "./BottomView";
import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import DocumentMessageComponent from "../ChatMessages/MessageComponents/DocumentMessageComponent";
import HeaderWithAction from "@/Components/header/HeaderWithAction";
import ImageMessageComponent from "../ChatMessages/MessageComponents/ImageMessageComponent";
import Text from "@/Components/Text";
import TextMessageComponent from "../ChatMessages/MessageComponents/TextMessageComponent";
import VideoMessageComponent from "../ChatMessages/MessageComponents/VideoMessageComponent";
import { ReduxChat } from "@Types/types";
import Ionicons from "react-native-vector-icons/Ionicons";

/**
 * Interface for MessageView item data - separate from Conversation to avoid conflicts
 */
export interface MessageViewItem {
  __v: number;
  cid: string;
  created_at: string | number;
  fileURL: string;
  firstName: string;
  lastName: string;
  message: string;
  phone: string;
  reply_msg: Array<Record<string, any>>;
  roomId: string;
  sender: string;
  type: string;
  _id?: string;
  deleted?: Array<{ type: string, user_id: string }>;
  isForwarded?: boolean;
  updated_at?: number;
  favourite_by?: Array<{ user_id: string, favourite_at: number }>;

  // Additional fields needed for compatibility with message components
  duration?: number;
  fontStyle?: any;
  read_by?: any[];
  readByIds?: any[];
  isSavedMessages?: boolean;
}

/**
 * Message component to render different types of messages
 */
const MessageView = ({ item, myProfileId }: { item: MessageViewItem, myProfileId: string }) => {
  const isFromCurrentUser = item.sender === myProfileId;
  const isImageType = item.type === "IMAGE";
  const isMessageDeletedForEveryone = item?.deleted?.[0]?.type === "everyone";
  const isMessageForwarded = item?.isForwarded ?? false;

  // Cast safely by making sure all needed properties are present
  const messageForComponent = item as unknown as Conversation;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: isFromCurrentUser
              ? "rgb(224,250,255)"
              : "rgb(245,245,245)",
            marginLeft: windowWidth / 9,
          },
          isImageType && { backgroundColor: "transparent" },
        ]}
      >
        <ImageMessageComponent
          isVisible={item.fileURL !== null && item.type === "IMAGE"}
          isMessageDeletedForEveryOne={isMessageDeletedForEveryone}
          isMessageForwarded={isMessageForwarded}
          message={messageForComponent}
          searchText={""}
        />

        <VideoMessageComponent
          isVisible={item.fileURL !== null && item.type === "VIDEO"}
          isMessageDeletedForEveryOne={isMessageDeletedForEveryone}
          isMessageForwarded={isMessageForwarded}
          message={messageForComponent}
          searchText={""}
        />

        <DocumentMessageComponent
          isVisible={item.type === "DOCUMENT" || item.type === "APPLICATION"}
          isMessageDeletedForEveryOne={isMessageDeletedForEveryone}
          isMessageForwarded={isMessageForwarded}
          message={messageForComponent}
          searchText={""}
        />

        <AudioMessageComponent
          isVisible={item.type === "AUDIO"}
          isMessageDeletedForEveryOne={isMessageDeletedForEveryone}
          isMessageForwarded={isMessageForwarded}
          message={messageForComponent}
          searchText={""}
          senderImage=""
        />

        <TextMessageComponent
          isVisible={item.type === "text"}
          isMessageDeletedForEveryOne={isMessageDeletedForEveryone}
          isMessageForwarded={isMessageForwarded}
          message={messageForComponent}
          searchText={""}
        />
      </View>
    </View>
  );
};

/**
 * Empty state component when no favorite messages exist
 */
const EmptyState = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {t("Others.No favorite messages")}
      </Text>
    </View>
  );
};

/**
 * Loading indicator component
 */
const LoadingIndicator = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="small" color={Colors.light.PrimaryColor} />
  </View>
);

export default function Favorite() {
  // Global state
  const [chatMessageIndex, setChatMessageIndex] = useAtom(chatIndexForScroll);
  const [display] = useAtom(singleRoom);
  const [, setChatMode] = useAtom(chatMode);

  // Local state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<Conversation[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [checkRefresh, setCheckRefreshing] = useState(false)
  // Hooks
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const myProfile = useSelector((state: ReduxChat) => state.Chat.MyProfile);

  // Custom hook for favorite messages with pagination
  const {
    favouriteMessages,
    isLoading,
    refreshFavouriteMessages,
    loadMoreFavouriteMessages,
    pagination
  } = useFavouriteMessages(
    display.roomId,
    display.currentUserUtility
  );

  // Initialize and refresh favorite messages when component mounts
  useEffect(() => {
    if ((display.roomId && display.currentUserUtility?.user_id) || checkRefresh) {
      refreshFavouriteMessages();
      changeRefreshStatus(false)
    }
  }, [display.roomId, display.currentUserUtility?.user_id, refreshFavouriteMessages, checkRefresh]);

  const changeRefreshStatus = (status:boolean) => {
    setCheckRefreshing(status)
  }

  // Handle back button press
  const handleBackPress = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
      setSelectedIds([]);
      setSelectedMessages([]);
      return true;
    }
    navigation.goBack();
    return true;
  }, [isEditMode, navigation]);

  // Add back button handler
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, [handleBackPress]);

  // Clean up selection when navigating away
  useEffect(() => {
    const cleanupSelection = () => {
      setSelectedIds([]);
      setSelectedMessages([]);
      setIsEditMode(false);
    };

    navigation.addListener("blur", cleanupSelection);
    return () => navigation.removeListener("blur", cleanupSelection);
  }, [navigation]);

  // Toggle selection of a message
  const toggleMessageSelection = useCallback((id: string, message: any) => {
    const idString = id.toString();

    setSelectedIds(prevIds => {
      const index = prevIds.indexOf(idString);
      if (index === -1) {
        // Add if not exists
        setSelectedMessages(prev => [...prev, message as Conversation]);
        return [...prevIds, idString];
      } else {
        // Remove if exists
        setSelectedMessages(prev => prev.filter((_, i) => i !== index));
        return prevIds.filter((_, i) => i !== index);
      }
    });
  }, []);

  // Navigate to message in chat
  const navigateToMessage = useCallback((messageId: string) => {
    setChatMode("search");

    const messageIndex = favouriteMessages.findIndex(
      (msg) => msg._id === messageId
    );

    if (messageIndex !== -1) {
      // Using any type to bypass type checking for this atom
      (setChatMessageIndex as any)(messageIndex);
      navigate("ChatMessageScreen", {
        RoomId: display.roomId,
        type: display.roomType,
      });
    }
  }, [favouriteMessages, display.roomId, display.roomType, setChatMessageIndex, setChatMode]);

  // Process message for display (handle @ mentions)
  const processMessageMentions = useCallback((message: MessageViewItem) => {
    const updatedMessage = { ...message };
    const indexOfMention = updatedMessage.message.indexOf("@");

    if (indexOfMention !== -1) {
      const userId = updatedMessage.message.slice(indexOfMention + 1, indexOfMention + 25); // 25 is UUID length
      const mentionedUser = display.participants.find(
        (participant) => participant.user_id === userId
      );

      if (mentionedUser) {
        updatedMessage.message = `${updatedMessage.message.slice(0, indexOfMention)}@${mentionedUser.firstName}`;
      }
    }

    return updatedMessage;
  }, [display.participants]);

  // Render message item
  const renderMessageItem = useCallback(({ item }: { item: MessageViewItem }) => {
    const processedItem = processMessageMentions(item);
    const isSelected = selectedIds.includes(item._id || '');

    return (
      <Pressable
        style={styles.messageItemContainer}
        onPress={() => {
          if (isEditMode) {
            toggleMessageSelection(item._id || '', item);
          } else {
            navigateToMessage(item._id || '');
          }
        }}
        onLongPress={() => setIsEditMode(true)}
      >
        {isEditMode && <Ionicons
          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={Colors.light.PrimaryColor}
          style={{ position: "absolute", left: 10, top: 10 }}
        />}
        <MessageView
          myProfileId={myProfile?._id}
          item={processedItem}
        />
      </Pressable>
    );
  }, [isEditMode, myProfile, navigateToMessage, processMessageMentions, toggleMessageSelection, selectedIds]);

  // Footer with loading indicator for pagination
  const renderFooter = () => {
    return pagination.isLoadingMore ? <LoadingIndicator /> : null;
  };

  // Handle load more on scroll end
  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore && !isLoading) {
      loadMoreFavouriteMessages();
    }
  }, [pagination.hasMore, pagination.isLoadingMore, isLoading, loadMoreFavouriteMessages]);

  // Header component
  const renderHeader = useCallback(() => (
    <HeaderWithAction
      screenName={t("others.Favorite Messages")}
      onBackPress={() => {
        if (isEditMode) {
          setIsEditMode(false);
          setSelectedIds([]);
          setSelectedMessages([]);
        } else {
          navigation.goBack();
        }
      }}
      isActionVisible={isEditMode}
      ActionComponent={() => (
        <Text
          onPress={() => {
            setSelectedIds([]);
            setSelectedMessages([]);
            setIsEditMode(false);
          }}
        >
          Cancel
        </Text>
      )}
    />
  ), [isEditMode, navigation, t]);

  // Main content based on loading state and data availability
  const renderContent = () => {
    if (isLoading && !pagination.isLoadingMore) {
      return <LoadingIndicator />;
    }

    if (favouriteMessages.length === 0) {
      return <EmptyState />;
    }

    return (
      <FlatList
        contentContainerStyle={styles.flatListContent}
        data={favouriteMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item._id?.toString() || ''}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      {isEditMode && (
        <BottomView
          SelectedOption={selectedMessages}
          allMessages={favouriteMessages}
          Cid={selectedIds}
          RoomId={display.roomId}
          navigation={navigation}
          refreshFavouriteMessages={changeRefreshStatus}
          resetSelection={() => {
            setSelectedIds([]);
            setIsEditMode(false);
          }}
        />
      )}
    </View>
  );
}

// Define styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  contentContainer: {
    // marginHorizontal: 10,
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  messageItemContainer: {
    marginVertical: 5,
    // backgroundColor: 'blue'
  },
  messageContainer: {
    marginTop: 7,
    borderRadius: 10,
    padding: 8,
    flexDirection: "row",
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: Colors.light.Hiddengray,
    fontSize: 16,
  },
});
