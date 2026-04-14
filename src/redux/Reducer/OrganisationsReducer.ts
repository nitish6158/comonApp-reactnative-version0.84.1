import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Assignment, Organization, Report } from "@Service/generated/types";
import { GetMyInvitesQuery, OrganizationsQuery } from "@Service/generated/organization.generated";
import { createStorage } from "@/utils/mmkvStorage";

interface OrganisationState {
  currentOrganization: Organization;
  organizations: OrganizationsQuery["organizations"];
  invites: GetMyInvitesQuery["getMyInvites"];
  assignments: Assignment[];
  currentReport: Report;
  currentAssignment: Assignment;
}

const initialState: OrganisationState = {
  currentOrganization: {} as Organization,
  organizations: [],
  invites: [],
  assignments: [],
  currentReport: {} as Report,
  currentAssignment: {} as Assignment,
};

const organisationSlice = createSlice({
  name: "organisation",
  initialState,
  reducers: {
    setAllOrganisations(state, action: PayloadAction<OrganizationsQuery["organizations"]>) {
      state.organizations = action.payload;
    },
    setCurrentOrganization(state, action: PayloadAction<Organization>) {
      state.currentOrganization = action.payload;
    },

    setCurrentReport(state, action: PayloadAction<Report>) {
      state.currentReport = action.payload;
    },

    setAssignments(state, action: PayloadAction<Assignment[]>) {
      state.assignments = action.payload;
    },

    deleteAssignment(state, action: PayloadAction<string>) {
      state.assignments = state.assignments.filter((item) => item._id !== action.payload);
    },
    setOrganisationInvites(state, action: PayloadAction<GetMyInvitesQuery["getMyInvites"]>) {
      state.invites = action.payload;
    },
    addOrganisationInvite(state, action) {
      state.invites.unshift(action.payload);
    },
    resetOrganisationState(state) {
      return initialState;
    },
  },
});

export const {
  setAllOrganisations,
  setCurrentOrganization,
  setCurrentReport,
  setAssignments,
  deleteAssignment,
  setOrganisationInvites,
  addOrganisationInvite,
  resetOrganisationState,
} = organisationSlice.actions;
export default organisationSlice.reducer;


export const organisationStorage = createStorage() 

export const organisationPersister = {
  setItem: (key:string, value:string) => {
    organisationStorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key:string) => {
    const value = organisationStorage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key:string) => {
    organisationStorage.delete(key);
    return Promise.resolve();
  },
};

