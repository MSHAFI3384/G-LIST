import React, { useState, useEffect, useContext } from "react";
import {PublisherBanner, AdMobInterstitial} from 'expo-ads-admob';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { Context } from "../context/handlingContext";
import Items from "../components/Items";
import { Entypo } from '@expo/vector-icons';

const GenerateScreen = ({ navigation }) => {
  var db = SQLite.openDatabase("GroceryDB");

  const [groceryData, setGroceryData] = useState([]);
  const [content,setContent]=useState('');
  
  const { state,save_Table } = useContext(Context);
  const t_name = state[0]["t_name"];
  const [slide,setSlide] = useState(state[0].slide);
  const [title,setTitle] = useState('');

  const id = state[0].id;

  const get_all = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `select * from ${t_name} order by tick asc, item_id asc`,
          [],
          (tx, result) => {
            result.rows._array[0] !== undefined 
            ? setGroceryData(result.rows._array)
            : navigation.navigate('Home');
          },
          (err) => {
            console.log("error 2=", err);
          }
        );
      },
      (err) => {
        console.log("error 1=", err);
      },
      () => {
        console.log("Success");
      }
    );
  };

  const get = (t_name,id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `select (content) from ${t_name} where item_id=?`,
          [id],
          (tx, result) => {
            result.rows._array[0] !== undefined
              ? get_processing_content(result.rows._array[0].content)
              : tx.executeSql(
                  `select content from ${t_name} where item_id>1001`,
                  [],
                  (tx, result1) => {
                    result1.rows.length !== 0
                      ? get_processing_array(result1.rows._array)
                      : null;
                  }
                );
          },
          (err) => {
            console.log("Text Editor Get error 2=", err);
          }
        );
      },
      (err) => {
        console.log("Text Editor Get error 1=", err);
      },
      () => {
        console.log("Success");
      }
    );
  };

  const get_processing_array = (getArray) => {
    let Array = []
    getArray.forEach((item)=>{
      Array.push(item.content)
    })
    return setContent(Array.join('\n'))
  };

  const get_processing_content = (content) => {
    return setContent(content)
  };

  const get_title = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select title from notes where id=?",
          [id],
          (tx, result) => {
            if (result.rows._array[0] !== undefined){ 
             setTitle(result.rows._array[0].title)
            }
          }
        );
      },
      (err) => {
        console.log("Text editor get title error 1 =", err);
      },
      () => {
        console.log("Text editor get title success 1 =");
      }
    )};

    const call_save_Table = () => {
      save_Table(t_name,id,slide,title,content,()=>navigation.navigate("Text"))
    };

    const delete_item = (id) => {
      db.transaction(
        (tx)=>{
          tx.executeSql(`delete from ${t_name} where item_id=?`,[id])
        },()=>{},(err)=>{console.log('insert error2=',err)}),
      (err)=>{console.log("Items Component delete_item error 1=",err)},()=>{console.log('Success')}
      get_all();
    };
  
    useEffect(()=>{
      navigation.setParams({call_save_Table,call_share_data})
    },[content,title,groceryData])

    useEffect(() => {
      get_all();
      get_title(id);
      get(t_name,'1001');
      const listener = navigation.addListener("Focus", () => {
        get_all();
      });
      return () => {
        listener.remove();
      };
    }, [1]);

    const call_share_data = () => {
      share_data();
    };

    var string=''
    const share_data = () => {
      groceryData.map((item)=>{string=string.concat(item.item_name,' ',item.content,'\n')});
      Share.share({
        message: string.toString(),
      })
      .then((result)=>console.log('////////////////////////////////////////',result))
      .catch((err)=>console.log('***************************************',err))
    };

    return (
    <View style={{ flex: 1,backgroundColor:'antiquewhite' }}>
      <FlatList
        data={groceryData}
        showsVerticalScrollIndicator={false}
        keyExtractor={({ item_id }) => item_id.toString()}
        removeClippedSubviews={false}
        renderItem={({ item }) => {
          if (item.item_id !== 1001) {
            return (
              <Items
                get_all={get_all}
                t_name={t_name}
                item_id={item.item_id}
                item_name={item.item_name}
                content={item.content}
                tick={item.tick === 0 ? false : true}
                delete_item={delete_item}
              />
            );
          } else {
            return (
              <SafeAreaView style={styles.container}>
                <Text  selectable style={styles.text} >
                  {item.content}
                </Text>
              </SafeAreaView>
            );
          }
        }}
      />
  
      <PublisherBanner
        style={{alignSelf:'stretch'}}
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-6683425421860302/1914136724"
        //testDeviceID="EMULATOR"
        didFailToReceiveAdWithError={console.log('Error')}
        admobDispatchAppEvent={console.log('Close')}
      />
    </View>
  );
};

GenerateScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: ()=>(
      <Text style={{ fontWeight: "bold", fontSize: 20, color: "purple" }}>
        Contents
      </Text>
    ),
    headerRight: () => (
      <View style={{ flexDirection: "row" }}>
      
        <TouchableOpacity 
          style={{marginRight:15}}
          onPress={() =>{const call_share_data = navigation.getParam('call_share_data')
            call_share_data();
          }}>
              <Entypo name="share" color='black' size={30} />
        </TouchableOpacity>

        <TouchableOpacity 
        style={{marginRight:15}}
        onPress={() => {const call_save_Table = navigation.getParam('call_save_Table')
          call_save_Table();
        }}>
          <Entypo name="edit" size={30} color="black" />
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
  container: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 0.2,
    margin: 3,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    padding: 1,
    marginLeft:10
  },
});

export default GenerateScreen;
