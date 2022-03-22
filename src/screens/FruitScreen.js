import React, { useState, useContext, useEffect } from "react";
import {AdMobInterstitial, PublisherBanner} from "expo-ads-admob";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Picker,
  Keyboard,
  Button,
} from "react-native";
import { Context } from "../context/handlingContext";
import { FruitData } from "../Data/FruitData";
import * as SQLite from "expo-sqlite";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBackButton } from "react-navigation-stack";
import GroceryCard from "../components/GroceryCard";
import { FontAwesome } from '@expo/vector-icons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';



const FruitScreen = ({ navigation }) => {
  const { state, insert_table , update_language , } = useContext(Context);
  const t_name = state[0].t_name;

  var db = SQLite.openDatabase("GroceryDB");
  
  const [filtered_data, setFiltered_data] = useState([]);
  const [search_text, setSearch_text] = useState("");
  const [pickerValue,setPickerValue] = useState('English')
  const [isItems,setIsItems]= useState(0)

  useEffect(()=>{
    console.disableYellowBox=true;
  },[])

  const showInterestialAds = (bool=false) => {
    console.log('AdMobInterstitial.onAdLoaded = = =',AdMobInterstitial.interestitialDidLoad)
    bool===true ? AdMobInterstitial.showAdAsync() : null
  };
  //Original ID "ca-app-pub-6683425421860302/5681797823"
  useEffect(()=>{
    AdMobInterstitial.setAdUnitID(
      "ca-app-pub-6683425421860302/5681797823"
    );
    AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    navigation.setParams({showInterestialAds})
  },[])

  const search = () => {
    if (pickerValue === "English") {
      if(search_text !== "")
        {setFiltered_data(
          FruitData.filter((item) => item.name['English'].startsWith(search_text[0].toUpperCase() + search_text.slice(1)))
        )}
      else {
        setFiltered_data(
          FruitData.filter((item) => item.name['English'])
        )
      }
    }
    else {
      setFiltered_data(
        FruitData
      );
    }
  };

  useEffect(() => {
    get_language();
    const listener = navigation.addListener('didFocus', () => {
      get_language();
    });
    return ()=>{
      listener.remove();
    } 
  }, [navigation]);

  useEffect(() => {
    search();
  }, [search_text]);

  const get_language = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select language from notes where id=?",
          [state[0].id],
          (tx,result) => {
            setPickerValue(result.rows._array[0].language)},
          (err) => {console.log("inner err=", err);}
        );
      },
      (err) => {
        console.log(err);
      }
    );
  };

  const is_items = () => {
    db.transaction((tx)=>{
      tx.executeSql(`select * from ${t_name} where item_id<50`,[],(tx,result)=>{
        if(result.rows.length >= 1){
          setIsItems(1)
        }
      })
    },(err) => {console.log("***********Delete items",err)})
  }

  useEffect(()=>{
    is_items();
  },[])

  const delete_items = () => {
    if (isItems===0){
      db.transaction((tx)=>{
        tx.executeSql(`delete from ${t_name} where item_id<50`)
      },(err) => {console.log("***********Delete items",err)})
    }
  }

  const call_save = () => {
    console.log("**********CALL_SAVE called Keyboard Dismisses")
    Keyboard.dismiss();
    setTimeout(()=>{
      navigation.navigate('Home')
    },20)
  }

  useEffect(()=>{
    navigation.setParams({call_save,delete_items})
  },[isItems])

  

  return(
    <SafeAreaView  style={styles.container}>
      <View style={{ flexDirection: "row"}}>

      {pickerValue === "English" ? <View style={styles.search}>
          <FontAwesome name="search" size={25} color="green" style={{marginVertical:10,marginLeft:10}}/>
          <TextInput
            style={{marginLeft:7}}
            placeholder="Search Fruits"
            placeholderTextColor="green"
            onChangeText={(Term) => {
              setSearch_text(Term);
            }}
          />
        </View> : 
        <View style={[styles.search,{opacity:0.3}]} pointerEvents="none">
          <FontAwesome name="search" size={25} color="green" style={{marginVertical:10,marginLeft:10}}/>
        </View>}

        <View style={styles.picker}>
          <Picker style={{fontSize:15}}
          selectedValue={pickerValue}
          onValueChange={(itemValue,itemIndex)=>{
            setPickerValue(itemValue)
            update_language(state[0].id,itemValue)
          }}
          >
            <Picker.Item color='green' label="English" value="English"/>
            <Picker.Item color='green' label="Arabic (عربى)" value="Arabic"/>
            <Picker.Item color='green' label="French (français)" value="French"/>
            <Picker.Item color='green' label="German (Deutsche)" value="German"/>
            <Picker.Item color='green' label="Italian (italiano)" value="Italian"/>
            <Picker.Item color='green' label="Malayalam (മലയാളം)" value="Malayalam"/>
            <Picker.Item color='green' label="Spanish (Español)" value="Spanish"/>
            <Picker.Item color='green' label="Tamil (தமிழ்)" value="Tamil"/>
            <Picker.Item color='green' label="Telugu (తెలుగు)" value="Telugu"/>
            <Picker.Item color='green' label="Hindi (हिंदी)" value="Hindi"/>
            <Picker.Item color='green' label="Kannada (ಕನ್ನಡ)" value="Kannada"/>
          </Picker>
        </View>
      </View>

    
        <KeyboardAwareScrollView>
          
          <FlatList
            data={filtered_data}
            numColumns={4}
            columnWrapperStyle={styles.row}
            keyExtractor={({ id }) => id.toString()}
            ListFooterComponent={()=>{return(null)}}
            renderItem={({ item }) => {
              return (
                <GroceryCard
                  t_name={t_name}
                  id={item.id}
                  name={item.name[pickerValue]}
                  url={item.url}
                  insert_table={insert_table}
                  pickerValue={pickerValue}
                />
              );
            }}
          />
          
        </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

FruitScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <HeaderBackButton onPress={() =>{
        const delete_items = navigation.getParam("delete_items")
        delete_items() 
        navigation.navigate("Generate")
      }} />
    ),
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 10 }}
        onPress={() => {
          const showInterestialAds = navigation.getParam("showInterestialAds");
          const call_save = navigation.getParam("call_save");
          showInterestialAds(true);
          call_save();
        }}
      >
        <MaterialIcons name="check" size={30} color="black" />
      </TouchableOpacity>
    ),
    headerStyle: {
      backgroundColor: "pink",
    },
    headerTitleStyle: {
      color: "purple",
    },
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'antiquewhite',
  },
  row: {
    justifyContent: "flex-start",
  },
  search:{
    flex: 1,
    flexDirection:'row',
    marginVertical:10,
    marginHorizontal:10,
    borderWidth: 2,
    borderRadius:10,
    backgroundColor:'azure',
    borderColor:'green',
  },
  picker:{
    flex:1,
    fontSize:20,
    backgroundColor:'azure',
    marginVertical:10,
    marginRight:10,
    marginLeft:10,
    borderWidth: 2, 
    borderColor: 'green', 
    borderRadius: 5

  },
});

export default FruitScreen;
