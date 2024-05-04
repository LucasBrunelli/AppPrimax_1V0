import React, { useRef, useState, useEffect ,useMemo} from 'react';
import { 
    View, 
    Button,
    Text, 
    StyleSheet, 
    TextInput, 
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';



// Utilizar biblitoecas como Navigator cmd =   npm install @react-navigation/native
// Baixar bibliotecas Navigator adicionais =   npm install react-native-screens react-native-safe-area-context
// Baixar bibliotecas Navigator stack cmd  =   npm install @react-navigation/stack
// Comando adicional para usar em Apps IOS =   npx pod-install ios    ou    npm pod-install ios  
// Documentação para bibliotecas Navigator =   https://reactnavigation.org/docs/getting-started/
// Utilizar essa biblioteca Navigantor, tanto nos arquivos de Pages, quanto no arquivo principal App.tsx

const PageBemvindo = () => {  // Componete Page


    return (

        <View>
            <Text> Seja Bem Vindo! </Text>
        </View>
    )
}


export default PageBemvindo;