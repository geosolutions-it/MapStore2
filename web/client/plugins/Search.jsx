/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const HelpWrapper = require('./help/HelpWrapper');
const Message = require('./locale/Message');

const {textSearch, resultsPurge} = require("../actions/search");
const {changeMapView} = require('../actions/map');

const SearchBar = connect(() => ({}), {
    onSearch: textSearch,
    onSearchReset: resultsPurge
})(require("../components/mapcontrols/search/SearchBar"));

const NominatimResultList = connect((state) => ({
    results: state.search || null,
    mapConfig: state.map && state.map.present || {}
}), {
    onItemClick: changeMapView,
    afterItemClick: resultsPurge
})(require('../components/mapcontrols/search/geocoding/NominatimResultList'));

const SearchPlugin = React.createClass({
     render() {
         return (<span>
            <HelpWrapper
                key="seachBar-help"
                helpText={<Message msgId="helptexts.searchBar"/>}>
                    <SearchBar key="seachBar" {...this.props}/>
                </HelpWrapper>
                <NominatimResultList key="nominatimresults"/>
            </span>
        );
     }
});

module.exports = {
    SearchPlugin,
    reducers: {search: require('../reducers/search')}
};
