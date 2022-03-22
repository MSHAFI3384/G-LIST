import React, { useEffect, useState, useRef, createRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  findNodeHandle,
  AccessibilityInfo,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";

const GroceryCard = ({ t_name, id, name, url, insert_table, pickerValue }) => {
  const [content, setContent] = useState("");
  const { width } = Dimensions.get("window");
  const cardWidth = Math.floor((width - 8 * 5) / 4);

  var db = SQLite.openDatabase("GroceryDB");

  const get_content = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `select content from ${t_name} where item_id=?`,
          [id],
          (tx, result) => {
            result.rows._array[0] === undefined
              ? setContent("")
              : setContent(result.rows._array[0].content);
          },
          (err) => {
            console.log("error 2=", err);
          }
        );
      },
      (err) => {
        console.log("error 1=", err);
      },
    );
  };

  useEffect(() => {
    get_content();
  }, [1]);

  const inputFocus = useRef();

  const handle_touch = () => {
    if (inputFocus && inputFocus.current){
      inputFocus.current.focus();
    }
  };
  

  return (
    <KeyboardAvoidingView style={[styles.flat_container, { width: cardWidth }]} 
    onTouchEnd={()=>{handle_touch()}}
    >
      
      {pickerValue === "Arabic" ? (
        <Text style={{ fontSize: 17 }}>{name}</Text>
      ) : (
        <Text>{name}</Text>
      )}
      <Image
        style={{
          margin: 5,
          height: Math.floor(cardWidth / 2),
          width: Math.floor(cardWidth / 2),
        }}
        source={url}
      />
      <TextInput
        ref={inputFocus}
        style={styles.text_input}
        //returnKeyType="next"
        placeholder="Quantity"
        value={content}
        onChangeText={(Term) => setContent(Term)}
        showSoftInputOnFocus={true}
        onEndEditing={() => {
          insert_table(t_name, id, name, content);
          
        }}
      />
     
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  text_input: {
    borderBottomWidth: 0.5,
    marginHorizontal: 5,
    marginBottom: 5,
    alignSelf: "stretch",
  },
  flat_container: {
    alignItems: "center",
    margin: 5,
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
  },
});

export default GroceryCard;
