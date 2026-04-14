import { ActivityIndicator, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CheckBox, Divider } from "react-native-elements";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import Colors from "@/Constants/Colors";
import { Organization } from "@Service/generated/types";
import RBSheet from "react-native-raw-bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import fonts from "@/Constants/fonts";
import { useOrganizations } from "@Hooks/useOrganization";
import { useTaskReport } from "@Hooks/useTaskReport";
import { useMyReportsLazyQuery } from "@/graphql/generated/report.generated";
import { useAtom } from "jotai";
import { CurrentActiveOrganization, MyReportAtom } from "@/Atoms/taskAtom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/Store";

interface IDropdown {
  selectedOrganisation: string;
  setSelectedOrganisation: Dispatch<SetStateAction<string>>;
  setToggleDropdown: Dispatch<SetStateAction<boolean>>;
  toggleDropdown: boolean;
}

export default function Dropdown(props: IDropdown) {
  const { selectedOrganisation, setSelectedOrganisation, setToggleDropdown, toggleDropdown } = props;

  const [primeLoader, setPrimeLoader] = useState(true);
  const [switchLoader, setSwitchLoader] = useState(false);

  const organisations = useAppSelector((state) => state.Organisation.organizations);

  const { switchOrganization } = useOrganizations();
  const { fetchAllAssigment } = useTaskReport();
  const [fetchMyReport] = useMyReportsLazyQuery();
  const { t } = useTranslation();

  const [myReports, setMyReports] = useAtom(MyReportAtom);
  const [activeOrganisation, setActiveOrganisation] = useAtom(CurrentActiveOrganization);
  const rbSheetRef = useRef();

  useEffect(() => {
    if (toggleDropdown) {
      const expireTimeout = setTimeout(() => {
        setPrimeLoader(false);
      }, 30000);
      if (organisations.length) {
        setPrimeLoader(false);
        clearTimeout(expireTimeout);
      }
    }
  }, [organisations?.length, toggleDropdown]);

  useEffect(() => {
    if (toggleDropdown) {
      rbSheetRef.current?.open();
    } else {
      rbSheetRef.current?.close();
    }
  }, [toggleDropdown]);

  const fetchMyReports = async () => {
    return new Promise((resolve, reject) => {
      fetchMyReport({
        variables: {
          input: {
            skip: 0,
            limit: 50,
            masterOrg: global?.activeOrg,
          },
        },
        fetchPolicy: "no-cache",
      })
        .then((res) => {
          res.refetch().then((res) => {
            if (res.data?.myReports?.data?.length) {
              setMyReports(res.data.myReports.data);
            } else {
              setMyReports([]);
            }
            return resolve(true);
          });
        })
        .catch((err) => {
          console.log("Error in fetching my reports", err);
          return reject(false);
        });
    });
  };

  async function handleOrganization(organization: Organization) {
    try {
      setSwitchLoader(true);
      setSelectedOrganisation(organization?.name);
      global.activeOrg = organisations?._id;
      setActiveOrganisation(organization?._id);
      switchOrganization(organization?._id)
        .then(async (res) => {
          await fetchMyReports();
          await fetchAllAssigment(res);
          setSwitchLoader(false);
          setToggleDropdown(false);
          setPrimeLoader(true);
        })
        .catch((err) => {
          console.log("Err in switching organisation", err);
        });
    } catch (error) {
      setSwitchLoader(false);
      setToggleDropdown(false);
      setPrimeLoader(true);
    }
  }

  function Footer() {
    return (
      <View style={{ height: 50, width: "100%", alignItems: "center", justifyContent: "center" }}>
        <Text
          style={[
            styles.textTypo,
            styles.itemTextStyle,
            { color: Colors.light.PrimaryColor, fontSize: 15, lineHeight: 17 },
          ]}
        >
          {t("others.No more organisation to show")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RBSheet
        ref={rbSheetRef}
        height={Math.round(Dimensions.get("screen").height * 0.65)}
        openDuration={250}
        closeOnPressMask
        closeOnDragDown
        onClose={() => {
          setToggleDropdown(false);
        }}
        customStyles={{
          container: {
            borderTopEndRadius: 20,
            borderTopLeftRadius: 20,
          },
        }}
      >
        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
          <Text
            style={[
              styles.textTypo,
              styles.itemTextStyle,
              { color: Colors.light.PrimaryColor, fontSize: 17, lineHeight: 19 },
            ]}
          >
            {t("others.Select organization")}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {organisations?.length ? (
            organisations?.map((e, i) => (
              <View key={i} style={{ paddingHorizontal: 20 }}>
                <TouchableOpacity
                  key={i}
                  style={[styles.itemContainer, styles.rowDirection, { justifyContent: "space-between" }]}
                  onPress={() => handleOrganization(e)}
                  disabled={switchLoader}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.textTypo,
                      styles.itemTextStyle,
                      {
                        width: "85%",
                        color: e?.name === selectedOrganisation ? Colors.light.black : Colors.light.grayText,
                      },
                    ]}
                  >
                    {e?.name}
                  </Text>
                  {e?.name === selectedOrganisation && !switchLoader && (
                    <CheckBox containerStyle={styles.checkBoxStyle} checked={true} />
                  )}
                  {e?.name === selectedOrganisation && switchLoader && (
                    <ActivityIndicator color={Colors.light.PrimaryColor} />
                  )}
                </TouchableOpacity>
                <Divider />
              </View>
            ))
          ) : (
            <View style={{ alignItems: "center", justifyContent: "center", height: 400 }}>
              {!primeLoader ? (
                <Text style={[{ fontSize: 14 }]}>There is no more organization to show</Text>
              ) : (
                <ActivityIndicator color={Colors.light.PrimaryColor} />
              )}
            </View>
          )}
          {organisations.length ? <Footer /> : <></>}
        </ScrollView>
      </RBSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  checkBoxStyle: {
    margin: -10,
    padding: -10,
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    position: "absolute",
  },
  itemContainer: {
    paddingVertical: 13,
  },
  itemTextStyle: {
    color: Colors.light.grayText,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 17,
  },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
  selectedOrganizationContainer: {
    marginBottom: 10,
  },
  selectedOrganizationTextStyle: {
    color: Colors.light.black,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
});
