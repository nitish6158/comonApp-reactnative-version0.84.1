import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/Constants";
import SimpleDropdown from "@/Components/DropDown/SimpleDropdown";
import {
  navigate,
  navigateAndReplace,
  navigateBack,
  navigationRef,
} from "@/navigation/utility";
import {
  useCreateOrganizationMutation,
  useSendInvitesMutation,
} from "@/graphql/generated/organization.generated";
import { useGetMyComonContactQuery } from "@/graphql/generated/contact.generated";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentOrganization } from "@/redux/Reducer/OrganisationsReducer";
import { RootState } from "@/redux/Store";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

const roles = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "MEMBER", value: "MEMBER" },
];

const CreateOrganization = () => {
  // Step 1 state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [OrganizationCreate] = useCreateOrganizationMutation();
  const [SendInvite] = useSendInvitesMutation();
  const CommonContacts = useGetMyComonContactQuery();
  const [error, setError] = useState<string | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  var OrgData = useSelector(
    (state: RootState) => state.Organisation.currentOrganization,
  );
  const dispatch = useDispatch();
  // Step 2 state
  const [members, setMembers] = useState<
    {
      users: { localId: string; phone: string; email: string }[];
      role: string;
    }[]
  >([{ users: [], role: "" }]);

  // usersList: include localId, phone, and email (from userId if present)
  const usersList =
    CommonContacts.data?.getMyComonContact?.contacts?.map((c) => ({
      label:
        `${c.firstName ?? ""} ${c.lastName ?? ""}${
          c.phone ? ` (${c.phone})` : ""
        }`.trim() || c.localId,
      localId: c.localId,
      phone: c.phone,
      email:
        c.userId && typeof c.userId === "object" && "email" in c.userId
          ? c.userId.email
          : "",
    })) || [];

  // Step 1 submit
  const handleOrgSubmit = async () => {
    setResponseError(null);
    setError(null);
    if (!name.trim()) {
      setError("Please input your organization name!");
      return;
    } else {
      setLoading(true);
      const variables = {
        input: {
          name: name,
          link: name,
          description: description,
        },
      };
      OrganizationCreate({ variables })
        .then((response: any) => {
          if (response.data?.createOrganization) {
            OrgData = response.data.createOrganization;
            console.log(
              "Organization created:",
              JSON.stringify(OrgData, null, 2),
            );
            dispatch(setCurrentOrganization(response.data.createOrganization));
            setStep(2);
          }
        })
        .catch((error: any) => {
          console.error(
            "Error creating organization:",
            JSON.stringify(error, null, 2),
          );
          setResponseError(error?.message);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
  };

  // Step 2 submit
  const handleMembersSubmit = async () => {
    if (members.length === 0 || members.every((m) => m.users.length === 0)) {
      navigate("CreateTask", { organizationId: OrgData?._id });
      return;
    }
    if (!OrgData?._id) {
      setResponseError(
        "Organization not created yet. Please create an organization first.",
      );
    }
    if (
      members.length > 0 &&
      members.map((m) => m.role).every((r) => r == "")
    ) {
      setError("Please select roles for members!");
      return;
    }
    // setLoading(true);
    // Simulate API/GraphQL call
    SendInvite({
      variables: {
        input: {
          organizationId: OrgData?._id,
          invites: members.flatMap((m) =>
            (Array.isArray(m.users) ? m.users : []).map((user) => ({
              phone: user.phone,
              email: user.email,
              role: m.role,
            })),
          ),
          masterOrg: OrgData?._id,
        },
      },
    })
      .then((response: any) => {
        if (response.data?.sendInvites) {
          console.log(
            "Members invited:",
            JSON.stringify(response.data.sendInvites, null, 2),
          );
          navigate("CreateTask", { organizationId: OrgData?._id }); // Replace with your route
        }
      })
      .catch((error: any) => {
        console.error(
          "Error inviting members:",
          JSON.stringify(error, null, 2),
        );
        setResponseError(error?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addMemberRow = () => {
    setMembers((prev) => [...prev, { users: [], role: "" }]);
  };

  const updateMember = (idx: number, field: "users" | "role", value: any) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {navigationRef && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step == 1 ? navigateBack() : setStep(1))}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#007bff" />
        </TouchableOpacity>
      )}
      <Text style={styles.header}>Create Organization</Text>
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.label}>
            Name <Text style={styles.error}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Organization Name"
            maxLength={100}
            returnKeyType="done"
            onFocus={() => setError(null)}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleOrgSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? <ActivityIndicator /> : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.label}>Add Members</Text>
          {members.map((member, idx) => {
            // Get all selected users except for this row
            const selectedUsersOtherRows = members
              .filter((_, i) => i !== idx)
              .flatMap((m) => m.users.map((u) => u.localId));
            // Filter usersList for this dropdown
            const availableUsers = usersList.filter(
              (u) =>
                !selectedUsersOtherRows.includes(u.localId) ||
                (Array.isArray(member.users) &&
                  member.users.some((sel) => sel.localId === u.localId)),
            );
            return (
              <View
                key={idx}
                style={[
                  styles.memberRow,
                  {
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 16,
                    position: "relative",
                    backgroundColor: "transparent",
                  },
                ]}
              >
                <View style={{ width: "100%" }}>
                  <Text style={styles.memberLabel}>Select Users</Text>
                  <SimpleDropdown
                    options={availableUsers.map((u) => ({
                      label: u.label,
                      value: u.localId,
                    }))}
                    value={member.users.map((u) => u.localId)}
                    onChange={(val: string[]) => {
                      // Map selected localIds to user objects
                      const selectedUsers = usersList
                        .filter((u) => val.includes(u.localId))
                        .map((u) => ({
                          localId: u.localId,
                          phone: u.phone,
                          email: u.email,
                        }));
                      updateMember(idx, "users", selectedUsers);
                    }}
                    placeholder={
                      availableUsers.length === 0
                        ? "No users available"
                        : "Select users..."
                    }
                    multiple
                    disabled={availableUsers.length === 0}
                  />
                </View>
                <View style={{ width: "100%", marginTop: 8 }}>
                  <Text style={styles.memberLabel}>Role</Text>
                  <SimpleDropdown
                    options={roles}
                    value={member.role}
                    onChange={(val: string) => updateMember(idx, "role", val)}
                    placeholder="Select role..."
                  />
                </View>
                {members.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeMemberBtn}
                    onPress={() =>
                      setMembers(members.filter((_, i) => i !== idx))
                    }
                  >
                    <Text style={styles.removeMemberText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          <TouchableOpacity style={styles.addMemberBtn} onPress={addMemberRow}>
            <Text style={styles.addMemberText}>+ Add More Members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleMembersSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Submitting..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {responseError && <Text style={styles.error}>{responseError}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: Colors.light.backgroundActive,
    minHeight: "100%",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    color: "#222",
    alignSelf: "center",
  },
  card: {
    backgroundColor: Colors.light.White,
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.light.text,
  },
  error: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.light.red,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: -10,
    marginBottom: 15,
    color: Colors.light.red,
  },
  input: {
    backgroundColor: Colors.light.backgroundGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.formItemBorder,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: Colors.light.White,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  memberRow: {
    alignItems: "flex-start",
    marginBottom: 0,
  },
  memberTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 6,
    color: Colors.light.PrimaryColor,
  },
  memberLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    color: "#444",
  },
  addMemberBtn: {
    backgroundColor: "#e9ecef",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  addMemberText: {
    color: "#007bff",
    fontWeight: "600",
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    marginBottom: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
  removeMemberBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ff4d4d",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  removeMemberText: {
    color: Colors.light.White,
    fontWeight: "bold",
    fontSize: 13,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    padding: 6,
    marginTop: 4,
    marginLeft: 0,
  },
  backBtnText: {
    color: Colors.light.black,
    fontWeight: "600",
    fontSize: 18,
  },
});

export default CreateOrganization;
