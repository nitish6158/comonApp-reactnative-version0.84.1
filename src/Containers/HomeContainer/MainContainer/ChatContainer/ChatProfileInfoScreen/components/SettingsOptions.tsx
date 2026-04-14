import React from 'react';
import { View } from 'react-native';
import { ItemList } from "@/Components";
import { navigate } from "@Navigation/utility";
import { useNavigation } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import _ from 'lodash';

// Assets
import Gallery from "@Images/Profile/Gallery.svg";
import ChatSearch from "@Images/Profile/chatSearch.svg";
import Mute from "@Images/Profile/Mute.svg";
import Wallpaper from "@Images/Profile/wallpaper.svg";
import Download from "@Images/Profile/Download.svg";
import GroupChatSetting from "@Images/Profile/GroupChatSetting.svg";
import Disappear from "@Images/Profile/disappear.svg";
import Favorite from "@Images/Profile/Favorite.svg";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import FastImage from "@d11/react-native-fast-image";
import Icon from "@Assets/images/Icon";
import GroupCommon from "@Images/Profile/GroupCommon.svg";
import ContactDetails from "@Images/Profile/ContactDetails.svg";
import Colors from "@/Constants/Colors";

// Types
import { UserContact } from "@/graphql/generated/types";
interface SettingsOptionsProps {
    display: any;
    mediaCount: number;
    setChatmode: (mode: string) => void;
    setSearchEnable: (enabled: boolean) => void;
    setMuteModalVisible: (visible: boolean) => void;
    setUnmuteModalVisible: (visible: boolean) => void;
    setcamerarollVisible: (visible: boolean) => void;
    isBroadcastRoom: boolean;
    FavoriteChat: any[];
    MyProfile: any;
    isReminder: UserContact | null;
}

const SettingsOptions: React.FC<SettingsOptionsProps> = React.memo(({
    display,
    mediaCount,
    setChatmode,
    setSearchEnable,
    setMuteModalVisible,
    setUnmuteModalVisible,
    setcamerarollVisible,
    isBroadcastRoom,
    FavoriteChat,
    MyProfile,
    isReminder
}) => {
    const { t } = useTranslation();

    const onMediaLinkAndDocsPress = () => {
        navigate("ChatMediaScreen", { Name: display.roomName ?? "N/A" });
    };

    const handleChatSearch = () => {
        setSearchEnable(true);
        setChatmode("search");
        global.roomId = display.roomId;
        navigate("ChatMessageScreen", {
            type: display.roomType,
            RoomId: display.roomId,
        });
    };

    const handleMuteSetting = () => {
        display.isCurrentRoomMuted
            ? setUnmuteModalVisible(true)
            : setMuteModalVisible(true);
    };

    const handleContactDetails = () => {
        const contactDetails = display.participants.find(
            (item) => item.user_id !== MyProfile._id
        );
        if (contactDetails) {
            navigate("ChatContactDetailsScreen", {
                user: { ...contactDetails, lastSeen: display.lastSeen },
            });
        }
    };

    return (
        <View style={{ backgroundColor: "white", paddingVertical: 10 }}>
            {/* Media & Links */}
            <ItemList
                Icon={<Gallery />}
                Title={t("chatProfile.media")}
                Count={mediaCount}
                _onPress={onMediaLinkAndDocsPress}
            />

            {/* Chat Search */}
            <ItemList
                Icon={<ChatSearch />}
                Title={t("chatProfile.chat-search")}
                _onPress={handleChatSearch}
            />

            {/* Mute Option */}
            {display.currentUserUtility.left_at == 0 &&
                !isBroadcastRoom &&
                display.roomType != "self" && (
                    <ItemList
                        Icon={<Mute />}
                        Title={t("chatProfile.mute")}
                        Count={
                            display.isCurrentRoomMuted ? "Yes" : t("chatProfile.no")
                        }
                        _onPress={handleMuteSetting}
                    />
                )}

            {/* Wallpaper */}
            {display.currentUserUtility.left_at == 0 && (
                <ItemList
                    Icon={<Wallpaper />}
                    Title={
                        isBroadcastRoom
                            ? t("wallpaper-sound.wallpaper")
                            : t("chatProfile.wallpaper")
                    }
                    _onPress={() => navigate("ChatWallPaperAndSoundScreen", {})}
                />
            )}

            {/* Camera Roll */}
            {display.currentUserUtility.left_at == 0 && !isBroadcastRoom && (
                <ItemList
                    _onPress={() => setcamerarollVisible(true)}
                    Icon={<Download />}
                    Title={t("chatProfile.save-to-camera")}
                    Count={
                        display.isCurrentRoomSavetoCameraRollActive
                            ? `${t("chatProfile.on")}`
                            : `${t("chatProfile.off")}`
                    }
                />
            )}

            {/* Group Settings */}
            {display.roomType == "group" &&
                display.isCurrentUserAdmin &&
                !isBroadcastRoom && (
                    <ItemList
                        Icon={<GroupChatSetting />}
                        Title={t("chatProfile.group-settings")}
                        _onPress={() => {
                            return navigate("GroupChatSettingScreen", {
                                RoomId: display.roomId,
                                SendChatRole: display.currentUserUtility.user_type,
                            });
                        }}
                    />
                )}

            {/* Disappearing Messages */}
            {display.currentUserUtility.left_at == 0 && !isBroadcastRoom && (
                <ItemList
                    Icon={<Disappear />}
                    Title={t("chatProfile.disappearing")}
                    Count={
                        display.isCurrentRoomDisappearedMessageOn
                            ? t("chatProfile.on")
                            : t("chatProfile.off")
                    }
                    _onPress={() => navigate("ChatDisappearSettingScreen", {})}
                />
            )}

            {/* Favorite Messages */}
            <ItemList
                Icon={<Favorite />}
                Title={t("chatProfile.favorite")}
                Count={FavoriteChat.length > 0 ? FavoriteChat.length : ""}
                _onPress={() => {
                    navigate("FavoriteChatMessageScreen", {
                        RoomId: display.roomId,
                    });
                }}
            />

            {/* Room Reminders */}
            {display.roomType !== "broadcast" &&
                display.roomType != "self" &&
                !display.isCurrentRoomBlocked &&
                display.currentUserUtility.left_at == 0 && (
                    <ItemList
                        Icon={
                            <View
                                style={{
                                    borderRadius: 50,
                                    backgroundColor: Colors.light.PrimaryColor,
                                    paddingHorizontal: 8,
                                    paddingVertical: 8,
                                }}
                            >
                                <Ionicons name="notifications" size={18} color="white" />
                            </View>
                        }
                        Title={t("chatProfile.reminders")}
                        Count={""}
                        _onPress={() => {
                            navigate("ViewReminderScreen", {
                                roomId: display.roomId,
                            });
                        }}
                    />
                )}

            {/* Schedule Message */}
            {!display.isCurrentRoomBlocked &&
                display.currentUserUtility.left_at == 0 &&
                display.roomType != "self" && (
                    <ItemList
                        Icon={
                            <View
                                style={{
                                    borderRadius: 50,
                                    backgroundColor: Colors.light.PrimaryColor,
                                    paddingHorizontal: 8,
                                    paddingVertical: 8,
                                }}
                            >
                                <FastImage
                                    tintColor={"white"}
                                    source={Icon.ScheduleIcon}
                                    style={{ height: 18, width: 18 }}
                                />
                            </View>
                        }
                        Title={t("reminders.schedule-message")}
                        Count={""}
                        _onPress={() => {
                            navigate("ViewScheduleMessage", { roomId: display.roomId });
                        }}
                    />
                )}

            {/* Groups in Common */}
            {display.roomType !== "group" &&
                MyProfile?._id != display?.participants?.[0]?.user_id && (
                    <ItemList
                        Icon={<GroupCommon />}
                        Title={t("chatProfile.groupCommon")}
                        Count=""
                        _onPress={() => {
                            navigate("CommonChatListScreen", {
                                Pid: display.currentUserUtility.user_id,
                            });
                        }}
                    />
                )}

            {/* Privacy */}
            {display.roomType === "individual" && !isBroadcastRoom && (
                <ItemList
                    Icon={
                        <View
                            style={{
                                padding: 5,
                                backgroundColor: Colors.light.PrimaryColor,
                                borderRadius: 50,
                            }}
                        >
                            <Ionicons
                                name="lock-closed"
                                size={20}
                                color={Colors.light.White}
                            />
                        </View>
                    }
                    Title={t("privacy")}
                    Count=""
                    _onPress={() => {
                        let readReceiptsStatus = true;
                        const findIfStatusDisabled = display?.receipts?.find(
                            (e) => e?.user_id == MyProfile?._id
                        );
                        if (findIfStatusDisabled) {
                            readReceiptsStatus = findIfStatusDisabled?.receipt;
                        }
                        navigate("Privacy", {
                            chatRoomId: display.roomId,
                            status: readReceiptsStatus,
                        });
                    }}
                />
            )}

            {/* Contact Details */}
            {!display.isCurrentRoomBlocked &&
                display.roomType === "individual" && (
                    <ItemList
                        Icon={<ContactDetails />}
                        Title={t("chatProfile.contact-details")}
                        _onPress={handleContactDetails}
                    />
                )}
        </View>
    );
});

export default SettingsOptions;
