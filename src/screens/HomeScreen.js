import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { getItems, saveItem, deleteItem } from "../utils/database";
import { Ionicons } from "@expo/vector-icons";

const ItemCard = memo(({ item, isSelected, onPress, onLongPress }) => (
  <TouchableOpacity
    style={[styles.itemCard, isSelected && styles.selectedItem]}
    onPress={onPress}
    onLongPress={onLongPress}
    delayLongPress={500}
    activeOpacity={0.7}
  >
    <View style={styles.cardContent}>
      <View style={styles.cardDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>Rs. {item.price.toFixed(2)}</Text>
      </View>
      {isSelected && (
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>{isSelected.quantity}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
));

const ManageItemCard = memo(
  ({ item, onEdit, onDelete, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.manageItemCard, isSelected && styles.selectedManageItem]}
      onPress={() => onSelect(item)}
    >
      <View style={styles.manageItemInfo}>
        <View style={styles.manageItemHeader}>
          <TouchableOpacity
            style={styles.checkBox}
            onPress={() => onSelect(item)}
          >
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
            )}
            {!isSelected && (
              <Ionicons name="ellipse-outline" size={24} color="#666" />
            )}
          </TouchableOpacity>
          <View style={styles.manageItemDetails}>
            <Text style={styles.manageItemName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.manageItemPrice}>
              Rs. {item.price.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.manageItemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(item)}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
);

const EditItemModal = memo(({ visible, item, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setPrice(item.price ? String(item.price) : "");
    } else {
      setName("");
      setPrice("");
    }
  }, [item]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter item name");
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    try {
      setLoading(true);
      await onSave({
        id: item?.id,
        name: name.trim(),
        price: priceValue,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              {item?.id ? "Edit Item" : "Add New Item"}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Item Name"
              placeholderTextColor="#999"
              editable={!loading}
            />

            <TextInput
              style={styles.modalInput}
              value={price}
              onChangeText={setPrice}
              placeholder="Price"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
              editable={!loading}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>
                    {item?.id ? "Update" : "Add"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const QuantityEditModal = memo(
  ({ visible, item, currentQuantity = 1, onClose, onSave }) => {
    const [quantity, setQuantity] = useState(String(currentQuantity));

    useEffect(() => {
      setQuantity(String(currentQuantity));
    }, [currentQuantity]);

    const handleIncrement = () => {
      const current = parseInt(quantity) || 0;
      if (current < 100) {
        setQuantity(String(current + 1));
      }
    };

    const handleDecrement = () => {
      const current = parseInt(quantity) || 0;
      if (current > 1) {
        setQuantity(String(current - 1));
      }
    };

    const handleSave = () => {
      const quantityNum = parseInt(quantity) || 0;
      if (quantityNum > 0 && quantityNum <= 100) {
        onSave(quantityNum);
      } else {
        Alert.alert(
          "Invalid Quantity",
          "Please enter a quantity between 1 and 100"
        );
      }
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Select Quantity</Text>
              <Text style={styles.itemName}>{item?.name}</Text>
              <Text style={styles.itemPrice}>Rs. {item?.price.toFixed(2)}</Text>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    parseInt(quantity) <= 1 && styles.disabledButton,
                  ]}
                  onPress={handleDecrement}
                  disabled={parseInt(quantity) <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text)) {
                      const num = parseInt(text) || 0;
                      if (num <= 100) {
                        setQuantity(text);
                      }
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    parseInt(quantity) >= 100 && styles.disabledButton,
                  ]}
                  onPress={handleIncrement}
                  disabled={parseInt(quantity) >= 100}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.modalButtonText}>Add to Bill</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
);

const HomeScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [editModalItem, setEditModalItem] = useState(null);
  const [quantityModalItem, setQuantityModalItem] = useState(null);
  const [activeTab, setActiveTab] = useState("items");
  const [loading, setLoading] = useState(true);
  const [selectedManageItems, setSelectedManageItems] = useState({});

  useEffect(() => {
    loadItems();
    const unsubscribe = navigation.addListener("focus", () => {
      loadItems();
    });
    return unsubscribe;
  }, [navigation]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const loadedItems = await getItems();
      setItems(loadedItems);
    } catch (error) {
      console.error("Error loading items:", error);
      Alert.alert("Error", "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = useCallback((item) => {
    // Toggle selection on single press
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      if (newSelected[item.id]) {
        delete newSelected[item.id];
      } else {
        newSelected[item.id] = { ...item, quantity: 1 };
      }
      return newSelected;
    });
  }, []);

  const handleItemLongPress = useCallback((item) => {
    // Show quantity modal on long press
    setQuantityModalItem(item);
  }, []);

  const handleSaveQuantity = useCallback(
    (newQuantity) => {
      if (quantityModalItem) {
        setSelectedItems((prev) => ({
          ...prev,
          [quantityModalItem.id]: {
            ...quantityModalItem,
            quantity: newQuantity,
          },
        }));
        setQuantityModalItem(null);
      }
    },
    [quantityModalItem]
  );

  const handleEditItem = useCallback((item) => {
    setEditModalItem(item);
  }, []);

  const handleSaveItem = useCallback(async (updatedItem) => {
    try {
      await saveItem(updatedItem);
      await loadItems();
      setEditModalItem(null);
      Alert.alert(
        "Success",
        updatedItem.id ? "Item updated successfully" : "Item added successfully"
      );
    } catch (error) {
      console.error("Error saving item:", error);
      Alert.alert("Error", "Failed to save item");
    }
  }, []);

  const handleDeleteItem = useCallback(async (item) => {
    try {
      await deleteItem(item.id);
      await loadItems();
      Alert.alert("Success", "Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  }, []);

  const handleGenerateBill = useCallback(() => {
    try {
      const selectedItemsList = Object.values(selectedItems);
      if (selectedItemsList.length === 0) {
        Alert.alert("Error", "Please select items first");
        return;
      }

      navigation.navigate("Bill", {
        items: selectedItemsList.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
      });
    } catch (error) {
      console.error("Error generating bill:", error);
      Alert.alert("Error", "Failed to generate bill");
    }
  }, [selectedItems, navigation]);

  const handleSelectManageItem = useCallback((item) => {
    setSelectedManageItems((prev) => ({
      ...prev,
      [item.id]: !prev[item.id],
    }));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const selectedIds = Object.keys(selectedManageItems).filter(
      (id) => selectedManageItems[id]
    );
    if (selectedIds.length === 0) {
      Alert.alert("Error", "Please select items to delete");
      return;
    }

    Alert.alert(
      "Delete Selected Items",
      `Are you sure you want to delete ${selectedIds.length} selected items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const id of selectedIds) {
                await deleteItem(id);
              }
              setSelectedManageItems({});
              await loadItems();
              Alert.alert("Success", "Selected items deleted successfully");
            } catch (error) {
              console.error("Error deleting items:", error);
              Alert.alert("Error", "Failed to delete selected items");
            }
          },
        },
      ]
    );
  }, [selectedManageItems, loadItems]);

  const renderItemsTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      );
    }

    return (
      <View style={styles.itemsContainer}>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              isSelected={selectedItems[item.id]}
              onPress={() => handleItemPress(item)}
              onLongPress={() => handleItemLongPress(item)}
            />
          )}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.itemsGrid}
          columnWrapperStyle={styles.itemRow}
          showsVerticalScrollIndicator={false}
        />

        {Object.keys(selectedItems).length > 0 && (
          <TouchableOpacity
            style={styles.generateBillButton}
            onPress={handleGenerateBill}
          >
            <View style={styles.billSummary}>
              <Text style={styles.selectedItemsCount}>
                {Object.keys(selectedItems).length} items selected
              </Text>
              <Text style={styles.totalAmount}>
                Total: Rs. {calculateTotal().toFixed(2)}
              </Text>
            </View>
            <View style={styles.generateBillAction}>
              <Ionicons name="receipt-outline" size={24} color="#fff" />
              <Text style={styles.generateBillText}>Generate Bill</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const calculateTotal = useCallback(() => {
    return Object.values(selectedItems).reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [selectedItems]);

  const renderManageTab = () => (
    <View style={styles.managementContainer}>
      <View style={styles.manageHeader}>
        <Text style={styles.manageTitle}>Manage Items</Text>
        <View style={styles.manageActions}>
          {Object.keys(selectedManageItems).some(
            (id) => selectedManageItems[id]
          ) && (
            <TouchableOpacity
              style={styles.deleteSelectedButton}
              onPress={handleDeleteSelected}
            >
              <Ionicons name="trash" size={20} color="#FF5252" />
              {/* <Text style={styles.deleteSelectedText}>Delete Selected</Text> */}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => handleEditItem({})}
          >
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            {/* <Text style={styles.addNewButtonText}>Add Item</Text> */}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <ManageItemCard
            item={item}
            onEdit={handleEditItem}
            onDelete={(item) => {
              Alert.alert(
                "Delete Item",
                `Are you sure you want to delete "${item.name}"?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteItem(item.id);
                        await loadItems();
                        Alert.alert("Success", "Item deleted successfully");
                      } catch (error) {
                        console.error("Error deleting item:", error);
                        Alert.alert("Error", "Failed to delete item");
                      }
                    },
                  },
                ]
              );
            }}
            isSelected={selectedManageItems[item.id]}
            onSelect={handleSelectManageItem}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.managementList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "items" && styles.activeTab]}
          onPress={() => setActiveTab("items")}
        >
          <Ionicons
            name={activeTab === "items" ? "grid" : "grid-outline"}
            size={24}
            color={activeTab === "items" ? "#2196F3" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "items" && styles.activeTabText,
            ]}
          >
            Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "manage" && styles.activeTab]}
          onPress={() => setActiveTab("manage")}
        >
          <Ionicons
            name={activeTab === "manage" ? "settings" : "settings-outline"}
            size={24}
            color={activeTab === "manage" ? "#2196F3" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "manage" && styles.activeTabText,
            ]}
          >
            Manage
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "items" ? renderItemsTab() : renderManageTab()}

      <QuantityEditModal
        visible={!!quantityModalItem}
        item={quantityModalItem}
        currentQuantity={
          quantityModalItem
            ? selectedItems[quantityModalItem.id]?.quantity || 1
            : 1
        }
        onClose={() => setQuantityModalItem(null)}
        onSave={handleSaveQuantity}
      />

      <EditItemModal
        visible={!!editModalItem}
        item={editModalItem}
        onClose={() => setEditModalItem(null)}
        onSave={handleSaveItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2196F3",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  tabContent: {
    flex: 1,
  },
  listContainer: {
    padding: 8,
    paddingBottom: 80,
  },
  manageListContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    width: (Dimensions.get("window").width - 32) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    position: "relative",
  },
  cardImagePlaceholder: {
    height: 120,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  cardDetails: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "bold",
  },
  selectedItem: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
    borderWidth: 1,
  },
  quantityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#2196F3",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  quantityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  generateBillButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  billSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    paddingHorizontal: 16,
  },
  selectedItemsCount: {
    color: "#fff",
    fontSize: 14,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  generateBillAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  generateBillText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  manageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  manageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  addNewButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  manageItemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  manageItemInfo: {
    marginBottom: 12,
  },
  manageItemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  manageItemPrice: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "bold",
  },
  manageItemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#FF5252",
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF5252",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: "#2196F3",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    width: 80,
    textAlign: "center",
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  itemsContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  itemsGrid: {
    padding: 8,
    paddingBottom: 100,
  },
  itemRow: {
    justifyContent: "space-between",
  },
  selectedManageItem: {
    backgroundColor: "#E3F2FD",
  },
  checkBox: {
    marginRight: 12,
  },
  manageItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  manageItemDetails: {
    flex: 1,
  },
  manageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteSelectedButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  deleteSelectedText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#FF5252",
    fontWeight: "bold",
  },
  deselectHint: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
});

export default HomeScreen;
