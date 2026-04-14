import { View, Text, ActivityIndicator } from "react-native";
import React from "react";

export function LoadingFooter(loading?: boolean) {
  if (!loading) return <></>;
  return <ActivityIndicator />;
}
