import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import {CheckBox} from '@react-native-community/checkbox'
import * as SQLite from 'expo-sqlite';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native-gesture-handler";
import { Entypo } from '@expo/vector-icons';

const Items = ({ t_name,item_id, item_name, content, tick,get_all,delete_item }) => {
  
  var db=SQLite.openDatabase("GroceryDB");

  const [selected, setSelected] = useState(tick);
  const [decoration, setDecoration] = useState("none");

  const[viewOpacity,setViewOpacity] = useState(1);

  useEffect(()=>{
    check();
    update_tick(item_id);
    get_all();
  },[selected]); 

  const update_tick = (id) => {
    db.transaction((tx)=>{
        tx.executeSql(`update ${t_name} set tick=? where item_id=?`,[selected,id])
    },
    (err)=>{console.log("update _tick error 1=",err)},
    ()=>{console.log('update _tick Success 1')});
  };

  const check = () => {
    if (selected !== true) {
      setDecoration("none");
      setViewOpacity(1);
    } else {
      setDecoration("line-through");
      setViewOpacity(0.5);
    }
  };

  return (
    <SafeAreaView style={[{opacity:viewOpacity},styles.container]}>
      <View style={{flexDirection:'row'}}>
        {/* <CheckBox
          style={{ marginLeft: 3 }}
          onValueChange={setSelected}
          value={selected}
        /> */}
        {item_id<100 ? 
          <FontAwesome style={{paddingTop:3,marginRight:5}} name="circle" size={25} color="#FFA500"/> : 
          100<item_id && item_id<500 ? <FontAwesome style={{paddingTop:3,marginRight:5}} name="circle" size={25} color="green"/> :null}
        <Text
          style={[
            styles.text,
            { textDecorationLine: decoration, textDecorationStyle: "solid" },
          ]}
        >
          {item_name} {content}
        </Text>
      </View>
      {item_id<1000 ? 
      <TouchableOpacity style={{borderWidth:0,marginRight:8}} onPress={()=>{delete_item(item_id)}}>
        <Entypo style={{paddingTop:2}} name="cross" size={30} color="crimson" />
      </TouchableOpacity> : 
       null}
      

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent:'space-between',
    borderRadius: 5,
    borderWidth: 0.2,
    margin: 4,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    marginRight:40,
  },
});

export default Items;
