// @ts-nocheck
import { serverContactType } from "@Store/Reducer/ContactReducer";

export type dataType = serverContactType[];
export type configType = {
  searchText: string;
  data: dataType;
};

export const filterInObject = ({ searchText, data }: configType) => {
  if (!data || !Array.isArray(data)) return [];
  const search = `${searchText ?? ""}`.trim().toLowerCase();
  if (!search) return data;

  const searchDigits = search.replace(/\D/g, "");

  return data.filter((item: any) => {
    if (!item) return false;

    const firstName = `${item.firstName ?? ""}`.trim().toLowerCase();
    const lastName = `${item.lastName ?? ""}`.trim().toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const phone = `${item.phone ?? ""}`.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "");

    // 1. Name matching: full name includes, first/last name includes, or any word starts with search
    const nameMatches =
      fullName.includes(search) ||
      firstName.includes(search) ||
      lastName.includes(search) ||
      fullName.split(/\s+/).some((v) => v.startsWith(search));

    // 2. Phone matching:
    // a. Direct string includes
    let phoneMatches = phone.includes(search);

    // b. Normalized digit matching (ignores spaces, dashes, parentheses, +country-code)
    if (!phoneMatches && searchDigits.length >= 3) {
      phoneMatches =
        phoneDigits.includes(searchDigits) ||
        searchDigits.includes(phoneDigits);

      // Match last 10 digits for common mobile numbers with country prefixes
      if (!phoneMatches && phoneDigits.length >= 10 && searchDigits.length >= 10) {
        phoneMatches = phoneDigits.slice(-10) === searchDigits.slice(-10);
      }
    }

    // 3. User username matching if userId object is present
    const username = `${item.userId?.username ?? ""}`.trim().toLowerCase();
    const usernameMatches = username.length > 0 && username.includes(search);

    return nameMatches || phoneMatches || usernameMatches;
  });
};
