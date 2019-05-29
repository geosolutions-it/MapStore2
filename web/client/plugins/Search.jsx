const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
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

const {get, isArray} = require('lodash');

const {resultsPurge, resetSearch, addMarker, searchTextChanged, textSearch, selectSearchItem, cancelSelectedItem} = require("../actions/search");

const searchSelector = createSelector([
    state => state.search || null
], (searchState) => ({
    error: searchState && searchState.error,
    loading: searchState && searchState.loading,
    searchText: searchState ? searchState.searchText : "",
    selectedItems: searchState && searchState.selectedItems
}));

const SearchBar = connect(searchSelector, {
    // ONLY FOR SAMPLE - The final one will get from state and simply call textSearch
    onSearch: textSearch,
    onPurgeResults: resultsPurge,
    onSearchReset: resetSearch,
    onSearchTextChange: searchTextChanged,
    onCancelSelectedItem: cancelSelectedItem
})(require("../components/mapcontrols/search/SearchBar"));

const {mapSelector} = require('../selectors/map');

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

/**
 * Search plugin. Provides search functionalities for the map.
 * Allows to display results and place them on the map. Supports nominatim and WFS as search protocols
 * You can configure the services and each service can trigger a nested search.
 *
 * @example
 * {
 *  "name": "Search",
 *  "cfg": {
 *      "withToggle": ["max-width: 768px", "min-width: 768px"],
 *      "resultsStyle": {
 *          "iconUrl": "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
 *          "shadowUrl": "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
 *          "iconSize": [25, 41],
 *          "iconAnchor": [12, 41],
 *          "popupAnchor": [1, -34],
 *          "shadowSize": [41, 41],
 *          "color": "#ff0000",
 *          "weight": 4,
 *          "dashArray": "",
 *          "fillColor": "#3388ff",
 *          "fillOpacity": 0.2,
 *          "LineString": {
 *              // custom style for LineString, it overrides deafult/general style (optional)
 *          },
 *          "MultiLineString": {
 *              // custom style for MultiLineString, it overrides deafult/general style (optional)
 *          },
 *          "Polygon": {
 *              // custom style for Polygon, it overrides deafult/general style (optional)
 *          },
 *          "MultiPolygon": {
 *              // custom style for MultiPolygon, it overrides deafult/general style (optional)
 *          }
 *      }
 *    }
 *  }
 * }
 * @class Search
 * @memberof plugins
 * @prop {object} cfg.searchOptions initial search options
 * @prop {object} cfg.resultsStyle custom style for search results
 * @prop {bool} cfg.fitResultsToMapSize true by default, fits the result list to the mapSize (can be disabled, for custom uses)
 * @prop {searchService[]} cfg.searchOptions.services a list of services to perform search.
 * a **nominatim** search service look like this:
 * ```
 * {
 *  "type": "nominatim",
 *  "searchTextTemplate": "${properties.display_name}", // text to use as searchText when an item is selected. Gets the result properties.
 *  "options": {
 *    "polygon_geojson": 1,
 *    "limit": 3
 *  }
 * ```
 *
 * a **wfs** service look like this:
 * ```
 * {
 *      "type": "wfs",
 *      "priority": 2,
 *      "displayName": "${properties.propToDisplay}",
 *      "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
 *      "options": {
 *        "url": "/geoserver/wfs",
 *        "typeName": "workspace:layer",
 *        "queriableAttributes": ["attribute_to_query"],
 *        "sortBy": "ID",
 *        "srsName": "EPSG:4326",
 *        "maxFeatures": 4,
 *        "blacklist": [... an array of strings to exclude from the final search filter ]
 *      },
 *      "nestedPlaceholder": "Write other text to refine the search...",
 *      "nestedPlaceholderMsgId": "id contained in the localization files i.e. search.nestedplaceholder",
 *      "then": [ ... an array of services to use when one item of this service is selected],
 *      "geomService": { optional service to retrieve the geometry}
 *  }
 *
 * ```
 * The typical nested service needs to have some additional parameters:
 * ```
 * {
 *     "type": "wfs",
 *     "filterTemplate": " AND SOMEPROP = '${properties.OLDPROP}'", // will be appended to the original filter, it gets the properties of the current selected item (of the parent service)
 *     "options": {
 *       ...
 *     }
 * }
 * ```
 * **note:** `searchTextTemplate` is useful to populate the search text input when a search result is selected, typically with "leaf" services.
 * @prop {array|boolean} cfg.withToggle when boolean, true uses a toggle to display the searchbar. When array, e.g  `["max-width: 768px", "min-width: 768px"]`, `max-width` and `min-width` are the limits where to show/hide the toggle (useful for mobile)
 */
const SearchPlugin = connect((state) => ({
    enabled: state.controls && state.controls.search && state.controls.search.enabled || false,
    selectedServices: state && state.search && state.search.selectedServices,
    selectedItems: state && state.search && state.search.selectedItems,
    textSearchConfig: state && state.searchconfig && state.searchconfig.textSearchConfig
}))(
class extends React.Component {
    static propTypes = {
        splitTools: PropTypes.bool,
        isSearchClickable: PropTypes.bool,
        fitResultsToMapSize: PropTypes.bool,
        searchOptions: PropTypes.object,
        resultsStyle: PropTypes.object,
        selectedItems: PropTypes.array,
        selectedServices: PropTypes.array,
        userServices: PropTypes.array,
        withToggle: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
        enabled: PropTypes.bool,
        textSearchConfig: PropTypes.object
    };

    static defaultProps = {
        searchOptions: {
            services: [{type: "nominatim"}]
        },
        isSearchClickable: false,
        splitTools: true,
        resultsStyle: {
            color: '#3388ff',
            weight: 4,
            dashArray: '',
            fillColor: '#3388ff',
            fillOpacity: 0.2
        },
        fitResultsToMapSize: true,
        withToggle: false,
        enabled: true
    };

    getServiceOverrides = (propSelector) => {
        return this.props.selectedItems && this.props.selectedItems[this.props.selectedItems.length - 1] && get(this.props.selectedItems[this.props.selectedItems.length - 1], propSelector);
    };

    getSearchOptions = () => {
        const{ searchOptions, textSearchConfig} = this.props;
        if (textSearchConfig && textSearchConfig.services && textSearchConfig.services.length > 0) {
            return textSearchConfig.override ? assign({}, searchOptions, {services: textSearchConfig.services}) : assign({}, searchOptions, {services: searchOptions.services.concat(textSearchConfig.services)});
        }
        return searchOptions;
    };

    getCurrentServices = () => {
        const {selectedServices} = this.props;
        const searchOptions = this.getSearchOptions();
        return selectedServices && selectedServices.length > 0 ? assign({}, searchOptions, {services: selectedServices}) : searchOptions;
    };

    getSearchAndToggleButton = () => {
        const search = (<SearchBar
            key="seachBar"
            {...this.props}
            searchOptions={this.getCurrentServices()}
            placeholder={this.getServiceOverrides("placeholder")}
            placeholderMsgId={this.getServiceOverrides("placeholderMsgId")}
            />);
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
    };

    render() {
        return (<span>
            <HelpWrapper
                id="search-help"
                key="seachBar-help"
                    helpText={<Message msgId="helptexts.searchBar"/>}>
                    {this.getSearchAndToggleButton()}
                </HelpWrapper>
                <SearchResultList fitToMapSize={this.props.fitResultsToMapSize} searchOptions={this.props.searchOptions} resultsStyle={this.props.resultsStyle} key="nominatimresults"/>
            </span>)
        ;
    }
});
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
    epics: {searchEpic, searchItemSelected},
    reducers: {
        search: require('../reducers/search'),
        mapInfo: require('../reducers/mapInfo')
    }
};
