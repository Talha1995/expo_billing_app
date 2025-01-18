import React from "react";
import { View, StyleSheet } from "react-native";
import ItemForm from "../components/ItemForm";
import { saveItem } from "../utils/database";

const AddItemScreen = ({ navigation }) => {
  const handleSubmit = async (item) => {
    await saveItem(item);
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <ItemForm onSubmit={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default AddItemScreen;
