import { serverContactType } from "@Store/Reducer/ContactReducer";

export type dataType = serverContactType[];
export type configType = {
  searchText: string;
  data: dataType;
  // searchKeys: Array<keyof dataType[number]>;
  // returnKeys: Array<keyof dataType[number]>;
};
export const filterInObject = ({ searchText, data }: configType) => {
  const search = `${searchText ?? ""}`.toLowerCase();
  return data.filter((item: { firstName: string; lastName: string }) => {
    const first = `${item.firstName ?? ""} ${item.lastName ?? ""}`.toLowerCase();
    const phone = `${item.phone ?? ""}`.toLowerCase();
    return first.split(" ").find((v) => v.startsWith(search)) || phone.includes(search);
  });
};
// export const filterInObject = (config: configType) => {
//   // //console.log(config.data);

//   return config.data.filter((item: { firstName: string; phone: (string | number | symbol)[][]; lastName: string }) => {
//     item.firstName.toLowerCase().includes(config.searchText.toLowerCase()) ||
//       item.lastName.includes(config.searchText.toLowerCase()) ||
//       item.phone.includes(config.searchText.toLowerCase());
//     // for (let i = 0; i < config.searchKeys.length; i++) {
//     //    item[config.searchKeys[i]].toLowerCase().includes(config.searchKeys.toLowerCase());
//     // }
//   });
// };

// const clean = config.searchText.replace(/[()-*\s]/g, "");
// const result: configType["data"] = config.data.filter((item) => {
//   for (let i = 0; i < config.searchKeys.length; i++) {
//     const searchFromText = item[config.searchKeys[i]];
//     //console.log(searchFromText);

//     if (typeof searchFromText == "string") {
//       const cleanSearchFromText = searchFromText.replace(/[()-\s]/g, "");
//       if (cleanSearchFromText.match(clean)) {
//         return true;
//       }
//     }
//   }
// });
// return result.map((item, index) => {
//   if (config.returnKeys.length == 0) {
//     return item;
//   } else {
//     type a = keyof configType["data"];
//     const modified: { [x: string]: string | boolean } = {};
//     config.returnKeys.forEach((key) => {
//       modified[key] = item[key];
//     });
//     return modified;
//   }
// });
// };
