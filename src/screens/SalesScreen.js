import React, { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import PDFService from "../services/pdfGenerator";
import { getBills } from "../utils/database";

const SalesScreen = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState(null); // 'from' or 'to'
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(),
    toDate: new Date(),
  });

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [])
  );

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesData = await getBills();
      setSales(salesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Error loading sales:", error);
      Alert.alert("Error", "Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const showDatePicker = (type) => {
    setSelectedDateType(type);
    setDatePickerVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setDatePickerVisible(false);
    }
    if (selectedDate) {
      setDateRange((prev) => ({
        ...prev,
        [selectedDateType === "from" ? "fromDate" : "toDate"]: selectedDate,
      }));
    }
  };

  const handleGenerateReport = async () => {
    try {
      const { fromDate, toDate } = dateRange;

      if (fromDate > toDate) {
        Alert.alert("Invalid Date Range", "From date cannot be after to date");
        return;
      }

      const filteredSales = sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.setHours(0, 0, 0, 0) >= fromDate.setHours(0, 0, 0, 0) &&
          saleDate.setHours(0, 0, 0, 0) <= toDate.setHours(0, 0, 0, 0)
        );
      });

      if (filteredSales.length === 0) {
        Alert.alert("No Data", "No sales found for selected date range");
        return;
      }

      const reportData = {
        sales: filteredSales,
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        totalAmount: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      };

      await PDFService.generateSalesReport(reportData);
      Alert.alert("Success", "Sales report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      Alert.alert("Error", "Failed to generate sales report");
    }
  };
  console.log(sales);

  const renderSaleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.saleCard}
      onPress={() => {
        // Handle individual sale press if needed
      }}
    >
      <View style={styles.saleHeader}>
        <View style={styles.saleInfo}>
          <Text style={styles.saleId}>Bill #{item.billId}</Text>
          <Text style={styles.saleDate}>
            {new Date(item.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text style={styles.saleAmount}>Rs. {item.total.toFixed(2)}</Text>
      </View>

      <View style={styles.saleItems}>
        {item.items.map((saleItem, index) => (
          <View key={saleItem.id} style={styles.saleItemRow}>
            <Text style={styles.saleItemName} numberOfLines={1}>
              {saleItem.name}
            </Text>
            <Text style={styles.saleItemQuantity}>x{saleItem.quantity}</Text>
            <Text style={styles.saleItemPrice}>
              Rs. {(saleItem.price * saleItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showDatePicker("from")}
          >
            <Ionicons name="calendar-outline" size={20} color="#2196F3" />
            <Text style={styles.dateButtonText}>
              {dateRange.fromDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateRangeSeparator}>to</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showDatePicker("to")}
          >
            <Ionicons name="calendar-outline" size={20} color="#2196F3" />
            <Text style={styles.dateButtonText}>
              {dateRange.toDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateReport}
        >
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.generateButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.salesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#666" />
            <Text style={styles.emptyStateText}>No sales data available</Text>
          </View>
        }
      />

      <Modal
        visible={datePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDatePickerVisible(false)}
        >
          {/* <View style={styles.modalContent}> */}
          {/* <View style={styles.datePickerHeader}> */}
          {/* <Text style={styles.datePickerTitle}>
                Select {selectedDateType === "from" ? "Start" : "End"} Date
              </Text> */}
          {/* <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View> */}
          <DateTimePicker
            value={
              selectedDateType === "from"
                ? dateRange.fromDate
                : dateRange.toDate
            }
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            style={styles.datePicker}
          />
          {/* </View> */}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flex: 1,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#333",
  },
  dateRangeSeparator: {
    marginHorizontal: 8,
    color: "#666",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  salesList: {
    padding: 16,
  },
  saleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  saleInfo: {
    flex: 1,
  },
  saleId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 14,
    color: "#666",
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  saleItems: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  saleItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  saleItemName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  saleItemQuantity: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 8,
  },
  saleItemPrice: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 16,
    width: "90%",
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  datePicker: {
    width: "100%",
    backgroundColor: "#fff",
  },
});

export default SalesScreen;
