/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const {connect} = require('react-redux');
const {loadMaps, mapsSearchTextChanged} = require('../actions/maps');
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
* @param {boolean} [showOptions=true] shows the burger menu in the input field
* @param {string} [activeSearchTool=addressSearch] default search tool. Values are "addressSearch", "coordinatesSearch"
* @param {boolean} [showCoordinatesSearchOption=true] shows the menu item to switch to the coordinate editor
* @param {boolean} [showAddressSearchOption=true]  shows the menu item to switch to the address editor
* @param {boolean} [enabledSearchServicesConfig=false] shows the menu item to open the custom search services config
* @example
* {
*   "name": "MapSearch",
*   "cfg": {
*     "splitTools": true,
*     "showOptions": true,
*     "activeSearchTool": "addressSearch",
*     "showCoordinatesSearchOption": true,
*     "showAddressSearchOption": true,
*     "enabledSearchServicesConfig": false
*   }
* }
*/
const SearchBar = connect((state) => ({
    className: "maps-search",
    hideOnBlur: false,
    placeholderMsgId: "maps.search",
    typeAhead: false,
    splitTools: false,
    showOptions: false,
    isSearchClickable: true,
    start: state && state.maps && state.maps.start,
    limit: state && state.maps && state.maps.limit,
    searchText: state.maps && state.maps.searchText !== '*' && state.maps.searchText || ""
}), {
    onSearchTextChange: mapsSearchTextChanged,
    onSearch: (text, options) => {
        let searchText = text && text !== "" ? text : ConfigUtils.getDefaults().initialMapFilter || "*";
        return loadMaps(ConfigUtils.getDefaults().geoStoreUrl, searchText, options);
    },
    onSearchReset: (...params) => loadMaps(ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || "*", ...params)
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
        onSearchTextChange: dispatchProps.onSearchTextChange
    };
})(require("../components/mapcontrols/search/SearchBar"));

module.exports = {
    MapSearchPlugin: SearchBar,
    reducers: {maps: require('../reducers/maps')}
};
