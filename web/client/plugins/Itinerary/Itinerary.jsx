/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';

import usePluginItems from '../../hooks/usePluginItems';
import { setControlProperty, toggleControl } from '../../actions/controls';
import { mapLayoutValuesSelector } from '../../selectors/maplayout';
import { createPlugin } from '../../utils/PluginsUtils';
import Message from '../../components/I18N/Message';
import ItineraryContainer from './containers/Itinerary';
import { CONTROL_NAME } from './constants';
import  * as epics from '../../epics/itinerary';
import itinerary from "./reducers/itinerary";
import {
    enabledSelector,
    searchResultsSelector,
    searchLoadingSelector,
    locationsSelector,
    itineraryDataSelector,
    itineraryLoadingSelector
} from './selectors/itinerary';
import {
    addAsLayer,
    resetItinerary,
    searchByLocationNameByIndex,
    selectLocationFromMap,
    setItineraryError,
    setItineraryLoading,
    triggerItineraryRun,
    updateLocations
} from './actions/itinerary';

/**
 * Itinerary plugin that provides route planning functionality
 * @memberof plugins
 * @class
 * @name Itinerary
 * @param {string} cfg.providerName - The name of the provider. Default is `GraphHopper`.
 * @param {number} cfg.defaultWaypointsLimit - The default search limit. Default is `5`.
 * @param {Object} cfg.config - The config of the itinerary.
 * @example
 * ```json
 * {
 *     "name": "Itinerary",
 *     "cfg": {
 *         "providerName": "GraphHopper",
 *         "defaultWaypointsLimit": 5,
 *         "config": {
 *             "url": "provider_url",
 *             "key": "provider_key"
 *             // other provider specific options
 *         }
 *     }
 * }
 * ```
 *
 * Configure a custom provider as follows:
 * 1. Create a plugin component for the custom provider (Take reference from GraphHopperProvider)
 * 2. Register the provider api as follows from the custom provider with custom functions.
 * ```js
 * registerApi(PROVIDER_NAME, {
 *     getDirections, // API call function to fetch route details
 * });
 * ```
 * 3. The itinerary response data should be parsed in the custom provider with the following format:
 * ```js
 * {
 *     routes: [ // multiple routes
 *         [ // instruction for the route
 *             {
 *                 text: 'Continue onto Main Street',
 *                 streetName: 'Main Street',
 *                 sign: '1', // sign for the route. Refer to RouteDetail for the expected format
 *                 distance: 100, // distance for the route
 *                 time: 100 // time for the route
 *             }
 *         ]
 *     ],
 *     features: [],
 *     style: {}
 * };
 * ```
 *
 * // Direction sign indicators:
 * // -98: U-turn without knowledge of right/left direction
 * // -8:  Left U-turn
 * // -7:  Keep left
 * // -3:  Turn sharp left
 * // -2:  Turn left
 * // -1:  Turn slight left
 * // 0:   Continue on street
 * // 1:   Turn slight right
 * // 2:   Turn right
 * // 3:   Turn sharp right
 * // 4:   Finish instruction before the last point
 * // 5:   Instruction before a via point
 * // 6:   Instruction before entering a roundabout
 * // 7:   Keep right
 * // 8:   Right U-turn
 *
 * 4. Register the provider plugin in the mapstore plugin
 * 5. Add provider plugin to the localConfig
 *
 * Example:
 * In localConfig:
 * ```json
 * {
 *   {
 *       "name": "Itinerary",
 *       "cfg": {
 *       "providerName": "ItineraryProvider",
 *       "defaultWaypointsLimit": 5,
 *       "config": {
 *         "url": "provider_url",
 *         "key": "provider_key"
 *       }
 *   },
 *   {
 *       "name": "ItineraryProvider",
 *   }
 * }
 * ```
 */
const Itinerary = ({
    items,
    onSearchByLocationName,
    onItineraryRun,
    onActive,
    onUpdateLocations,
    onSelectLocationFromMap,
    onAddAsLayer,
    onResetItinerary,
    onError,
    ...props
}, context) => {

    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });

    return (
        <ItineraryContainer
            {...props}
            configuredItems={configuredItems}
            onItineraryRun={onItineraryRun}
            onActive={onActive}
            onSearchByLocationName={onSearchByLocationName}
            onUpdateLocations={onUpdateLocations}
            onSelectLocationFromMap={onSelectLocationFromMap}
            onAddAsLayer={onAddAsLayer}
            onResetItinerary={onResetItinerary}
            onError={onError}
        />
    );
};

Itinerary.contextTypes = {
    loadedPlugins: PropTypes.object
};

const itineraryConnect = connect(
    createStructuredSelector({
        active: enabledSelector,
        dockStyle: state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
        searchResults: searchResultsSelector,
        searchLoading: searchLoadingSelector,
        locations: locationsSelector,
        itineraryData: itineraryDataSelector,
        itineraryLoading: itineraryLoadingSelector
    }),
    {
        onActive: setControlProperty.bind(null, CONTROL_NAME, "enabled"),
        onItineraryRun: triggerItineraryRun,
        onSearchByLocationName: searchByLocationNameByIndex,
        onUpdateLocations: updateLocations,
        onSelectLocationFromMap: selectLocationFromMap,
        setLoading: setItineraryLoading,
        onAddAsLayer: addAsLayer,
        onResetItinerary: resetItinerary,
        onError: setItineraryError
    }
);

const ItineraryComponent = itineraryConnect(Itinerary);

ItineraryComponent.propTypes = {
    items: PropTypes.array
};

export default createPlugin(
    'Itinerary',
    {
        options: {
            disablePluginIf: "{state('mapType') === 'leaflet'}"
        },
        component: ItineraryComponent,
        epics,
        reducers: {
            itinerary
        },
        containers: {
            SidebarMenu: {
                position: 2100,
                priority: 1,
                doNotHide: true,
                name: 'itinerary',
                text: <Message msgId="itinerary.title"/>,
                tooltip: "itinerary.tooltip",
                icon: <Glyphicon glyph="route" />,
                action: () => toggleControl(CONTROL_NAME),
                selector: (state) => {
                    return {
                        bsStyle: enabledSelector(state) ? 'primary' : 'tray',
                        active: enabledSelector(state) || false
                    };
                }
            }
        }
    }
);
