import React from 'react'
import { useNavigation, CommonActions } from '@react-navigation/core';

export default function useAdvanceNavigation() {
  const navigation = useNavigation() as any

  function replaceWithIndex(screen: string) {
    navigation.dispatch((state: any) => {
      const routesIndex = state.routes.findIndex((v: any) => v.name == screen)

      if (routesIndex != -1) {
        let screens = {
          index: 0,
          routes: state.routes.slice(0, routesIndex + 1),
        }
        navigation.reset(screens);
      }

      return CommonActions.navigate(state.routes[state.index]);
    });
  }

  function replaceWithScreen(newScreen: { name: string; params: {} }, replaceScreen: string[]) {
    navigation.dispatch((state: any) => {
      let history = state.routes.filter((v: any) => {
        let find = replaceScreen.find((b) => b === v.name)
        if (find) return false
        else return true
      })
      history.push({ ...newScreen, key: `${newScreen.name}-${Date.now()}` })
      navigation.reset({ index: 0, routes: history })
      return CommonActions.navigate(newScreen.name as never, newScreen.params as never);
    })
  }

  return {
    replaceWithIndex,
    replaceWithScreen
  }
}
