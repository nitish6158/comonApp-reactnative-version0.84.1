import { View, Text, StyleSheet, Pressable, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ViewRecordScreenProps } from "@/navigation/screenPropsTypes";
import { useGetRecordByIdMutation } from "@/graphql/generated/database.generated";
import { AttachmentType, Record } from "@/graphql/generated/types";
import { customFieldType } from "./CreateRecordScreen";
import dayjs from "dayjs";
import { Colors } from "@/Constants";
import AntDesign from "react-native-vector-icons/AntDesign";
import { capitalize } from "lodash";
import HeaderWithAction from "@Components/header/HeaderWithAction";
import { useFocusEffect } from "@react-navigation/core";
import { useTranslation } from "react-i18next";

import CustomAttachmentView from "./components/CustomAttachmentView";

export default function ViewRecordScreen({ navigation, route }: ViewRecordScreenProps) {
  const [getRecordRequest, getRecordResponse] = useGetRecordByIdMutation();
  const [userRecord, setUserRecord] = useState<Record | null>(null);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      getRecordRequest({
        variables: {
          input: {
            _id: route.params.recordId,
          },
        },
      }).then((res) => {
        if (res.data?.getRecordById) {
          // console.log(res.data?.getRecordById)
          setUserRecord({ ...res.data?.getRecordById, customFields: JSON.parse(res.data?.getRecordById.customFields) });
        }
      });
    }, [])
  );

  if (getRecordResponse.loading) {
    return (
      <View style={{ height: 500, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <HeaderWithAction
        screenName={userRecord ? userRecord.title : ""}
        onBackPress={navigation.goBack}
        isActionVisible={true}
        ActionComponent={() =>
          userRecord ? (
            <Text
              onPress={() => {
                navigation.navigate("CreateRecordScreen", {
                  mode: "update",
                  recordId: userRecord._id,
                  parentId: userRecord.parent,
                });
              }}
            >
              {t("btn.edit")}
            </Text>
          ) : (
            <></>
          )
        }
      />

      {userRecord && (
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {userRecord.address && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.address")}</Text>
              <Text style={styles.valueText}>{userRecord.address}</Text>
            </View>
          )}
          {userRecord.company && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.company")}</Text>
              <Text style={styles.valueText}>{userRecord.company}</Text>
            </View>
          )}
          {userRecord.comment && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.comment")}</Text>
              <Text style={styles.valueText}>{userRecord.comment}</Text>
            </View>
          )}
          {userRecord.email && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.email")}</Text>
              <Text style={styles.valueText}>{userRecord.email}</Text>
            </View>
          )}
          {userRecord.firstName && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.firstName")}</Text>
              <Text style={styles.valueText}>{userRecord.firstName}</Text>
            </View>
          )}
          {userRecord.lastName && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.lastName")}</Text>
              <Text style={styles.valueText}>{userRecord.lastName}</Text>
            </View>
          )}
          {userRecord.landLine && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.landline")}</Text>
              <Text style={styles.valueText}>{userRecord.landLine}</Text>
            </View>
          )}
          {userRecord.mobile && (
            <View>
              <Text style={styles.labelText}>{t("userDatabase.mobile")}</Text>
              <Text style={styles.valueText}>{userRecord.mobile}</Text>
            </View>
          )}

          {renderCustoMFields()}
        </ScrollView>
      )}
    </View>
  );
  function renderCustoMFields() {
    if (!userRecord?.customFields) return <></>;

    //userRecord.customFields is already parsed in useEffect
    let data = userRecord.customFields ?? [];
    return data.map((item: customFieldType, index: number) => {
      return (
        <View key={index}>
          <Text style={styles.labelText}>{item.label}</Text>
          {item.value.length > 0 && (
            <View>
              {item.type == "date" && (
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                  <AntDesign name="calendar" size={18} color={Colors.light.PrimaryColor} />
                  <View style={{ marginLeft: 10 }}>
                    <Text>{dayjs(item.value).format("DD MMM YYYY")}</Text>
                    {item.remind_at && (
                      <View style={{ flexDirection: "row", marginTop: 2 }}>
                        <Text>{t("userDatabase.reminder-me-before")}</Text>
                        <Text style={{ marginLeft: 5 }}>
                          {item.remind_at.Count} {capitalize(item.remind_at.Unit)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              {(item.type == "number" || item.type == "text") && <Text style={styles.valueText}>{item.value}</Text>}
            </View>
          )}
          {item.attachments.length > 0 &&
            item.attachments.map((at) => {
              return (
                <View style={{ marginBottom: 20 }}>
                  <CustomAttachmentView attachment={at} />
                </View>
              );
            })}
        </View>
      );
    });
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  inputBox: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "500",
    color: "gray",
    marginBottom: 10,
  },
  valueText: {
    fontSize: 16,
    color: "black",
    marginBottom: 20,

    marginLeft: 10,
  },
});
