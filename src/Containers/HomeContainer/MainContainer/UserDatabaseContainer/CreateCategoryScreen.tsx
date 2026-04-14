import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { CreateCategoryScreenProps } from "@/navigation/screenPropsTypes";
import { HeaderWithScreenName } from "@/Components/header";
import { Button, TextField } from "react-native-ui-lib";
import { useCreateUserFolderMutation, useUpdateChildFolderNameMutation } from "@/graphql/generated/database.generated";
import ToastMessage from "@/utils/ToastMesage";
import { Colors } from "@/Constants";
import { useTranslation } from "react-i18next";

export default function CreateCategoryScreen({ navigation, route }: CreateCategoryScreenProps) {
  const [name, setName] = useState<string>("");
  const [createNewCategory, createNewCategoryResponse] = useCreateUserFolderMutation();
  const [updateCategoryName, updateCategoryNameResponse] = useUpdateChildFolderNameMutation();
  const { t } = useTranslation();
  return (
    <View style={styles.main}>
      <View>
        <HeaderWithScreenName
          title={`${route.params.mode == "create" ? `${t("navigation.create")}` : `${t("navigation.update")}`} ${t(
            "userDatabase.category"
          )}`}
        />
        <View style={{ marginHorizontal: 20, marginTop: 5 }}>
          <TextField
            style={styles.inputBox}
            defaultValue={route.params.text ?? ""}
            placeholder={`${t("userDatabase.enter-category")}`}
            onChangeText={setName}
          />
        </View>
      </View>
      <Button
        disabled={createNewCategoryResponse.loading || updateCategoryNameResponse.loading}
        label={route.params.mode == "update" ? `${t("navigation.update")}` : `${t("navigation.create")}`}
        onPress={() => {
          let trimmed = name.trim()
          // let trimmed = name.replace(/\s+/g, "")
          if (!trimmed.length) {
            ToastMessage(t("userDatabase.category-name-required"));
            return;
          }
          if (name.length > 3) {

            if (route.params.mode == "create") {
              createNewCategory({
                variables: {
                  input: {
                    name: trimmed,
                    parent: route.params.parentId,
                    records: [],
                  },
                },
              }).then((res) => {
                if (res.data?.createUserFolder) {
                  ToastMessage(t("userDatabase.category-created"));
                  navigation.goBack();
                }
              });
            }
            if (route.params.mode == "update" && route.params.categoryId) {
              updateCategoryName({
                variables: {
                  input: {
                    _id: route.params.categoryId,
                    name: trimmed,
                  },
                },
              }).then((res) => {
                if (res.data?.updateChildFolderName) {
                  ToastMessage(t("userDatabase.category-updated"));
                  navigation.goBack();
                }
              });
            }
          }
        }}
        style={{ marginHorizontal: 40, marginBottom: 15 }}
        backgroundColor={Colors.light.PrimaryColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  inputBox: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
});
