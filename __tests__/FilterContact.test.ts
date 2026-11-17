import { filterInObject } from "../src/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/FilterContact";

describe("filterInObject contact search", () => {
  const sampleContacts: any[] = [
    {
      firstName: "Nitish",
      lastName: "Panwar",
      phone: "+919039404577",
      localId: "1_0",
      hasComon: true,
      userId: { _id: "u1", username: "nitishp" },
    },
    {
      firstName: "Rahul",
      lastName: "Sharma",
      phone: "+91 98765 43210",
      localId: "2_0",
      hasComon: false,
      userId: { _id: "u2", username: "rahul99" },
    },
    {
      firstName: "aman",
      lastName: "verma",
      phone: "08888888888",
      localId: "3_0",
      hasComon: true,
    },
    {
      firstName: "",
      lastName: "",
      phone: "9123456789",
      localId: "4_0",
      hasComon: false,
    },
  ];

  it("returns all data if searchText is empty", () => {
    const result = filterInObject({ searchText: "", data: sampleContacts });
    expect(result).toHaveLength(4);
  });

  it("matches phone number by clean digits even with country code difference", () => {
    // User types 10-digit number without +91
    const result = filterInObject({ searchText: "9039404577", data: sampleContacts });
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe("Nitish");
  });

  it("matches phone number when user inputs spaces or dashes", () => {
    const result = filterInObject({ searchText: "90394 04577", data: sampleContacts });
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe("Nitish");
  });

  it("matches phone number when stored with spaces and user types continuous digits", () => {
    const result = filterInObject({ searchText: "9876543210", data: sampleContacts });
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe("Rahul");
  });

  it("matches full name case-insensitively", () => {
    const result = filterInObject({ searchText: "Nitish Panwar", data: sampleContacts });
    expect(result).toHaveLength(1);
    expect(result[0].phone).toBe("+919039404577");
  });

  it("matches partial first or last name case-insensitively", () => {
    const byFirst = filterInObject({ searchText: "panw", data: sampleContacts });
    expect(byFirst).toHaveLength(1);
    expect(byFirst[0].firstName).toBe("Nitish");

    const byLower = filterInObject({ searchText: "AMAN", data: sampleContacts });
    expect(byLower).toHaveLength(1);
    expect(byLower[0].lastName).toBe("verma");
  });

  it("matches by username in userId object", () => {
    const result = filterInObject({ searchText: "rahul99", data: sampleContacts });
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe("Rahul");
  });

  it("handles null or undefined data safely", () => {
    expect(filterInObject({ searchText: "abc", data: null as any })).toEqual([]);
    expect(filterInObject({ searchText: "abc", data: [null as any] })).toEqual([]);
  });
});
