
import {
  OrganizationsDocument,
  OrganizationsQuery,
  useOrganizationLazyQuery,
  useOrganizationsLazyQuery,
} from "@Service/generated/organization.generated";
import { removeCurrentOrganization, setCurrentOrganization as AsyncCurrentOrganisation } from "@Util/session";
import { useDispatch, useSelector } from "react-redux";

import { Organization } from "@Service/generated/types";
import { RootState } from "@Store/Reducer";
import { client } from "@Service/provider/authLink";
import { setAllOrganisations, setCurrentOrganization } from "@/redux/Reducer/OrganisationsReducer";

export const useOrganizations = () => {
  const AllOrganisationData = useSelector((state: RootState) => state.Organisation.organizations);
  const currentOrganisation = useSelector((state: RootState) => state.Organisation.currentOrganization);

  const dispatch = useDispatch();
  const [getAllOrganisationRequest, AllOrganisationResponse] = useOrganizationsLazyQuery();
  const [getOrganization, { loading }] = useOrganizationLazyQuery({
    fetchPolicy: "no-cache",
    canonizeResults: false,
  });

  // const setInitialOrg = () => {
  //   if (!currentOrganization && AllOrganisationData?.length) {
  //     getCurrentOrganization()
  //       .then((value) => {
  //         if (value?._id) {
  //           onSwitchOrganization(value?._id);
  //         } else {
  //           onSwitchOrganization(AllOrganisationData[0]._id);
  //         }
  //       })
  //       .catch(() => {
  //         onSwitchOrganization(AllOrganisationData[0]._id);
  //       });
  //   }
  // };
  const FetchAllOrganisation = () => {
    return new Promise((resolve, reject) => {
      getAllOrganisationRequest()
        .then((res) => {
          if (res.error) return reject(res.error);
          if (res.data?.organizations.length === AllOrganisationData?.length) {
            AllOrganisationResponse.refetch()
              .then((response) => {
                console.log("response", response.data.organizations.length);
                dispatch(setAllOrganisations(response.data?.organizations));
                return resolve(true);
              })
              .catch((Err) => {
                console.log("Error in refeching all organisation", Err);
                return reject(Err);
              });
          } else {
            dispatch(setAllOrganisations(res.data?.organizations));
            return resolve(true);
          }
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };
  const onSwitchOrganization = async (_id: string, orgData?: OrganizationsQuery["organizations"]) => {
    const org = orgData ? orgData : AllOrganisationData;
    const current: Organization | undefined = org?.find((organization) => organization._id === _id);
    console.log("onSwitchOrganization", _id);
    return new Promise<string>(async (resolve, reject) => {
      try {
        if (current) {
          await AsyncCurrentOrganisation({ _id: _id!, link: current?.link! });
          const res = await getOrganization({
            variables: {
              input: {
                _id: _id,
              },
            },
          });
          dispatch(setCurrentOrganization(current));
          return resolve(_id);
        }
        return reject("Custom error");
      } catch (error) {
        return reject(error);
      }
    });
  };

  const removeOrganization = (id: string) => {
    removeCurrentOrganization();
    client.writeQuery({
      query: OrganizationsDocument,
      data: { organizations: AllOrganisationData?.filter((organization) => organization._id !== id) },
    });
  };

  const organizationByContext = AllOrganisationData?.find(
    (organization) => organization.link === currentOrganisation?.link
  );
  const currentOrganization = AllOrganisationData?.find(
    (organization) => organization._id === organizationByContext?._id
  );


  const role = null;

  return {
    currentOrganization,
    FetchAllOrganisation,
    organizationByContext,
    removeOrganization: removeOrganization,
    switchOrganization: onSwitchOrganization,
    role,
    loading: loading,
  };
};
