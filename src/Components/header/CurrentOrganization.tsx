import * as React from "react";

import { RootState } from "@Store/Reducer";
import Text from "../Text";
import { headerStyle } from "./HeaderStyle";
import { mainStyles } from "../../styles/main";
import { useSelector } from "react-redux";

export const CurrentOrganization = () => {
  const currentOrganization = useSelector((state: RootState) => state.Organisation.currentOrganization);

  return (
    <Text size="sm" style={[headerStyle.currentOrganization, mainStyles.flex1]} numberOfLines={1}>
      {currentOrganization?.name}
    </Text>
  );
};
