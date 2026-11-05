import { View, Text } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/core';

export default function useAdvanceNavigation() {
  const navigation = useNavigation()

  function replaceWithIndex(screen: string) {
    navigation.dispatch((state) => {
      const routesIndex = state.routes.findIndex(v=> v.name == screen)

      if(routesIndex != -1){
        let screens = {
          index: 0,
          routes: state.routes.slice(0,routesIndex+1),
        }
        navigation.reset(screens);
      }

    });
  }

  function replaceWithScreen(newScreen:{name:string,params:{}},replaceScreen:string[]){
    navigation.dispatch(state=>{
      let history = state.routes.filter(v=> {
        let find = replaceScreen.find(b=> b === v.name)
        if(find) return false
        else return true
      })
      history.push(newScreen)
      navigation.reset({index:0,routes:history})
    })

  }

  return {
    replaceWithIndex,
    replaceWithScreen
  }
}