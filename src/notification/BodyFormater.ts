import { Platform } from "react-native";

// let body = '*bold* hii *hi 1* jkjk _a_ ~djbravo~ ```jhj```'

export const formateBody = (text: string) => {
  if (Platform.OS == "android") {
    let tempBody = text;

    const BOLDcur = text.split(" ");
    const BOLD = text.match(/\*([^\*]+)\*/g);

    if (BOLD != null) {
      let withIndex = BOLDcur?.map((m, i) => {
        let mf = BOLD.filter((r) => m == r);
        if (mf.length > 0) {
          return `<b>${mf[0].split("*").join("")}</b>`;
        } else {
          return m;
        }
      });
      tempBody = withIndex.join(" ");
    }

    const ITALICcur = tempBody.split(" ");
    const ITALIC = tempBody.match(/\_([^\_]+)\_/g);

    if (ITALIC != null) {
      let withIndex = ITALICcur?.map((m, i) => {
        let mf = ITALIC.filter((r) => m == r);
        if (mf.length > 0) {
          return `<i>${mf[0].split("_").join("")}</i>`;
        } else {
          return m;
        }
      });
      tempBody = withIndex.join(" ");
    }

    const LINEcur = tempBody.split(" ");
    const LINE = tempBody.match(/\~([^\~]+)\~/g);
    // //console.log(LINE,LINEcur)
    if (LINE != null) {
      let withIndex = LINEcur?.map((m, i) => {
        let mf = LINE.filter((r) => m == r);
        if (mf.length > 0) {
          return `<p style="text-decoration: line-through">${mf[0].split("~").join("")}</p>`;
        } else {
          return m;
        }
      });
      tempBody = withIndex.join(" ");
    }

    const MONOcur = tempBody.split(" ");
    const MONO = tempBody.match(/\```([^\```]+)\```/g);
    // //console.log(MONO,MONOcur)
    if (MONO != null) {
      let withIndex = MONOcur?.map((m, i) => {
        let mf = MONO.filter((r) => m == r);
        if (mf.length > 0) {
          return `${mf[0].split("```").join("")}`;
        } else {
          return m;
        }
      });
      tempBody = withIndex.join(" ");
    }

    return tempBody;
  } else {
    return text.replace(/[*_~`]/g, "");
  }
};
