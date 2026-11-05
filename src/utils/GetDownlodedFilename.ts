function getDownloadfileName(file: string) {
  const tempFile = file?.split("/");
  return tempFile?.[tempFile?.length - 1];
}
export default getDownloadfileName;
