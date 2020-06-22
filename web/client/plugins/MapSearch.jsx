/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const {connect} = require('react-redux');
const {get} = require('lodash');
const {loadMaps, mapsSearchTextChanged, searchFilterChanged, searchFilterClearAll, loadContexts} = require('../actions/maps');
const {searchFilterSelector, contextsSelector, loadFlagsSelector} = require('../selectors/maps');
const {toggleControl} = require('../actions/controls');
const ConfigUtils = require('../utils/ConfigUtils');
/**
* MapSearch Plugin is a plugin that allows to make a search, reset its content, show a loading spinner while search is going on and can be
* used for different purpose (maps, wfs services)
* @name MapSearch
* @memberof plugins
* @class
* @param {boolean} [splitTools=true] used to separate search and remove buttons in toolbar,
<br>if true and without text => you see only search
<br>if true and with text => search is substituted with remove
<br>if false and without text => you see only search
<br>if false and with text => you see both (search and remove)
* @param {boolean} [showContextSearchOption=true] used to show context search option
* @example
* {
*   "name": "MapSearch",
*   "cfg": {
*     "splitTools": true,
 *     "showContextSearchOption": false
*   }
* }
*/
const SearchBar = connect((state) => ({
    className: "maps-search",
    placeholderMsgId: "maps.search",
    start: state && state.maps && state.maps.start,
    limit: state && state.maps && state.maps.limit,
    searchText: state.maps && state.maps.searchText !== '*' && state.maps.searchText || "",
    showAdvancedSearchPanel: state.controls && state.controls.advancedsearchpanel && state.controls.advancedsearchpanel.enabled || false,
    searchFilter: searchFilterSelector(state),
    contexts: contextsSelector(state),
    loadingContexts: get(loadFlagsSelector(state), 'loadingContexts'),
    loadingFilter: get(loadFlagsSelector(state), 'loadingMaps')
}), {
    onSearchTextChange: mapsSearchTextChanged,
    onToggleControl: toggleControl,
    onSearch: (text, options) => {
        let searchText = text && text !== "" ? text : ConfigUtils.getDefaults().initialMapFilter || "*";
        return loadMaps(ConfigUtils.getDefaults().geoStoreUrl, searchText, options);
    },
    onSearchReset: (...params) => loadMaps(ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || "*", ...params),
    onSearchFilterChange: searchFilterChanged,
    onSearchFilterClearAll: searchFilterClearAll,
    onLoadContexts: loadContexts
}, (stateProps, dispatchProps, ownProps) => {
    return {
        ...stateProps,
        ...ownProps,
        onSearch: (text) => {
            let limit = stateProps.limit;
            dispatchProps.onSearch(text, {start: 0, limit});
        },
        onSearchReset: () => {
            dispatchProps.onSearchReset({start: 0, limit: stateProps.limit});
        },
        onSearchTextChange: dispatchProps.onSearchTextChange,
        onToggleControl: dispatchProps.onToggleControl,
        onSearchFilterChange: dispatchProps.onSearchFilterChange,
        onSearchFilterClearAll: dispatchProps.onSearchFilterClearAll,
        onLoadContexts: dispatchProps.onLoadContexts
    };
})(require("../components/maps/search/SearchBar").default);

module.exports = {
    MapSearchPlugin: SearchBar,
    reducers: {maps: require('../reducers/maps')}
};
