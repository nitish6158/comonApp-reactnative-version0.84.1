import { DrawerActions, useNavigation } from "@react-navigation/core";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Colors from "@/Constants/Colors";
import Dropdown from "../Dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LogoTitle } from "../logo";
import MainSearch from "@Images/MainSearch.svg";
import NotificationIcon from "@Images/notification big.svg";
import { RootState } from "@Store/Reducer";
import fonts from "@/Constants/fonts";
import { navigate } from "../../navigation/utility";
import { useGetMyInvitesLazyQuery, useGetMyInvitesQuery } from "@Service/generated/organization.generated";
import { useOrganizations } from "@Hooks/useOrganization";
import { CurrentActiveOrganization } from "@/Atoms/taskAtom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { setOrganisationInvites } from "@/redux/Reducer/OrganisationsReducer";
import { useGetByIdsLazyQuery } from "@/graphql/generated/user.generated";

export default function TaskHeader() {
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const { t } = useTranslation();

  const [selectedOrganisation, setSelectedOrganisation] = useState("Select an organisation");

  const { FetchAllOrganisation } = useOrganizations();
  const organisationInvites = useSelector((state: RootState) => state.Organisation.invites);

  const currentOrganization = useSelector((state: RootState) => state.Organisation);
  const organisations = useSelector((state: RootState) => state.Organisation.organizations);

  const [activeOrganisation, setActiveOrganisation] = useAtom(CurrentActiveOrganization);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    
    if (!organisations?.length) {
      FetchAllOrganisation();
    }
  }, [organisations]);

  useEffect(() => {
    if (currentOrganization && currentOrganization?.currentOrganization?.name) {
      global.activeOrg = currentOrganization?.currentOrganization?._id;
      setActiveOrganisation(currentOrganization?.currentOrganization?._id);
      setSelectedOrganisation(currentOrganization?.currentOrganization?.name);
    }
  }, [currentOrganization]);

  function onToggleOrganization() {
    setToggleDropdown(!toggleDropdown);
    FetchAllOrganisation();
    
  }

  return (
    <>
      <View style={[styles.container, styles.rowDirection]}>
        <TouchableOpacity onPress={() => navigation.navigate("UserProfileScreen")} activeOpacity={0.8}>
          <LogoTitle />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dropdownTogglerContainer, styles.rowDirection]}
          onPress={onToggleOrganization}
          activeOpacity={0.8}
        >
          <View style={{ minWidth: "20%", maxWidth: "85%", alignItems: "center" }}>
            <Text numberOfLines={1} style={[styles.textTypo, styles.dropdownTogglerTextStyle]}>
              {selectedOrganisation == "Select an organisation"
                ? t("others.No selected organization")
                : selectedOrganisation}
            </Text>
          </View>
          <View style={{ width: "15%", alignItems: "center" }}>
            <Ionicons name={toggleDropdown ? "chevron-up" : "chevron-down-sharp"} size={15} style={styles.iconStyle} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.organizationInvitesContainer}
          activeOpacity={0.8}
          onPress={() => navigate("OrganisationInvites", {})}
        >
          <NotificationIcon {...styles.notificationIconStyle} fill={Colors.light.PrimaryColor} />
          {organisationInvites && organisationInvites.length ? (
            <View style={styles.inviteCountContainer}>
              <Text style={[styles.textTypo, styles.countTextStyle]}>{organisationInvites.length}</Text>
            </View>
          ) : (
            <></>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            navigate("ChatGlobalSearchScreen", {});
          }}
          activeOpacity={0.8}
        >
          <MainSearch fill={Colors.light.PrimaryColor} />
        </TouchableOpacity>
      </View>
      {toggleDropdown && (
        <Dropdown
          toggleDropdown={toggleDropdown}
          selectedOrganisation={selectedOrganisation}
          setSelectedOrganisation={setSelectedOrganisation}
          setToggleDropdown={setToggleDropdown}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
  },
  container: {
    backgroundColor: Colors.light.background,
    borderBottomColor: Colors.light.formItemBorder,
    borderBottomWidth: 1,
    height: 60,
    padding: 10,
  },
  countTextStyle: {
    color: Colors.light.black,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  dropdownTogglerContainer: {
    alignItems: "flex-start",
    borderColor: Colors.light.formItemBorder,
    borderRadius: 10,
    height: "100%",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    width: "65%",
  },
  dropdownTogglerTextStyle: {
    color: Colors.light.PrimaryColor,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  iconStyle: {
    color: Colors.light.PrimaryColor,
    marginLeft: 10,
  },
  inviteCountContainer: {
    alignItems: "center",
    borderColor: "red",
    borderRadius: 10,
    borderWidth: 1,
    bottom: 2,
    height: 15,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    top: 0,
    width: 15,
    zIndex: 1,
  },
  notificationIconStyle: {
    height: 20,
    width: 20,
  },
  organizationInvitesContainer: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    marginHorizontal: 5,
    width: "10%",
  },
  removeBorderEffect: {
    borderBottomEndRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
  },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
});
