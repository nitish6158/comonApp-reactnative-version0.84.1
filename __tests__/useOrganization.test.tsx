import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

const mockDispatch = jest.fn();
const mockGetAllOrgs = jest.fn();
const mockRefetchAllOrgs = jest.fn();
const mockGetOrg = jest.fn();
const mockWriteQuery = jest.fn();
const mockSetCurrentOrgSession = jest.fn(async (..._args: any[]) => {});
const mockRemoveCurrentOrg = jest.fn();

const mockOrgList = [
  { _id: "org1", name: "Acme", link: "acme-link" },
  { _id: "org2", name: "Beta", link: "beta-link" },
];

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) =>
    selector({
      Organisation: {
        organizations: mockOrgList,
        currentOrganization: mockOrgList[0],
      },
    }),
}));
jest.mock("@Service/generated/organization.generated", () => ({
  OrganizationsDocument: "OrganizationsDocument",
  useOrganizationsLazyQuery: () => [
    mockGetAllOrgs,
    { refetch: mockRefetchAllOrgs },
  ],
  useOrganizationLazyQuery: () => [mockGetOrg, { loading: false }],
}));
jest.mock("@Util/session", () => ({
  setCurrentOrganization: (...args: any[]) => mockSetCurrentOrgSession(...args),
  removeCurrentOrganization: () => mockRemoveCurrentOrg(),
}));
jest.mock("@Service/provider/authLink", () => ({
  client: { writeQuery: (...args: any[]) => mockWriteQuery(...args) },
}));
jest.mock("@/redux/Reducer/OrganisationsReducer", () => ({
  setAllOrganisations: (orgs: any) => ({ type: "setAll", payload: orgs }),
  setCurrentOrganization: (org: any) => ({ type: "setCur", payload: org }),
}));

import { useOrganizations } from "../src/hooks/useOrganization";

describe("useOrganizations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches, switches, removes organizations, and throws when org is missing", async () => {
    let api!: ReturnType<typeof useOrganizations>;
    function Probe() {
      api = useOrganizations();
      return null;
    }

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<Probe />);
    });

    expect(api.currentOrganization?._id).toBe("org1");

    // 1. Fetch triggers refetch when length matches
    mockGetAllOrgs.mockResolvedValueOnce({ data: { organizations: mockOrgList } });
    mockRefetchAllOrgs.mockResolvedValueOnce({ data: { organizations: mockOrgList } });
    await expect(api.FetchAllOrganisation()).resolves.toBe(true);

    // 2. Fetch rejects when error field returned
    mockGetAllOrgs.mockResolvedValueOnce({ error: new Error("fetch failed") });
    await expect(api.FetchAllOrganisation()).rejects.toThrow("fetch failed");

    // 3. Switch missing org throws
    await expect(api.switchOrganization("missing")).rejects.toThrow("Organization not found");

    // 4. Switch valid org updates session & store
    mockGetOrg.mockResolvedValueOnce({});
    await expect(api.switchOrganization("org2")).resolves.toBe("org2");
    expect(mockSetCurrentOrgSession).toHaveBeenCalledWith({ _id: "org2", link: "beta-link" });

    // 5. Remove organization writes filtered list
    api.removeOrganization("org1");
    expect(mockRemoveCurrentOrg).toHaveBeenCalled();
    expect(mockWriteQuery).toHaveBeenCalled();

    act(() => tree.unmount());
  });
});
