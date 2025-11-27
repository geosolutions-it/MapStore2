/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";
import React from "react";
import { Glyphicon } from "react-bootstrap";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import { createPlugin } from "../../utils/PluginsUtils";
import usePluginItems from "../../hooks/usePluginItems";
import Message from "../../components/I18N/Message";
import { setControlProperty, toggleControl } from "../../actions/controls";
import { mapLayoutValuesSelector } from "../../selectors/maplayout";

import { CONTROL_NAME } from "./constants";
import * as epics from "./epics/isochrone";
import {
    enabledSelector,
    isochroneCurrentRunParametersSelector,
    isochroneDataSelector,
    isochroneLoadingSelector,
    isochroneLocationSelector,
    searchLoadingSelector,
    searchResultsSelector
} from "./selectors/isochrone";
import {
    addAsLayer,
    deleteIsochroneData,
    initPlugin,
    resetIsochrone,
    searchByLocationName,
    selectLocationFromMap,
    setCurrentRunParameters,
    setIsochroneError,
    setIsochroneLoading,
    triggerIsochroneRun,
    updateLocation
} from "./actions/isochrone";
import isochrone from "./reducers/isochrone";
import IsochroneContainer from "./containers/Isochrone";
import { mergeOptionsById, removeAdditionalLayer } from "../../actions/additionallayers";

/**
 * Isochrone plugin that provides route planning functionality
 * @memberof plugins
 * @class
 * @name Isochrone
 * @param {string} cfg.providerName - The name of the provider. Default is `GraphHopper`.
 * @param {Object} cfg.providerApiConfig - The provider api config of the isochrone.
 * @param {Object} cfg.providerApiConfig.url - The url of the provider.
 * @param {Object} cfg.providerApiConfig.key - The key of the provider.
 * @param {Object} cfg.searchConfig - The search config of the isochrone.
 * @param {Object} cfg.searchConfig.displayName - The display name path for the search response.
 * @param {Object} cfg.searchConfig.services - The services of the search config.
 * @param {Object} cfg.searchConfig.services[].type - The type of the service.
 * @param {Object} cfg.searchConfig.services[].options - The options of the service.
 * @param {Object} cfg.searchConfig.services[].priority - The priority of the service.
 * @param {Object} cfg.searchConfig.maxResults - The max results of the search config.
 * @example
 * ```json
 * {
 *     "name": "Isochrone",
 *     "cfg": {
 *         "providerName": "GraphHopper",
 *         "providerApiConfig": {
 *             "url": "provider_url",
 *             "key": "provider_key"
 *             // other provider specific options
 *         },
 *         "searchConfig": {
 *             "displayName": "properties.display_name",
 *             "services": [
 *                 {
 *                     "type": "nominatim",
 *                     "priority": 5,
 *                     "options": {
 *                         "limit": 10,
 *                         "polygon_geojson": 1,
 *                         "format": "json"
 *                     }
 *                 }
 *             ],
 *             "maxResults": 10
 *         }
 *     }
 * }
 * ```
 *
 * Configure a custom provider (PLUGIN) as follows: (Same pattern applies when creating an extension)
 * 1. Create a plugin component for the custom provider (Take reference from GraphHopperProvider)
 * 2. Register the provider api as follows from the custom provider with custom functions.
 * ```js
 * registerApi(PROVIDER_NAME, {
 *     getIsochrones, // API call function to fetch isochrones
 * });
 * ```
 * 3. The isochrone response/config data should be parsed in the custom provider in the following format:
 *  - "distanceLimit": distance limit for the isochrone. distance limit is in meters.
 *  - "timeLimit": time limit for the isochrone. time limit is in seconds.
 * ```js
 * {
 *     distanceLimit: 100,
 *     timeLimit: 100
 * };
 * ```
 *
 * 4. Register the provider plugin in the mapstore plugin
 * 5. Add provider plugin to the localConfig
 *
 * Example:
 * In localConfig:
 * ```json
 * {
 *   {
 *       "name": "Isochrone",
 *       "cfg": {
 *           "providerName": "CustomIsochroneProvider",
 *           "providerApiConfig": {
 *              "url": "provider_url",
 *             "key": "provider_key"
 *           }
 *       }
 *   },
 *   {
 *       "name": "CustomIsochroneProvider",
 *   }
 * }
 * ```
 */
const Isochrone = ({
    items,
    ...props
}, context) => {

    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });

    return (
        <IsochroneContainer
            {...props}
            configuredItems={configuredItems}
        />
    );
};

Isochrone.contextTypes = {
    loadedPlugins: PropTypes.object
};

const isochroneConnect = connect(
    createStructuredSelector({
        active: enabledSelector,
        dockStyle: state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
        searchResults: searchResultsSelector,
        searchLoading: searchLoadingSelector,
        location: isochroneLocationSelector,
        isochroneData: isochroneDataSelector,
        isochroneLoading: isochroneLoadingSelector,
        isochroneCurrentParameters: isochroneCurrentRunParametersSelector
    }),
    {
        onActive: setControlProperty.bind(null, CONTROL_NAME, "enabled"),
        onIsochroneRun: triggerIsochroneRun,
        onSearchByLocationName: searchByLocationName,
        onUpdateLocation: updateLocation,
        onSelectLocationFromMap: selectLocationFromMap,
        onSetLoading: setIsochroneLoading,
        onAddAsLayer: addAsLayer,
        onResetIsochrone: resetIsochrone,
        onError: setIsochroneError,
        onLayerPropertyChange: mergeOptionsById,
        onInitPlugin: initPlugin,
        onDeleteLayer: removeAdditionalLayer,
        onDeleteIsochroneData: deleteIsochroneData,
        onSetCurrentRunParameters: setCurrentRunParameters
    }
);

const IsochroneComponent = isochroneConnect(Isochrone);

IsochroneComponent.propTypes = {
    items: PropTypes.array
};

export default createPlugin(
    'Isochrone',
    {
        options: {},
        component: IsochroneComponent,
        epics,
        reducers: {
            isochrone
        },
        containers: {
            SidebarMenu: {
                position: 2100,
                priority: 1,
                doNotHide: true,
                name: 'isochrone',
                text: <Message msgId="isochrone.title"/>,
                tooltip: "isochrone.tooltip",
                icon: <Glyphicon glyph="1-point-dashed" />,
                action: () => toggleControl(CONTROL_NAME),
                selector: (state) => {
                    return {
                        bsStyle: enabledSelector(state) ? 'primary' : 'tray',
                        active: enabledSelector(state) || false
                    };
                }
            },
            BurgerMenu: {
                name: 'isochrone',
                position: 2100,
                doNotHide: true,
                text: <Message msgId="isochrone.title"/>,
                icon: <Glyphicon glyph="1-point-dashed" />,
                action: () => toggleControl(CONTROL_NAME),
                priority: 2
            }
        }
    }
);
