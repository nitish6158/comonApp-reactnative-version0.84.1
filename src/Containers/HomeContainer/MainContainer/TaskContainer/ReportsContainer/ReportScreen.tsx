import * as React from "react";

import { RootStackScreenProps, ScreensList } from "@Types/types";
import { StyleSheet, View } from "react-native";

import Colors from "@/Constants/Colors";
import { HeaderWithScreenName } from "@Components/header/HeaderWithScreenName";
import ImageView from "react-native-image-viewing";
import { Layout } from "@Components/layout";
import { Loader } from "@Components/Loader";
import Timeline from "react-native-timeline-flatlist";
import VideoFullScreenPreview from "@Components/VideoPreviewFullScreen";
import { layoutStyle } from "@Components/layout/LayoutStyle";
import { mainStyles } from "../../../../../styles/main";
import { renderDetail } from "@Components/FlatList/TimeLineListItem";
import { useReportQuery } from "@Service/generated/report.generated";
import { $space_lg } from "@/Constants";

export const ReportScreen = ({ route }: RootStackScreenProps<ScreensList.Report>) => {
  const [ImagePreviewImage, setImagePreviewImage] = React.useState<React.SetStateAction<{ url: string; type: string }>>(
    {}
  );
  const [imageView, setImageView] = React.useState(false);
  const [imageData, setImageData] = React.useState([]);
  const [ImagePreviewVisible, setImagePreviewVisible] = React.useState(false);
  const [reportData, setReportData] = React.useState([]);

  const { reportId } = route.params;
  const { data, loading,error } = useReportQuery({
    skip: !reportId,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    variables: {
      input: {
        _id: reportId,
      },
    },
  });

  React.useEffect(() => {
    const taskData = data?.report?.tasksData;
    if (taskData?.[taskData?.length - 1]?.signatureAttachment) {
      setReportData(taskData);
    } else {
      setReportData(taskData?.slice(0, taskData?.length - 1));
    }
  }, [data?.report?.tasksData?.length]);

  function onPressImage(url: string) {
    const imageData = [{ uri: url }];
    setImageData(imageData);
    setImageView(true);
  }

  if (imageView) {
    return (
      <View style={{ flex: 1 }}>
        <ImageView
          images={imageData}
          imageIndex={0}
          visible={imageView}
          onRequestClose={() => setImageView(false)}
          backgroundColor={imageData?.[0]?.uri?.includes("base64,") ? "white" : "black"}
        />
      </View>
    );
  }
  if (ImagePreviewVisible) {
    return (
      <VideoFullScreenPreview
        ImagePreviewImage={ImagePreviewImage}
        ImagePreviewVisible={ImagePreviewVisible}
        closeImageModal={() => {
          setImagePreviewVisible(!ImagePreviewImage);
        }}
      />
    );
  }

  return (
    <>
      {loading ? (
        <Layout>
          <Loader />
        </Layout>
      ) : (
        <View style={[layoutStyle.containerBackground, mainStyles.flex1]}>
          <HeaderWithScreenName title={data?.report.assignment.scenario.name} />
          <Timeline
            data={reportData}
            separator
            showTime={false}
            innerCircle="dot"
            renderDetail={(item) =>
              renderDetail(
                item,
                imageView,
                onPressImage,
                setImagePreviewImage,
                setImagePreviewVisible,
                setImagePreviewVisible
              )
            }
            eventDetailStyle={styles.eventDetailStyle}
            listViewContainerStyle={[mainStyles.paddingTopBottomLg, styles.container]}
            circleColor={Colors.light.link}
            lineColor={Colors.light.link}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: $space_lg,
  },
  eventDetailStyle: {
    paddingTop: 0,
  },
});
