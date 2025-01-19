import React from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { saveBill } from "../utils/database";
import PDFService from "../services/pdfGenerator";
const BillScreen = ({ route, navigation }) => {
  const { items } = route.params;

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePrint = async () => {
    try {
      const billData = {
        items: items,
        total: calculateTotal(),
        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      await saveBill(billData);
      await PDFService.generateBillPDF(billData);
      Alert.alert("Success", "Bill PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView style={styles.billContainer}>
        <View style={styles.billHeader}>
          <Text style={styles.storeName}>Your Store Name</Text>
          <Text style={styles.billDate}>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.itemsContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.itemCol]}>Item</Text>
            <Text style={[styles.headerText, styles.qtyCol]}>Qty</Text>
            <Text style={[styles.headerText, styles.priceCol]}>Price</Text>
            <Text style={[styles.headerText, styles.totalCol]}>Total</Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.itemText, styles.itemCol]}>{item.name}</Text>
              <Text style={[styles.itemText, styles.qtyCol]}>
                {item.quantity}
              </Text>
              <Text style={[styles.itemText, styles.priceCol]}>
                ₹{item.price.toFixed(2)}
              </Text>
              <Text style={[styles.itemText, styles.totalCol]}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>₹{calculateTotal().toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={handlePrint}
        >
          <Ionicons name="print" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Print Bill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  billContainer: {
    flex: 1,
    padding: 16,
  },
  billHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  billDate: {
    fontSize: 14,
    color: "#666",
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  headerText: {
    fontWeight: "bold",
    color: "#666",
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemText: {
    color: "#333",
  },
  itemCol: {
    flex: 2,
  },
  qtyCol: {
    flex: 1,
    textAlign: "center",
  },
  priceCol: {
    flex: 1,
    textAlign: "right",
  },
  totalCol: {
    flex: 1,
    textAlign: "right",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
  },
  actions: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  printButton: {
    backgroundColor: "#4CAF50",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default BillScreen;
