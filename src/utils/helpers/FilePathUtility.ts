export function getFileName(fileName: string) {
  let start = fileName?.slice(0, 14);
  let extension = fileName?.split(".").pop();

  return `${start}${fileName?.length > 14 ? "..." + extension : ""}`;
}

export function replaceAllCharacter(str: string, charToReplace: string, replacementStr: string) {
  let newStr = "";
  let places = str?.split(charToReplace);
  let tempP = places;

  for (let i = 0; i < places.length; i++) {
    newStr += `${tempP[i]}${i != places.length - 1 ? replacementStr : ""}`;
  }
  return newStr;
}

export function getFileNameFromCachePath(filePath: string) {
  let name = filePath?.split("/").pop();
  return name ?? filePath;
}
