import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { Entypo } from "@expo/vector-icons";

const Home = ({navigation,save_Table,delete_note,table_name,id,title,slide,dt,}) => {

  const dtSplit = dt.split(" ");

  return (
    <TouchableOpacity
      onPress={() => {
        save_Table(table_name, id, slide, title, "", () =>
          navigation.navigate("Generate")
        );
      }}
    >
      <View style={styles.flat_container}>
        <View style={styles.container}>
          <Text style={styles.text}>{title}</Text>
        </View>

        <View style={{ marginRight: 10, alignItems: "flex-end" }}>
          <Text style={{ fontSize: 13 }}>{dtSplit[0]}</Text>
          <Text style={{ fontSize: 13 }}>{dtSplit[1]}</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert("DELETE", "Sure You Want To Delete ?", [
              {
                text: "Yes",
                onPress: () => delete_note(id, table_name),
              },
              {
                text: "No",
              },
            ])
          }
        >
          <Entypo name="cross" size={35} color="crimson" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    paddingTop:3
  },
  flat_container: {
    flex: 1,
    margin: 5,
    padding: 7,
    borderWidth: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 5,
    backgroundColor: "white",
  },
  text: {
    fontSize: 20,
    color: "black",
  },
});

export default Home;
