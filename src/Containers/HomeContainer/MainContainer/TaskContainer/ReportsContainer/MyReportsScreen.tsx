import * as React from "react";

import { $space_lg, $space_xxl } from "@/Constants/Spaces";

import { useFocusEffect, useNavigation } from "@react-navigation/core";
import { useMyReportsQuery } from "@Service/generated/report.generated";

import { EmptyList } from "@Components/EmptyList";
import { FlatList } from "react-native";
import { Layout } from "@Components/layout";
import { ReportListItem } from "@Components/FlatList/ReportListItem";
import { mainStyles } from "../../../../../styles/main";
import { useInfinity } from "@Hooks/useInfinity";
import { useOrganizations } from "@Hooks/useOrganization";
import { useAtom } from "jotai";
import { MyReportAtom } from "@/Atoms/taskAtom";
import ItemSeparator from "@Components/FlatList/ItemSeparator";
import { LoadingFooter } from "@Components/FlatList/LoadingFooter";

const total = 15;

export default function MyReportsScreen() {
  const { currentOrganization, loading } = useOrganizations();
  const { current, skip, limit, onFetchMore } = useInfinity();
  const [pullToRefresh, setPullToRefresh] = React.useState(false);
  const [myReports, setMyReports] = useAtom(MyReportAtom);

  const navigation = useNavigation();
  const isFocused = navigation.isFocused();

  const { loading: myReportsLoading, refetch } = useMyReportsQuery({
    skip: loading || !currentOrganization?._id,
    variables: {
      input: {
        skip: 0,
        limit: 50,
        masterOrg: global?.activeOrg ?? "",
      },
    },
    onCompleted: () => {},
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch().then((response) => {
        if (response?.data?.myReports?.data?.length) {
          setMyReports(response?.data?.myReports?.data);
        } else {
          setMyReports([]);
        }
        setPullToRefresh(false);
      });
    }, [])
  );

  const loadMore = () => {
    if (total > limit) {
      onFetchMore(current + 1);
    }
  };

  return (
    <>
      <Layout direction="start" withPadding={false} paddingBottom={$space_xxl + $space_lg}>
        <FlatList
          style={mainStyles.heightMax}
          refreshing={pullToRefresh}
          onRefresh={() => {
            setPullToRefresh(true);
            refetch()
              .then((response) => {
                console.log("After refetcg", response?.data?.myReports?.data?.length);
                if (response?.data?.myReports?.data?.length) {
                  setMyReports(response?.data?.myReports?.data);
                } else {
                  setMyReports([]);
                }
                setPullToRefresh(false);
              })
              .catch((Err) => {
                console.log("Error in refreshing reports", Err);
                setPullToRefresh(false);
              });
          }}
          data={myReports}
          renderItem={(item) => <ReportListItem key={item.item._id} item={item.item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ItemSeparatorComponent={ItemSeparator}
          ListFooterComponent={LoadingFooter(myReportsLoading)}
          ListEmptyComponent={<EmptyList title="errors.my-reports.no-data" />}
          keyExtractor={(item) => item?._id}
        />
      </Layout>
    </>
  );
}
