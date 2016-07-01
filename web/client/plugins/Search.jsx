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

const {textSearch, resultsPurge} = require("../actions/search");
const {changeMapView} = require('../actions/map');

const SearchBar = connect(() => ({}), {
    onSearch: textSearch,
    onSearchReset: resultsPurge
})(require("../components/mapcontrols/search/SearchBar"));

const {mapSelector} = require('../selectors/map');
const {isArray} = require('lodash');

const MediaQuery = require('react-responsive');

const selector = createSelector([
    mapSelector,
    state => state.search || null
], (mapConfig, results) => ({
    mapConfig,
    results
}));

const NominatimResultList = connect(selector, {
    onItemClick: changeMapView,
    afterItemClick: resultsPurge
})(require('../components/mapcontrols/search/geocoding/NominatimResultList'));

const ToggleButton = require('./searchbar/ToggleButton');

const SearchPlugin = connect((state) => ({
    enabled: state.controls && state.controls.search && state.controls.search.enabled || false
}))(React.createClass({
    propTypes: {
        withToggle: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.array]),
        enabled: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
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
                <NominatimResultList key="nominatimresults"/>
            </span>
        );
    }
}));

module.exports = {
    SearchPlugin: assign(SearchPlugin, {
        OmniBar: {
            name: 'search',
            position: 1,
            tool: true,
            priority: 1
        }
    }),
    reducers: {search: require('../reducers/search')}
};
