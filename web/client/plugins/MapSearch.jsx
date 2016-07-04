/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');


const {loadMaps} = require('../actions/maps');
const ConfigUtils = require('../utils/ConfigUtils');

const SearchBar = connect(() => ({
    className: "maps-search",
    hideOnBlur: false,
    typeAhead: false
}), {
    onSearch: (text) => { return loadMaps(ConfigUtils.getDefaults().geoStoreUrl, (text && text !== "") ? ( "*" + text + "*") : ConfigUtils.getDefaults().initialMapFilter || "*" ); },
    onSearchReset: loadMaps.bind(null, ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || "*")
})(require("../components/mapcontrols/search/SearchBar"));

module.exports = {
    MapSearchPlugin: SearchBar,
    reducers: {maps: require('../reducers/maps')}
};
