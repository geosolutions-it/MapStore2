/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { get } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {createSelector, createStructuredSelector} from 'reselect';

import { removeAdditionalLayer } from '../actions/additionallayers';
import { configureMap } from '../actions/config';
import { toggleControl } from '../actions/controls';
import { zoomToExtent } from '../actions/map';
import {
    addMarker,
    cancelSelectedItem,
    changeActiveSearchTool,
    changeCoord,
    changeFormat,
    resetSearch,
    resultsPurge,
    searchTextChanged,
    selectSearchItem,
    showGFI,
    textSearch,
    updateResultsStyle,
    zoomAndAddPoint
} from '../actions/search';
import { setSearchBookmarkConfig } from '../actions/searchbookmarkconfig';
import SearchBarComp from '../components/mapcontrols/search/SearchBar';
import SearchResultListComp from '../components/mapcontrols/search/SearchResultList';
import {
    searchEpic,
    searchItemSelected,
    searchOnStartEpic,
    textSearchShowGFIEpic,
    zoomAndAddPointEpic
} from '../epics/search';
import mapInfoReducers from '../reducers/mapInfo';
import searchReducers from '../reducers/search';
import { layersSelector } from '../selectors/layers';
import {mapSelector, mapSizeValuesSelector} from '../selectors/map';
import ConfigUtils from '../utils/ConfigUtils';
import { defaultIconStyle } from '../utils/SearchUtils';
import ToggleButton from './searchbar/ToggleButton';
import {mapLayoutValuesSelector} from "../selectors/maplayout";
import {sidebarIsActiveSelector} from "../selectors/sidebarmenu";
import classnames from "classnames";

const searchSelector = createSelector([
    state => state.search || null,
    state => state.controls && state.controls.searchBookmarkConfig || null,
    state => state.mapConfigRawData || {},
    state => state?.searchbookmarkconfig || ''
], (searchState, searchBookmarkConfigControl, mapInitial, bookmarkConfig) => ({
    enabledSearchBookmarkConfig: searchBookmarkConfigControl && searchBookmarkConfigControl.enabled || false,
    error: searchState && searchState.error,
    coordinate: searchState && searchState.coordinate || {},
    loading: searchState && searchState.loading,
    searchText: searchState ? searchState.searchText : "",
    activeSearchTool: get(searchState, "activeSearchTool", "addressSearch"),
    format: get(searchState, "format") || ConfigUtils.getConfigProp("defaultCoordinateFormat"),
    selectedItems: searchState && searchState.selectedItems,
    mapInitial,
    bookmarkConfig: bookmarkConfig || {}
}));

const SearchBar = connect(searchSelector, {
    onSearch: textSearch,
    onChangeCoord: changeCoord,
    onChangeActiveSearchTool: changeActiveSearchTool,
    onClearCoordinatesSearch: removeAdditionalLayer,
    onClearBookmarkSearch: setSearchBookmarkConfig,
    onChangeFormat: changeFormat,
    onToggleControl: toggleControl,
    onZoomToPoint: zoomAndAddPoint,
    onPurgeResults: resultsPurge,
    onSearchReset: resetSearch,
    onSearchTextChange: searchTextChanged,
    onCancelSelectedItem: cancelSelectedItem,
    onZoomToExtent: zoomToExtent,
    onLayerVisibilityLoad: configureMap
})(SearchBarComp);

const selector = createSelector([
    mapSelector,
    layersSelector,
    state => state.search || null
], (mapConfig, layers, searchState) => ({
    mapConfig,
    layers,
    results: searchState ? searchState.results : null
}));

const SearchResultList = connect(selector, {
    onItemClick: selectSearchItem,
    addMarker,
    showGFI
})(SearchResultListComp);

/**
 * Search plugin. Provides search functionalities for the map.
 * <br> Allows to display results and place them on the map. Supports nominatim and WFS as search protocols
 * <br> You can configure the services and each service can trigger a nested search.
 * @example
 * {
 *  "name": "Search",
 *  "cfg": {
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
 *              // custom style for LineString, it overrides default/general style (optional)
 *          },
 *          "MultiLineString": {
 *              // custom style for MultiLineString, it overrides default/general style (optional)
 *          },
 *          "Polygon": {
 *              // custom style for Polygon, it overrides default/general style (optional)
 *          },
 *          "MultiPolygon": {
 *              // custom style for MultiPolygon, it overrides default/general style (optional)
 *          }
 *      }
 *    }
 *  }
 * }
 * @class Search
 * @memberof plugins
 * @prop {boolean} [cfg.showOptions=true] shows the burger menu in the input field
 * @prop {string} [cfg.activeSearchTool=addressSearch] default search tool. Values are "addressSearch", "coordinatesSearch", "bookmarkSearch"
 * @prop {boolean} [cfg.showCoordinatesSearchOption=true] shows the menu item to switch to the coordinate editor
 * @prop {boolean} [cfg.showAddressSearchOption=true]  shows the menu item to switch to the address editor
 * @prop {boolean} [cfg.showBookMarkSearchOption=true]  shows the menu item to switch to the bookmark selector
 * You can configure the bookmarks and each bookmark can trigger a zoomToExtent or Layer visibility reload based on the options set while configuring
 * @prop {object} cfg.searchOptions initial search options
 * @prop {object} cfg.maxResults number of max items present in the result list
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
 *  "type": "wfs",
 *  "priority": 3,
 *  "displayName": "${properties.propToDisplay}",
 *  "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
 *  "options": {
 *    "url": "/geoserver/wfs",
 *    "typeName": "workspace:layer",
 *    "queriableAttributes": ["attribute_to_query"],
 *    "sortBy": "id",
 *    "srsName": "EPSG:4326",
 *    "maxFeatures": 20,
 *    "blacklist": [... an array of strings to exclude from the final search filter ]
 * },
 *  "nestedPlaceholder": "Write other text to refine the search...",
 *  "nestedPlaceholderMsgId": "id contained in the localization files i.e. search.nestedplaceholder",
 *  "then": [ ... an array of services to use when one item of this service is selected],
 *  "geomService": { optional service to retrieve the geometry }
 *
 * ```
 * A service may have nested services. This allows you to search in several steps,
 * </br> (e.g. *search for a street and in the next step search for the street number.*)
 * </br>When a service has nested services it needs some additional configurations, like `nestedPlaceholder` and `then`
* @prop {string} cfg.searchOptions.services[].nestedPlaceholder the placeholder will be displayed in the input text, after you have performed the first search.
* @prop {object[]} cfg.searchOptions.services[].then is the mandatory property to configure the nested service(s). Every object in array. When a entry is selected from the parent service, then the search bar will use these services for the next step (also in this case performed by `priority` order).
 * To get  information from the item selected in the parent service, you can use `staticFilter` property (for WFS) as a template to complete the CQL_FILTER of the nested service (see the example below). _TODO: this is limited to WFS. For custom services it may be useful to pass the whole item selected to the nested service_.

 * ```
 * {
 *  "nestedPlaceholder": "the placeholder will be displayed in the input text, after you have performed the first search",
 *  "then": [{
 *    "type": "wfs",
 *    "priority": 1,
 *    "displayName": "${properties.propToDisplay} ${properties.propToDisplay}",
 *    "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
 *    "searchTextTemplate": "${properties.propToDisplay}",
 *    "options": {
 *      "staticFilter": " AND SOMEPROP = '${properties.OLDPROP}'", // will be appended to the original filter, it gets the properties of the current selected item (of the parent service)
 *      "url": "/geoserver/wfs",
 *      "typeName": "workspace:layer",
 *      "queriableAttributes": ["attribute_to_query"],
 *      "srsName": "EPSG:4326",
 *       "maxFeatures": 10
 *     }
 *  }]
 * }
 *
 * ```
 * **note:** `staticFilter` is valid for every service (even not nested), but the service it is nested,
 * it can be used as a template to pass values from the item selected in the parent service to complete this filter
 * that will be appended to the usual ilike filter used for searching text (wfs only)
 * <br/>
 * <br/>
 * **note:** `searchTextTemplate` used to complete the text when an item is selected.
 * (e.g. *I type "ro", I select an entry relative to "rome" and I want that the final text in search is "rome".*
 * Can be used for every service that is a leaf (so it doesn't contain any nested service)
* <br/> <br/> Nested services can be used also with **custom service**, that allow you to define your remote service for text search,
in this case you will need to write your own service, to require the data to remote API
<br/>
<br/>
An example to require the data api:

```
* const {API} = require('../../MapStore2/web/client/api/searchText');

*function myRoads(text, options) {
*    axios.get(`/myService?text=${text}`).then(( results ) => {
*              // results are [{title: "text", description: "description"}]
*              return results.map((item) => ({
*                        "type": "Feature",
*                        "properties": {
*                            "title": item.title,
*                            "description": item.description
*                        }
*                    })
*    })
* }
* API.Utils.setService("myRoads", myRoads);
```
*the myRoads service, must be a function, with this params:
*
* - text: the text to search
* - options: the configurations of the service (like protocol, host, pathname, lang)
*
* the function return a promise, that must emit an array of geoJSON features,
* if the geometry is not in the result, is possible to use the **geomService**.
* GeomService is a service like other, that use  same properties to retrive the geometry of the selected result.
*
*<br>
*an example of custom service with geomService
*<br>
```
"then" : [
                {
                  "type": "custom Service Name",
                  "searchTextTemplate": "${properties.propToDisplay}",
                  "displayName": "${properties.propToDisplay}",
                  "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
                  "options": {
                    "pathname": "/path/to/service",
                    "idVia": "${properties.code}"
                  },
                "priority": 2,
                "geomService" : {
                  "type": "wfs",
                  "options": {
                    "url": "/geoserver/wfs",
                    "typeName":  "workspace:layer",
                    "srsName": "EPSG:4326",
                    "staticFilter": "ID = ${properties.code}"
                  }
                }
              }]
```

 * @prop {string} cfg.searchOptions.services[].launchInfoPanel this is used to trigger get feature requests once a record is selected after a search.
 * it has the following values:
 * - undefined | not configured, it does not perform the GFI request
 * Note that, in the following cases, the point used for GFI request is a point on surface of the geometry of the selected record
 * - "single_layer", it performs the GFI request for one layer only with only that record as a result, info_format is forced to be application/json
 * - "all_layers", it performs the GFI for all layers, as a normal GFI triggered by clicking on the map
 */
const SearchPlugin = connect((state) => ({
    enabled: state.controls && state.controls.search && state.controls.search.enabled || false,
    selectedServices: state && state.search && state.search.selectedServices,
    selectedItems: state && state.search && state.search.selectedItems,
    textSearchConfig: state && state.searchconfig && state.searchconfig.textSearchConfig
}), {
    onUpdateResultsStyle: updateResultsStyle
})(
    class extends React.Component {
    static propTypes = {
        splitTools: PropTypes.bool,
        showOptions: PropTypes.bool,
        isSearchClickable: PropTypes.bool,
        fitResultsToMapSize: PropTypes.bool,
        searchOptions: PropTypes.object,
        resultsStyle: PropTypes.object,
        selectedItems: PropTypes.array,
        selectedServices: PropTypes.array,
        userServices: PropTypes.array,
        withToggle: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
        enabled: PropTypes.bool,
        textSearchConfig: PropTypes.object,
        style: PropTypes.object,
        sidebarIsActive: PropTypes.bool
    };

    static defaultProps = {
        searchOptions: {
            services: [{type: "nominatim", priority: 5}]
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
        enabled: true,
        style: {},
        sidebarIsActive: false
    };

    componentDidMount() {
        this.props.onUpdateResultsStyle({...defaultIconStyle, ...this.props.resultsStyle});
    }

    getServiceOverrides = (propSelector) => {
        return this.props.selectedItems && this.props.selectedItems[this.props.selectedItems.length - 1] && get(this.props.selectedItems[this.props.selectedItems.length - 1], propSelector);
    };

    getSearchOptions = () => {
        const { searchOptions, textSearchConfig } = this.props;
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

    searchFitToTheScreen = () => {
        const { offsets: { right: rightOffset, left: leftOffset}, mapSize: { width: mapWidth = window.innerWidth } } = this.props;
        // @todo make searchbar width configurable via configuration?
        return (mapWidth - rightOffset - leftOffset - 60) >= 500;
    }

    getSearchAndToggleButton = () => {
        const search = (<SearchBar
            key="searchBar"
            {...this.props}
            searchOptions={this.getCurrentServices()}
            placeholder={this.getServiceOverrides("placeholder")}
            placeholderMsgId={this.getServiceOverrides("placeholderMsgId")}
        />);
        return (
            !this.searchFitToTheScreen() ?
                (
                    <>
                        <ToggleButton/>
                        {this.props.enabled ? search : null}
                    </>
                ) : (search)
        );
    };

    render() {
        return (<span
            id="search-bar-container"
            className={classnames({
                'toggled': !this.searchFitToTheScreen(),
                'no-sidebar': !this.props.sidebarIsActive
            })}
            style={ this.props.sidebarIsActive ? this.props.style : null}>
            {this.getSearchAndToggleButton()}
            <SearchResultList
                fitToMapSize={this.props.fitResultsToMapSize}
                searchOptions={this.props.searchOptions}
                onUpdateResultsStyle={this.props.onUpdateResultsStyle}
                key="nominatimresults"/>
        </span>)
        ;
    }
    });

export default {
    SearchPlugin: assign(
        connect(createStructuredSelector({
            style: state => mapLayoutValuesSelector(state, { right: true }),
            offsets: state => mapLayoutValuesSelector(state, { right: true, left: true }),
            mapSize: state => mapSizeValuesSelector({ width: true })(state),
            sidebarIsActive: state => sidebarIsActiveSelector(state)
        }), {})(SearchPlugin), {
            OmniBar: {
                name: 'search',
                position: 1,
                tool: true,
                priority: 1
            }
        }),
    epics: {searchEpic, searchOnStartEpic, searchItemSelected, zoomAndAddPointEpic, textSearchShowGFIEpic},
    reducers: {
        search: searchReducers,
        mapInfo: mapInfoReducers
    }
};
