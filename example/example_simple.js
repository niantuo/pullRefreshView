/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React,{Component} from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight
} from 'react-native';

import {NavigationPage} from 'teaset'


import GiftedListView from '../lib/GiftedListView'

export default class Example extends NavigationPage{


  static defaultProps={
      ...NavigationPage.defaultProps,
      showBackButton:true,
      title:'Simple'
  };
  /**
   * Will be called when refreshing
   * Should be replaced by your own logic
   * @param {number} page Requested page to fetch
   * @param {function} callback Should pass the rows
   * @param {object} options Inform if first load
   */
  _onFetch(page = 1, callback, options) {

    console.log('_onFetch','page->',page);
    setTimeout(() => {
      var rows = ['row '+((page - 1) * 3 + 1), 'row '+((page - 1) * 3 + 2), 'row '+((page - 1) * 3 + 3)];
      if (page === 3) {
        callback(rows, {
          allLoaded: true, // the end of the list is reached
        });        
      } else {
        callback(rows);
      }
    }, 1000); // simulating network fetching
  }


  componentWillUnmount(){
    console.log('willUnmount->')
  }
  
  /**
   * When a row is touched
   * @param {object} rowData Row data
   */
  _onPress(rowData) {
    console.log(rowData+' pressed');
  }
  
  /**
   * Render a row
   * @param {object} rowData Row data
   */
  _renderRowView(rowData) {
    return (
      <TouchableHighlight 
        style={styles.row} 
        underlayColor='#c8c7cc'
        onPress={() => this._onPress(rowData)}
      >  
        <Text>{rowData}</Text>
      </TouchableHighlight>
    );
  }

  renderPage(){
      return (
          <View style={styles.container}>
              <View style={styles.navBar} />
              <GiftedListView
                  rowView={this._renderRowView}
                  onFetch={this._onFetch}
                  firstLoader={true} // display a loader for the first fetching
                  pagination={true} // enable infinite scrolling using touch to load more
                  refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                  withSections={false} // enable sections
              />
          </View>
      );
  }

}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navBar: {
    height: 64,
    backgroundColor: '#CCC'
  },
  row: {
    padding: 10,
    height: 44,
  },
};
