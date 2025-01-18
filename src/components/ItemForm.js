import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

const ItemForm = ({ onSubmit, initialData }) => {
  const [itemName, setItemName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || "");

  const handleSubmit = () => {
    onSubmit({
      name: itemName,
      price: parseFloat(price),
      id: initialData?.id || Date.now().toString(),
    });
    setItemName("");
    setPrice("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Button
        title={initialData ? "Update Item" : "Add Item"}
        onPress={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
});

export default ItemForm;
