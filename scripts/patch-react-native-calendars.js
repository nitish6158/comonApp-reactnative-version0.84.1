const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pkgRoot = path.join(root, "node_modules", "react-native-calendars", "src");

function patchFile(relativePath, replacements) {
  const filePath = path.join(pkgRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[calendar-patch] Skipping missing file: ${relativePath}`);
    return;
  }

  let source = fs.readFileSync(filePath, "utf8");
  let changed = false;

  for (const { find, replace } of replacements) {
    if (source.includes(replace)) {
      continue;
    }
    if (!source.includes(find)) {
      throw new Error(`[calendar-patch] Expected snippet not found in ${relativePath}`);
    }
    source = source.replace(find, replace);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, source);
    console.log(`[calendar-patch] Patched ${relativePath}`);
  }
}

patchFile("infinite-list/index.js", [
  {
    find: "const { isHorizontal, renderItem, data, reloadPages = noop, pageWidth = constants.screenWidth, pageHeight = constants.screenHeight, onPageChange, onReachEdge, onReachNearEdge, onReachNearEdgeThreshold, initialPageIndex = 0, initialOffset, extendedState, scrollViewProps, positionIndex = 0, disableScrollOnDataChange, onEndReachedThreshold, onVisibleIndicesChanged, layoutProvider, onScroll, onEndReached, renderFooter } = props;",
    replace:
      "const { isHorizontal, renderItem, data, reloadPages = noop, pageWidth = constants.screenWidth, pageHeight = constants.screenHeight, onPageChange, onReachEdge, onReachNearEdge, onReachNearEdgeThreshold, initialPageIndex = 0, initialOffset, extendedState, scrollViewProps, positionIndex = 0, disableScrollOnDataChange, onEndReachedThreshold, onVisibleIndicesChanged, layoutProvider, onScroll, onEndReached, renderFooter, stopHorizontalScroll } = props;",
  },
  {
    find: "    }, [onScroll, onPageChange, data.length, reloadPagesDebounce, isHorizontal, shouldFixRTL]);",
    replace:
      "    }, [onScroll, onPageChange, data.length, reloadPagesDebounce, isHorizontal, shouldFixRTL, stopHorizontalScroll]);",
  },
  {
    find: "            pagingEnabled: isHorizontal,\n            bounces: false,",
    replace:
      "            pagingEnabled: isHorizontal,\n            scrollEnabled: stopHorizontalScroll,\n            bounces: false,",
  },
  {
    find: "    }, [onScrollBeginDrag, onMomentumScrollEnd, scrollViewProps, isHorizontal]);",
    replace:
      "    }, [onScrollBeginDrag, onMomentumScrollEnd, scrollViewProps, isHorizontal, stopHorizontalScroll]);",
  },
]);

patchFile("timeline-list/index.d.ts", [
  {
    find: "import React from 'react';\nimport { TimelineProps } from '../timeline/Timeline';",
    replace:
      "import React from 'react';\nimport { ViewStyle } from 'react-native';\nimport { TimelineProps } from '../timeline/Timeline';\nimport type { Event } from '../timeline/EventBlock';",
  },
  {
    find: "    initialTime?: TimelineProps['initialTime'];\n}",
    replace:
      "    initialTime?: TimelineProps['initialTime'];\n    /**\n     * Callback function that returns event data and style data and render custom JSX Element\n     */\n    renderEvent?: (event: Event, styles: Array<ViewStyle>) => JSX.Element;\n    /**\n     * When Timeline page changes it returns new page date\n     */\n    onDateScroll?: (date: string) => void;\n}",
  },
]);

patchFile("timeline-list/index.js", [
  {
    find: "const { timelineProps, events, renderItem, showNowIndicator, scrollToFirst, scrollToNow, initialTime } = props;",
    replace:
      "const { timelineProps, events, renderItem, showNowIndicator, scrollToFirst, scrollToNow, initialTime, renderEvent, onDateScroll } = props;",
  },
  {
    find: "            setDate(newDate, UpdateSources.LIST_DRAG);\n        }",
    replace:
      "            setDate(newDate, UpdateSources.LIST_DRAG);\n            onDateScroll?.(newDate);\n        }",
  },
  {
    find: "            showNowIndicator: _isToday && showNowIndicator,\n            numberOfDays,\n            timelineLeftInset",
    replace:
      "            showNowIndicator: _isToday && showNowIndicator,\n            numberOfDays,\n            timelineLeftInset,\n            renderEvent: renderEvent ?? null",
  },
  {
    find: "          {/* <Text style={{position: 'absolute'}}>{item}</Text>*/}",
    replace: "          {/* <Text style={{position: 'absolute'}}>{item}</Text> */}",
  },
  {
    find: "    }, [events, timelineOffset, showNowIndicator, numberOfDays]);",
    replace:
      "    }, [events, timelineOffset, showNowIndicator, numberOfDays, renderEvent]);",
  },
]);

patchFile("timeline/EventBlock.d.ts", [
  {
    find: "    summary?: string;\n    color?: string;\n}",
    replace:
      "    summary?: string;\n    color?: string;\n    extraData: string;\n}",
  },
  {
    find: "    renderEvent?: (event: PackedEvent) => JSX.Element;",
    replace:
      "    renderEvent?: (event: PackedEvent, styles: Array<ViewStyle>) => JSX.Element;",
  },
]);

patchFile("timeline/EventBlock.js", [
  {
    find: "import XDate from 'xdate';",
    replace: "import dayjs from 'dayjs';",
  },
  {
    find: "    const _onPress = useCallback(() => {\n        onPress(index);\n    }, [index, onPress]);\n    return (<TouchableOpacity testID={props.testID} activeOpacity={0.9} onPress={_onPress} style={[styles.event, eventStyle]}>\n      {renderEvent ? (renderEvent(event)) : (<View>",
    replace:
      "    const _onPress = useCallback(() => {\n        onPress(index);\n    }, [index, onPress]);\n    if (renderEvent) {\n        return renderEvent(event, [styles.event, eventStyle]);\n    }\n    return (<TouchableOpacity testID={props.testID} activeOpacity={0.9} onPress={_onPress} style={[styles.event, eventStyle]}>\n      {<View>",
  },
  {
    find: "              {new XDate(event.start).toString(formatTime)} - {new XDate(event.end).toString(formatTime)}",
    replace:
      "              {dayjs(event.start).format('HH:mm A')} - {dayjs(event.end).format('HH:mm A')}",
  },
  {
    find: "        </View>)}",
    replace: "        </View>}",
  },
]);
