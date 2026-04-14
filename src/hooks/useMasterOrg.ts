// import { useUser } from "@realm/react";

// export default function useMasterOrg() {
//   const user = useUser();

//   async function getMasterOrg(id: string) {
//     let org = await user?.callFunction("getOrganization", id);
//     if (org) {
//       let orgs = JSON.parse(org.result);
//       return orgs.masterOrg ?? id;
//     } else {
//       return id;
//     }
//   }

//   return {
//     getMasterOrg,
//   };
// }
// TEMPORARY FILE
// Realm removed - Safe fallback version
// TODO: Replace with API when backend is ready

export default function useMasterOrg() {

  async function getMasterOrg(id: string): Promise<string> {
    try {
      // ✅ Direct return (no Realm / no server call)
      return id;
    } catch (error) {
      console.log("getMasterOrg error:", error);

      // Fallback
      return id;
    }
  }

  return {
    getMasterOrg,
  };
}
