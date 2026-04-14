import React, { Fragment, useEffect, useRef } from "react";

import useBackgroundStopWatch from "@Hooks/useBackgroundStopwatch";

function StopWatch() {
  const { formattedSeconds, start } = useBackgroundStopWatch();
  const startRef = useRef(start);

  useEffect(() => {
    startRef.current();
  }, []);

  return <Fragment>{formattedSeconds}</Fragment>;
}

export default StopWatch;
