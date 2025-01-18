import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveItem = async (item) => {
  try {
    const existingItems = await getItems();
    let newItems;

    if (item.id) {
      // Update existing item
      newItems = existingItems.map((existingItem) =>
        existingItem.id === item.id ? item : existingItem
      );
    } else {
      // Add new item with a unique ID
      const newItem = {
        ...item,
        id: Date.now().toString(), // Generate unique ID
      };
      newItems = [...existingItems, newItem];
    }

    await AsyncStorage.setItem("items", JSON.stringify(newItems));
    return newItems;
  } catch (error) {
    console.error("Error saving item:", error);
    throw error;
  }
};

export const saveBill = async (bill) => {
  try {
    const existingBills = await AsyncStorage.getItem("bills");
    const bills = existingBills ? JSON.parse(existingBills) : [];
    bills.push(bill);
    await AsyncStorage.setItem("bills", JSON.stringify(bills));
  } catch (error) {
    console.error("Error saving bill:", error);
  }
};

export const getItems = async () => {
  try {
    const items = await AsyncStorage.getItem("items");
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Error getting items:", error);
    return [];
  }
};

export const getBills = async () => {
  try {
    const bills = await AsyncStorage.getItem("bills");
    return bills ? JSON.parse(bills) : [];
  } catch (error) {
    console.error("Error getting bills:", error);
    return [];
  }
};

export const deleteBill = async (billId) => {
  try {
    const existingBills = await getBills();
    const updatedBills = existingBills.filter((bill) => bill.billId !== billId);
    await AsyncStorage.setItem("bills", JSON.stringify(updatedBills));
  } catch (error) {
    console.error("Error deleting bill:", error);
    throw error;
  }
};

export const updateItem = async (updatedItem) => {
  try {
    const existingItems = await getItems();
    const updatedItems = existingItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    const existingItems = await getItems();
    const updatedItems = existingItems.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem("items", JSON.stringify(updatedItems));
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};
