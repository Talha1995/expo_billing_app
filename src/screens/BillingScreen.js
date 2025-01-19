import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { generateBillPDF } from "../services/pdfGenerator";
import { saveBill } from "../utils/database";

const BillingScreen = ({ route, navigation }) => {
  const selectedItems = route.params?.selectedItems || [];
  const [customerName, setCustomerName] = useState("");

  const calculateTotal = () => {
    return selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const generateBill = async () => {
    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter customer name");
      return;
    }

    const billData = {
      customerName,
      items: selectedItems,
      total: calculateTotal(),
      date: new Date(),
      billId: Date.now().toString(),
    };

    try {
      const pdfPath = await generateBillPDF(billData);
      await saveBill(billData);
      Alert.alert("Success", "Bill generated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to generate bill");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
      <Text style={styles.itemPrice}>Rs. {item.price * item.quantity}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
      />

      <View style={styles.itemsContainer}>
        <Text style={styles.sectionTitle}>Selected Items</Text>
        <FlatList
          data={selectedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>
          Rs. {calculateTotal().toFixed(2)}
        </Text>
      </View>

      <Button title="Generate Bill" onPress={generateBill} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemName: {
    flex: 2,
    fontSize: 16,
  },
  itemQuantity: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
  },
  itemPrice: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#ddd",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196f3",
  },
});

export default BillingScreen;
