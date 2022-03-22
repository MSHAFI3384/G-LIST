import React, {
  useContext,
  useState,
  useEffect,
  createRef,
  useRef,
} from "react";
import {AdMobInterstitial} from "expo-ads-admob";
import {
  View,
  TextInput,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Context } from "../context/handlingContext";
import * as SQLite from "expo-sqlite";
import { HeaderBackButton } from "react-navigation-stack";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const TextEditorScreen = ({ navigation }) => {
  const { state, insert_table,save_Table } = useContext(Context);
  const t_name = state[0].t_name;
  const id = state[0].id;
  const slide = state[0].slide===0?false:true
  const title1 = state[0].title
  const content1 = state[0].content

  const [title, setTitle] = useState(title1);
  const [content, setContent] = useState(content1);
  const [isEnabled, setIsEnabled] = useState(slide);
  const [titleFlag,setTitleFlag] = useState(0);
  const [contentFlag,setContentFlag] = useState(0);
  
  useEffect(()=>{
    console.disableYellowBox=true;
  },[])

  const showInterestialAds = (bool=false) => {
    bool===true ?  AdMobInterstitial.showAdAsync() : null
  };

  //Original ID "ca-app-pub-6683425421860302/5681797823"
  //Test ID "ca-app-pub-3940256099942544/1033173712"
  
  useEffect(()=>{
    AdMobInterstitial.setAdUnitID(
      "ca-app-pub-6683425421860302/5681797823"
    );
    AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    navigation.setParams({showInterestialAds})
  },[])
  
  const db = SQLite.openDatabase("GroceryDB")

  const set_title = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql("update notes set title=? where id=?", [title, id]);
      },
      (err) => {
        console.log("Text editor set title error 1 =", err);
      },
      () => {
        console.log("Text editor set title success 1 =");
      }
    );
  };

  const call_insert_table = (callBack) => {
    save_Table(t_name,id,isEnabled===true?1:0,title,'');

    if (titleFlag===1){
      set_title(id)
      console.log("********Called Title");
    }

    if (contentFlag===1){
      db.transaction((tx)=>{
          tx.executeSql(`delete from ${t_name} where item_id>=1001`,[])
          tx.executeSql(`update notes set slide=? where id=?`,[isEnabled,id]);
        },(err) => {
          console.log("call insert table 1=", err);
        });
      if (isEnabled === true) {
          let dataArray = content.split("\n");
          let count = 1002;
          dataArray.forEach((item, index) => {
            let value = (count + index).toString();
            insert_table(t_name, value.toString(), "", item);
          });
        if (callBack) {
            setTimeout(() => {
              callBack();
            }, dataArray.length * 20);
          }
        } 
      else {
          insert_table(t_name,"1001", "", content);
          if (callBack) {
            setTimeout(() => {
              callBack();
            }, 10);
          }
        }
      }
      else{
        if (callBack) {
          callBack();
        }
      }
    };

  useEffect(() => {
    navigation.setParams({ call_insert_table});
  }, [content,isEnabled,title]);

  const inputFocus = useRef();

  const handle_touch = () =>{
    if (inputFocus && inputFocus.current){
      inputFocus.current.focus()
    }
  }

  return (
    <View style={{ flex: 1,backgroundColor:'antiquewhite' }}>
      <TextInput
        style={styles.titleInput}
        value={title}
        placeholder="Enter Title"
        placeholderTextColor="purple"
        onChangeText={(Term) => {
          if (titleFlag===0){
            setTitleFlag(1)
            console.log(titleFlag)
          }
          setTitle(Term);
        }}
        onEndEditing={() =>{ 
          set_title(id)
          setTitleFlag(0)
        }}
      />

      <View style={styles.tickBoxesView}>
        <Text style={{fontSize:20,color:'black',marginRight:10}}>Tick Boxes</Text>
        {isEnabled!==true? 
        <TouchableOpacity onPress={()=>{
          setIsEnabled(true)
          setContentFlag(1)
        }}>
        <Ionicons style={{marginRight:10}} name="ios-checkbox-outline" size={27} color="black" /> 
        </TouchableOpacity> :
        <TouchableOpacity onPress={()=>{
          setIsEnabled(false)
          setContentFlag(1)
        }}>
        <Ionicons style={{marginRight:10}} name="ios-checkbox" size={27} color="green" />
        </TouchableOpacity>}
      </View>
      
        <ScrollView
        contentContainerStyle={styles.noteContainer} 
        onTouchEnd={()=>{handle_touch()}}>
          <TextInput
              ref={inputFocus}
              value={content}
              placeholder="Enter Notes"
              multiline={true}
              style={{fontSize: 17}}
              onChangeText={(term) => {
                if (contentFlag===0){
                  setContentFlag(1)
                }
                setContent(term);
              }}
              onEndEditing={() => {
                call_insert_table();
                setContentFlag(0);
              }}
            />
        </ScrollView>
      
    </View>
  );
};

TextEditorScreen.navigationOptions = ({ navigation }) => {
  
  return {
    headerLeft: () => (
    <HeaderBackButton
      onPress={() => {
        navigation.navigate("Generate");
    }}/>
    ),
    headerRight: () => (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => {
            const showInterestialAds = navigation.getParam("showInterestialAds")
            showInterestialAds(true)
            navigation.navigate("Home")
          }}
        >
          <Entypo name="cross" size={30} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => {
            const showInterestialAds = navigation.getParam("showInterestialAds")
            const call_insert_table = navigation.getParam("call_insert_table");
            showInterestialAds(true);
            call_insert_table(() => navigation.navigate("Home"));
            
          }}
        >
          <MaterialIcons name="check" size={30} color="black" />
        </TouchableOpacity>
      </View>
    ),
    headerStyle: {
      backgroundColor: "pink",
    },
    headerTitleStyle: {
      color: "purple",
    }
  };
};

const styles = StyleSheet.create({
  titleInput: {
    backgroundColor: "white",
    marginTop: 7,
    padding: 5,
    paddingLeft: 10,
    fontSize: 17,
    color: "purple",
  },
  noteContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingLeft: 10,
    paddingRight: 5,
  },
  tickBoxesView:{
    margin:7,
    flexDirection:'row',
    justifyContent:'flex-end',
  }
});

export default TextEditorScreen;
