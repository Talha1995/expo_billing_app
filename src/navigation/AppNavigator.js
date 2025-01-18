import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import SalesScreen from "../screens/SalesScreen";
import BillScreen from "../screens/BillScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: "#2196F3",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }}
  >
    <Stack.Screen
      name="POS"
      component={HomeScreen}
      options={{ title: "POS System" }}
    />
    <Stack.Screen
      name="Bill"
      component={BillScreen}
      options={{
        title: "Bill Details",
        headerTitleAlign: "center",
      }}
    />
  </Stack.Navigator>
);

const SalesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: "#2196F3",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }}
  >
    <Stack.Screen
      name="SalesReport"
      component={SalesScreen}
      options={{ title: "Sales Report" }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Sales") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: "POS",
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesStack}
        options={{
          title: "Sales",
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
