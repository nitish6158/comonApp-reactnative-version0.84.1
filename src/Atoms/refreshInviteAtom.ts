import { atom } from "jotai";

let refreshOrganisationAtom = false;

export const refreshInvite = atom(refreshOrganisationAtom);
