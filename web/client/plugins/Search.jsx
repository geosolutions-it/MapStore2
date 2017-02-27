/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const assign = require('object-assign');

const HelpWrapper = require('./help/HelpWrapper');
const Message = require('./locale/Message');

const {resultsPurge, resetSearch, addMarker, searchTextChanged, textSearch, selectSearchItem} = require("../actions/search");

const searchSelector = createSelector([
    state => state.search || null
], (searchState) => ({
    error: searchState && searchState.error,
    loading: searchState && searchState.loading,
    searchText: searchState ? searchState.searchText : ""
}));

const SearchBar = connect(searchSelector, {
    // ONLY FOR SAMPLE - The final one will get from state and simply call textSearch
    onSearch: textSearch,
    onPurgeResults: resultsPurge,
    onSearchReset: resetSearch,
    onSearchTextChange: searchTextChanged
})(require("../components/mapcontrols/search/SearchBar"));

const {mapSelector} = require('../selectors/map');
const {isArray} = require('lodash');

const MediaQuery = require('react-responsive');

const selector = createSelector([
    mapSelector,
    state => state.search || null
], (mapConfig, searchState) => ({
    mapConfig,
    results: searchState ? searchState.results : null
}));

const SearchResultList = connect(selector, {
    onItemClick: selectSearchItem,
    addMarker: addMarker
})(require('../components/mapcontrols/search/SearchResultList'));

const ToggleButton = require('./searchbar/ToggleButton');

const SearchPlugin = connect((state) => ({
    enabled: state.controls && state.controls.search && state.controls.search.enabled || false
}))(React.createClass({
    propTypes: {
        searchOptions: React.PropTypes.object,
        withToggle: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.array]),
        enabled: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            searchOptions: {
                services: [{type: "nominatim"}]
            },
            withToggle: false,
            enabled: true
        };
    },
    getSearchAndToggleButton() {
        const search = <SearchBar key="seachBar" {...this.props}/>;
        if (this.props.withToggle === true) {
            return [<ToggleButton/>].concat(this.props.enabled ? [search] : null);
        }
        if (isArray(this.props.withToggle)) {
            return (
                    <span><MediaQuery query={"(" + this.props.withToggle[0] + ")"}>
                        <ToggleButton/>
                        {this.props.enabled ? search : null}
                    </MediaQuery>
                    <MediaQuery query={"(" + this.props.withToggle[1] + ")"}>
                        {search}
                    </MediaQuery>
                </span>
            );
        }
        return search;
    },
    render() {
        return (<span>
            <HelpWrapper
                id="search-help"
                key="seachBar-help"
                    helpText={<Message msgId="helptexts.searchBar"/>}>
                    {this.getSearchAndToggleButton()}
                </HelpWrapper>
                <SearchResultList searchOptions={this.props.searchOptions} key="nominatimresults"/>
            </span>
        );
    }
}));
const {searchEpic, searchItemSelected} = require('../epics/search');
module.exports = {
    SearchPlugin: assign(SearchPlugin, {
        OmniBar: {
            name: 'search',
            position: 1,
            tool: true,
            priority: 1
        }
    }),
    epics: [searchEpic, searchItemSelected],
    reducers: {
        search: require('../reducers/search'),
        mapInfo: require('../reducers/mapInfo')
    }
};
