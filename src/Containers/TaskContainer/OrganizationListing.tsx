import { Colors } from "@/Constants";
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;
// Dummy data, replace with your API/Redux/GraphQL data
const organizations = [
  { id: "1", name: "Acme Corp", description: "A global leader in widgets." },
  { id: "2", name: "Beta Group", description: "Innovating the future." },
  { id: "3", name: "Gamma LLC", description: "Excellence in service." },
];

const OrganizationListing = ({ navigation }: { navigation?: any }) => {
  const handlePress = (org: {
    id: string;
    name: string;
    description: string;
  }) => {
    // Replace with your navigation logic
    if (navigation) navigation.navigate("CreateTask", {});
    else Alert.alert(`Navigate to details for: ${org.name}`);
  };

  const renderItem = ({ item }: { item: (typeof organizations)[0] }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <Text style={styles.orgName}>{item.name}</Text>
      <Text style={styles.orgDesc}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {navigation && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#007bff" />
        </TouchableOpacity>
      )}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Organizations</Text>
        <TouchableOpacity
          style={styles.addOrgBtn}
          onPress={() =>
            navigation && navigation.navigate("CreateOrganization")
          }
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={28}
            color="#007bff"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={organizations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No organizations found.</Text>
        }
        contentContainerStyle={
          organizations.length === 0
            ? { flex: 1, justifyContent: "center" }
            : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundActive,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 30,
    position: "relative",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    flex: 1,
  },
  card: {
    backgroundColor: Colors.light.White,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  orgName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007bff",
    marginBottom: 6,
  },
  orgDesc: {
    fontSize: 15,
    color: "#444",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: '#e9ecef',
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
  addOrgBtn: {
    backgroundColor: "#e9ecef",
    borderRadius: 20,
    padding: 6,
    marginLeft: 10,
  },
});

export default OrganizationListing;
