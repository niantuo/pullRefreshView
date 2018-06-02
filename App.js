/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, Text, TouchableHighlight, View,} from 'react-native';
import Advanced from './example/example_advanced'
import Simple from './example/example_simple'
import {NavigationPage, TeaNavigator} from 'teaset'


export class MainView extends NavigationPage {

    render() {
        return (
            <View style={AppStyles.container}>
                <TouchableHighlight onPress={() => {
                    this.navigator.push({view: <Simple/>})
                }}>
                    <Text>Simple</Text>
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={() => {
                        this.navigator.push({view: <Advanced/>})
                    }}
                >
                    <Text>Advanced</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

export class RootView extends Component {

    render() {
        return (
            <TeaNavigator rootView={<MainView/>}/>
        )
    }
}


export default class App extends Component {


    render() {
        return (
            <RootView/>
        )
    }


}

const AppStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff7cd8',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
