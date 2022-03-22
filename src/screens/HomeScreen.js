import React, { useState, useEffect, useContext,} from "react";
import { AdMobBanner} from "expo-ads-admob";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  AsyncStorage,
  Image,
  TextInput,
  StatusBar,
  Button,
  ActivityIndicator,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { Context } from "../context/handlingContext";
import Home from "../components/Home";
import { FontAwesome5,FontAwesome } from "@expo/vector-icons";
import moment from "moment"
import AppIntroSlider from 'react-native-app-intro-slider'; 

const HomeScreen = ({ navigation }) => {
  var db = SQLite.openDatabase("GroceryDB");

  const { save_Table } = useContext(Context);

  const [search_text, setSearch_text] = useState("");
  const [data_items, setData_items] = useState([]);

  const [showApp,setShowApp]=useState(false);
  const [loading,setLoading]= useState(true);

  const intro_loading = async () => {
    try{
      const value = await AsyncStorage.getItem('firstTime')
      setShowApp(!!value)
      setLoading(false)
    }
    catch(e){
      console.log(e)
    }
  }

  useEffect(()=>{
    intro_loading();
  },[])

  useEffect(()=>{
    navigation.setParams({showApp})
  },[showApp])

  useEffect(()=>{
    console.disableYellowBox=true;
  },[])

  const slides=[
    {
        key:1,
        image:require('../../assets/introslides/a.gif')
    },
    {
        key:2,
        image:require('../../assets/introslides/b.gif')
    },
    {
        key:3,
        image:require('../../assets/introslides/c.gif')
    },
    {
        key:4,
        image:require('../../assets/introslides/d.gif')
    },
  ]

  useEffect(() => {
    navigation.setParams({ add });
    is_empty();
  }, []);

  useEffect(() => {
    fetch();
    const listener = navigation.addListener("didFocus", () => {
      fetch();
    });
    return () => {
      listener.remove();
    };
  }, [search_text]);

  const is_empty = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `select * from notes order by id desc`,
          [],
          (tx, result) => {
            if (result.rows.length !== 0) {
              
              tx.executeSql(
                `select * from ${result.rows.item(0).table_name}`,
                [],
                (tx, result1) => {
                  
                  if (result1.rows.length === 0) {
                
                    tx.executeSql(
                      `drop table ${result.rows.item(0).table_name}`
                    );
                    tx.executeSql("delete from notes where id=?", [
                      result.rows.item(0).id,
                    ]);
                  }
                }
              );
            }
          },
          (err) => {
            console.log("Home Screen is_empty error 2=", err);
          }
        );
      },
      (err) => {
        console.log("Home Screen try is_empty error 1=", err);
      },
      () => {
        console.log("Home Screen try is_empty success");
      }
    );
  };

  const add = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY AUTOINCREMENT,title VARCHAR(50),table_name varchar(50),slide boolean,language VARCHAR(25),dt datetime)",
        [],
        (tx, result) => {
          let date=moment().format('YYYY-MM-DD HH:mm')
          tx.executeSql(
            "INSERT INTO notes(title,slide,language,dt) VALUES ('',?,?,?)",
            [false,'English',date],
            (tx, result) => {
              
            }
          );
          tx.executeSql("select (id) from notes", [], (tx, result1) => {
            
            let t_id = result1.rows.item(result1.rows.length - 1);
            
            let t_name = "secondary" + t_id.id;
            
            tx.executeSql("update notes set table_name=? where id=?", [
              t_name,
              t_id.id,
            ]);
            tx.executeSql(
              `Create table if not exists ${t_name}(item_id intiger primary key ,item_name varchar(30),content varchar(65530),tick boolean)`,
              []
            );
            save_Table(t_name, t_id.id, 0, "", "", () =>
              navigation.navigate("notesFlow")
            );
          });
          tx.executeSql("select * from notes", [], (tx, result2) => {
            
          });
        }
      ),
        () => {
          console.log("Successful");
        },
        (err) => {
          console.log(err);
        };
    });
  };

  const fetch = () => {
    console.log(search_text);
    if (search_text === "") {
      return db.transaction(
        (tx) => {
          tx.executeSql(
            "SELECT * FROM  notes order by id desc",
            [],
            (tx, result) => {
              
              setData_items(result.rows._array);
            },
            (err) => {
              console.log("fetch error 2 =", err);
            }
          );
        },
        (err) => {
          console.log("fetch error 1 =", err);
        },
        () => {
          console.log("sucessfull");
        }
      );
    } else {
      let search_title = search_text + "%";
      
      return db.transaction(
        (tx) => {
          tx.executeSql(
            "SELECT * FROM  notes where title like ? order by id desc",
            [search_title],
            (tx, result) => {
              
              setData_items(result.rows._array);
            },
            (err) => {
              console.log("fetch error 2 =", err);
            }
          );
        },
        (err) => {
          console.log("fetch error 1 =", err);
        },
        () => {
          console.log("sucessfull");
        }
      );
    }
  };

  const delete_note = (note_id, table_name) => {
    return db.transaction(
      (tx) => {
        tx.executeSql(`Drop table if exists ${table_name}`, []);
        tx.executeSql(
          `DELETE FROM notes WHERE id=?`,
          [note_id],
          (tx, result) => {
            fetch();
          },
          (err) => {
            console.log("error =", err);
          }
        );
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("dlt_note Transaction Sucessfull");
      }
    );
  };
  
  return(
    <View style={{flex:1}}>
      {loading===true ? <ActivityIndicator size='large' /> : 
      showApp===true ?
        <SafeAreaView style={[styles.container]} forceInset={{ top: "always" }}>
        <View style={styles.search}>
          <FontAwesome
            name="search"
            size={25}
            color="green"
            style={{ marginVertical: 10, marginLeft: 10 }}
          />
          
          <TextInput
            style={{marginLeft:7}}
            placeholder="Search Notes"
            placeholderTextColor="green"
            onChangeText={(Term) => {
              setSearch_text(Term);
            }}
          />
        </View>

          <FlatList
            data={data_items}
            keyExtractor={({ id }) => id.toString()}
            renderItem={({ item }) => {
              return (
                <Home
                  navigation={navigation}
                  save_Table={save_Table}
                  delete_note={delete_note}
                  table_name={item.table_name}
                  id={item.id}
                  title={item.title}
                  slide={item.slide}
                  dt={item.dt}
                />
              );
            }}
          />
        
          <AdMobBanner
            bannersize="fullBanner"
            adUnitID="ca-app-pub-6683425421860302/1914136724"
            servePersonalizedAds={true}
            ondidFailToReceiveAdWithError={console.log("An error")}
          />
    </SafeAreaView> :
    <AppIntroSlider
          data={slides}
          dotStyle={styles.dotStyle}
          activeDotStyle={styles.activeDotStyle}
          showSkipButton={true}
          onDone={()=>{
            AsyncStorage.setItem('firstTime','true')
            setShowApp(true)
            }}
          onSkip={()=>{
            AsyncStorage.setItem('firstTime','true')
            setShowApp(true)
          }}
          keyExtractor={({key})=>key.toString()}
          renderSkipButton={()=>{return(<Text style={{fontSize:23,color:'green',marginLeft:40}}>Skip</Text>);}}
          renderNextButton={()=>{return(<Text style={{fontSize:23,color:'green',marginRight:40}}>Next</Text>);}}
          renderDoneButton={()=>{return(<Text style={{fontSize:23,color:'green',marginRight:40}}>Done</Text>);}}
          renderItem={({item})=>{
              return(
                  <View style={styles.container1}>
                    <StatusBar hidden={showApp===true ? null : true}/>
                    <Image style={[{flex:1,height:undefined,width:undefined},styles.sliderImage]} resizeMode='contain' source={item.image}/>
                  </View>
              );
          }}
        /> 
      } 
      </View>
    );
};

HomeScreen.navigationOptions = ({ navigation }) => {
  const showApp= navigation.getParam('showApp');
  return {
    headerTitle: () => (
      <Text style={{ fontWeight: "bold", fontSize: 20, color: "purple" }}>
        G-LIST
      </Text>
    ),
    headerRight: () => (
      <View style={{ paddingRight: 15 }}>
        <TouchableOpacity
          onPress={() => {
            const add = navigation.getParam("add");
            add();
          }}
        >
          <FontAwesome5 name="plus" size={25} color="black" />
        </TouchableOpacity>
      </View>
    ),
    headerShown:showApp,
    headerStyle: {
      backgroundColor: "pink",
    },
    
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "antiquewhite",
  },
  search: {
    flexDirection:'row',
    marginVertical: 10,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor:'green',
    borderRadius: 30,
    backgroundColor: "azure",
  },
  dotStyle:{
    backgroundColor:'green',
  },
  activeDotStyle:{
    backgroundColor:'white',
  },
  sliderImage:{
    margin:40,
    borderRadius:5
  },
  container1:{
    flex:1,
    borderWidth:0,
    backgroundColor:'#c2bfba'
  }
});

export default HomeScreen;
