export const padding = (a: number, b?: number, c?: number, d?: number) => ({
  paddingTop: a,
  paddingRight: b ? b : a,
  paddingBottom: c ? c : a,
  paddingLeft: d ? d : b ? b : a,
});
export const BorderRadius = {
  BorderRadiusChat: 5,
};
