'use strict';

import React, {PureComponent} from 'react'

import {
    ActivityIndicator,
    ListView,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    ViewPropTypes
} from 'react-native';
import PropTypes from 'prop-types'

// small helper function which merged two objects into one
function MergeRowsWithHeaders(obj1, obj2) {
    for (var p in obj2) {
        if (obj1[p] instanceof Array && obj1[p] instanceof Array) {
            obj1[p] = obj1[p].concat(obj2[p])
        } else {
            obj1[p] = obj2[p]
        }
    }
    return obj1;
}

export default class GiftedListView extends PureComponent {


    static propTypes = {
        ...ViewPropTypes,
        customStyles: PropTypes.object,
        initialListSize: PropTypes.number,
        firstLoader: PropTypes.bool,
        forceUpdate: PropTypes.bool,
        pagination: PropTypes.bool,
        refreshable: PropTypes.bool,
        refreshableColors: PropTypes.array,
        refreshableProgressBackgroundColor: PropTypes.string,
        refreshableSize: PropTypes.string,
        refreshableTitle: PropTypes.string,
        refreshableTintColor: PropTypes.string,
        renderRefreshControl: PropTypes.func,
        headerView: PropTypes.func,
        sectionHeaderView: PropTypes.func,
        scrollEnabled: PropTypes.bool,
        withSections: PropTypes.bool,
        onFetch: PropTypes.func,

        paginationFetchingView: PropTypes.func,
        paginationAllLoadedView: PropTypes.func,
        paginationWaitingView: PropTypes.func,
        emptyView: PropTypes.func,
        renderSeparator: PropTypes.func,

        rowHasChanged: PropTypes.func,
        distinctRows: PropTypes.func,

        spinnerSize: PropTypes.string,
        spinnerColor: PropTypes.string,

    };

    static defaultProps = {
        ...View.defaultProps,
        customStyles: {},
        initialListSize: 10,
        firstLoader: true,
        forceUpdate: false,
        pagination: true,
        refreshable: true,
        refreshableColors: undefined,
        refreshableProgressBackgroundColor: undefined,
        refreshableSize: undefined,
        refreshableTitle: undefined,
        refreshableTintColor: undefined,
        renderRefreshControl: null,
        headerView: null,
        sectionHeaderView: null,
        scrollEnabled: true,
        withSections: false,
        onFetch: function (page, callback, options) {
            callback([]);
        },
        paginationFetchingView: null,
        paginationAllLoadedView: null,
        paginationWaitingView: null,
        emptyView: null,
        renderSeparator: null,
        rowHasChanged: null,
        distinctRows: null,

        spinnerSize: 'small',
        spinnerColor: 'gray',
    };

    constructor(props) {
        super(props);
        this.getInitialState();
        this._mounted = false;
    }


    _setPage(page) {
        this._page = page;
    }

    _getPage() {
        return this._page;
    }

    _setRows(rows) {
        this._rows = rows;
    }

    _getRows() {
        return this._rows;
    }


    paginationFetchingView() {
        if (this.props.paginationFetchingView) {
            return this.props.paginationFetchingView();
        }

        return (
            <View style={[defaultStyles.paginationView, this.props.customStyles.paginationView]}>
                <ActivityIndicator
                    animating={true}
                    size={this.props.spinnerSize}
                    color={this.props.spinnerColor}
                />
            </View>
        );
    }

    paginationAllLoadedView() {
        if (this.props.paginationAllLoadedView) {
            return this.props.paginationAllLoadedView();
        }

        return (
            <View style={[defaultStyles.paginationView, this.props.customStyles.paginationView]}>
                <Text style={[defaultStyles.actionsLabel, this.props.customStyles.actionsLabel]}>
                    ~
                </Text>
            </View>
        );
    }

    paginationWaitingView(paginateCallback) {
        if (this.props.paginationWaitingView) {
            return this.props.paginationWaitingView(paginateCallback);
        }

        return (
            <TouchableHighlight
                underlayColor='#c8c7cc'
                onPress={paginateCallback}
                style={[defaultStyles.paginationView, this.props.customStyles.paginationView]}
            >
                <Text style={[defaultStyles.actionsLabel, this.props.customStyles.actionsLabel]}>
                    Load more
                </Text>
            </TouchableHighlight>
        );
    }

    headerView() {
        if (this.state.paginationStatus === 'firstLoad' || !this.props.headerView) {
            return null;
        }
        return this.props.headerView();
    }

    emptyView(refreshCallback) {
        if (this.props.emptyView) {
            return this.props.emptyView(refreshCallback);
        }

        return (
            <View style={[defaultStyles.defaultView, this.props.customStyles.defaultView]}>
                <Text style={[defaultStyles.defaultViewTitle, this.props.customStyles.defaultViewTitle]}>
                    Sorry, there is no content to display
                </Text>

                <TouchableHighlight
                    underlayColor='#c8c7cc'
                    onPress={refreshCallback.bind(this)}
                >
                    <Text>
                        ↻
                    </Text>
                </TouchableHighlight>
            </View>
        );
    }

    renderSeparator() {
        if (this.props.renderSeparator) {
            return this.props.renderSeparator();
        }

        return (
            <View style={[defaultStyles.separator, this.props.customStyles.separator]}/>
        );
    }


    getInitialState() {
        this._setPage(1);
        this._setRows([]);

        let dataSource;
        let isRefreshing = false;
        let paginationStatus = 'firstLoad';

        let ds = null;
        if (this.props.withSections === true) {
            ds = new ListView.DataSource({
                rowHasChanged: this.props.rowHasChanged ? this.props.rowHasChanged : (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
            });
            dataSource = ds.cloneWithRowsAndSections(this._getRows.bind(this));

        } else {
            ds = new ListView.DataSource({
                rowHasChanged: this.props.rowHasChanged ? this.props.rowHasChanged : (row1, row2) => row1 !== row2,
            });
            dataSource = ds.cloneWithRows(this._getRows.bind(this));
        }

        this.state = {
            dataSource, isRefreshing, paginationStatus
        };

    }

    /**
     * 初次加载
     */
    componentDidMount() {
        this._mounted = true;

        this.props.onFetch(this._getPage(), this._postRefresh.bind(this), {firstLoad: true});
    }

    componentWillUnmount() {
        this._mounted = false;
        this._setPage(1);
        this.props.onFetch(this._getPage(), this._postRefresh.bind(this), {firstLoad: true});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.forceUpdate) {
            this._setPage(1);
            this.props.onFetch(this._getPage(), this._postRefresh.bind(this), {});
        }
    }

    setNativeProps(props) {
        this.refs.listview.setNativeProps(props);
    }

    _refresh() {
        this._onRefresh({external: true});
    }

    _onRefresh(options = {}) {
        if (this._mounted) {
            this.setState({
                isRefreshing: true,
            });
            this._setPage(1);
            this.props.onFetch(this._getPage(), this._postRefresh.bind(this), options);
        }
    }

    _postRefresh(rows = [], options = {}) {
        if (this._mounted) {
            this._updateRows(rows, options);
        }
    }

    _onPaginate() {
        if (this.state.paginationStatus === 'allLoaded') {
            return null
        } else {
            this.setState({
                paginationStatus: 'fetching',
            });
            this.props.onFetch(this._getPage() + 1, this._postPaginate.bind(this), {});
        }
    }

    _postPaginate(rows = [], options = {}) {
        this._setPage(this._getPage() + 1);
        var mergedRows = null;
        if (this.props.withSections === true) {
            mergedRows = MergeRowsWithHeaders(this._getRows(), rows);
        } else {
            mergedRows = this._getRows().concat(rows);
        }

        if (this.props.distinctRows) {
            mergedRows = this.props.distinctRows(mergedRows);
        }

        this._updateRows(mergedRows, options);
    }

    _updateRows(rows = [], options = {}) {
        if (rows !== null) {
            this._setRows(rows);
            if (this.props.withSections === true) {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRowsAndSections(rows),
                    isRefreshing: false,
                    paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
                });
            } else {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(rows),
                    isRefreshing: false,
                    paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
                });
            }
        } else {
            this.setState({
                isRefreshing: false,
                paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
            });
        }
    }

    _renderPaginationView() {
        if ((this.state.paginationStatus === 'fetching' && this.props.pagination === true) || (this.state.paginationStatus === 'firstLoad' && this.props.firstLoader === true)) {
            return this.paginationFetchingView();
        } else if (this.state.paginationStatus === 'waiting' && this.props.pagination === true && Object.values(this._getRows()).length > 0) {
            return this.paginationWaitingView(this._onPaginate.bind(this));
        } else if (this.state.paginationStatus === 'allLoaded' && this.props.pagination === true) {
            return this.paginationAllLoadedView();
        } else if (Object.values(this._getRows()).length === 0) {
            return this.emptyView(this._onRefresh.bind(this));
        } else {
            return null;
        }
    }

    renderRefreshControl() {
        if (this.props.renderRefreshControl) {
            return this.props.renderRefreshControl({onRefresh: this._onRefresh.bind(this)});
        }
        return (
            <RefreshControl
                onRefresh={this._onRefresh.bind(this)}
                refreshing={this.state.isRefreshing}
                colors={this.props.refreshableColors}
                progressBackgroundColor={this.props.refreshableProgressBackgroundColor}
                size={this.props.refreshableSize}
                tintColor={this.props.refreshableTintColor}
                title={this.props.refreshableTitle}
            />
        );
    }

    render() {
        return (
            <ListView
                ref="listview"
                dataSource={this.state.dataSource}
                renderRow={this.props.rowView}
                renderSectionHeader={this.props.sectionHeaderView}
                renderHeader={this.headerView.bind(this)}
                renderFooter={this._renderPaginationView.bind(this)}
                renderSeparator={this.renderSeparator.bind(this)}

                automaticallyAdjustContentInsets={false}
                scrollEnabled={this.props.scrollEnabled}
                canCancelContentTouches={true}
                refreshControl={this.props.refreshable === true ? this.renderRefreshControl() : null}

                {...this.props}
                style={this.props.style}
            />
        );
    }
}

const defaultStyles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: '#CCC'
    },
    actionsLabel: {
        fontSize: 20,
    },
    paginationView: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    defaultView: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    defaultViewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },

});
