import React from "react";
import Text from "../../Text";
import styles from "./styles";

export default class DigitalTimeString extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.time,
    };
  }

  str_pad_left = (string, pad, length) => {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  };

  convertNumberToTime = (total_milli_seconds) => {
    if (total_milli_seconds < 0) {
      return "00:00:00";
    }
    let total_seconds = total_milli_seconds / 1000;
    total_seconds = Number(total_seconds.toFixed(0));
    const hours = Math.floor(total_seconds / 3600);
    const seconds_left = total_seconds - hours * 3600;
    const minutes = Math.floor(seconds_left / 60);
    const seconds = seconds_left - minutes * 60;

    const finalTime = this.str_pad_left(minutes, "0", 2) + ":" + this.str_pad_left(seconds, "0", 2);
    return finalTime;
  };

  render() {
    const time = this.convertNumberToTime(this.props.time);
    return <Text style={([styles.StandardText], this.props.timeStyle)}>{time}</Text>;
  }
}
