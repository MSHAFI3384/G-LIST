import React from 'react'
import {View} from 'react-native'

import {createAppContainer,createSwitchNavigator,} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';
import {Provider} from './src/context/handlingContext';

import GenerateScreen from './src/screens/GenerateScreen';
import FruitScreen from './src/screens/FruitScreen';
import HomeScreen from './src/screens/HomeScreen';
import VegetableScreen from './src/screens/VegetableScreen';
import TextEditorScreen from './src/screens/TextEditorScreen';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const navigator=createSwitchNavigator(
  {
    mainFlow:createStackNavigator({
      Home:HomeScreen,
      Generate:GenerateScreen,
    }),
    notesFlow:createMaterialBottomTabNavigator({
      Text:createStackNavigator({Notes:TextEditorScreen},{
        navigationOptions:{  
        tabBarIcon:(
          <View>  
               <MaterialCommunityIcons name="clipboard-text-outline" size={25} color="black" />
          </View>),
        }}),
      Fruits:createStackNavigator({Fruits:FruitScreen},{
        navigationOptions:{  
        tabBarIcon:(  
          <View>  
               <FontAwesome name="circle" size={25} color="yellow" />
          </View>),
        }}),
      Vegetables:createStackNavigator({Vegetables:VegetableScreen},{
        navigationOptions:{  
        tabBarIcon:(  
          <View>  
               <FontAwesome name="circle" size={25} color="green" />
          </View>),
        }})
    },
    {
      activeColor:"purple",
      inactiveColor:"black",
      barStyle:{ backgroundColor: 'pink'},
      keyboardHidesNavigationBar:true
    }
    )
  },
);

const App=createAppContainer(navigator);

export default ()=>{
  return(
      <Provider>
          <App/>
      </Provider>
  );
};