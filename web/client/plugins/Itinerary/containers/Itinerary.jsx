
import React, { useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';
import uuid from 'uuid';
import times from 'lodash/times';

import usePluginItems from '../../../hooks/usePluginItems';
import FlexBox from '../../../components/layout/FlexBox';
import ResponsivePanel from '../../../components/misc/panels/ResponsivePanel';
import { setControlProperty, toggleControl } from '../../../actions/controls';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import { createPlugin } from '../../../utils/PluginsUtils';
import Message from '../../../components/I18N/Message';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import { CONTROL_NAME, DEFAULT_PROVIDER, DRAGGABLE_CONTAINER_ID } from '../constants';
import  * as epics from '../../../epics/itinerary';
import itinerary from "../reducers/itinerary";
import {
    enabledSelector,
    searchResultsSelector,
    searchLoadingSelector,
    locationsSelector,
    itineraryDataSelector,
    itineraryLoadingSelector
} from '../selectors/itinerary';
import {
    addAsLayer,
    resetItinerary,
    searchByLocationNameByIndex,
    selectLocationFromMap,
    setItineraryError,
    setItineraryLoading,
    triggerItineraryRun,
    updateLocations
} from '../actions/itinerary';
import GraphHopperProvider from './Provider/GraphHopper';
import Waypoints from '../../../components/search/geosearchpicker';
import Text from '../../../components/layout/Text';
import RouteDetail from '../components/RouteDetail';
import ItineraryAction from '../components/ItineraryAction';

const defaultProviders = { [DEFAULT_PROVIDER]: GraphHopperProvider };
const getDefaultWaypoints = () => times(2, () => ({value: null, id: uuid()}));

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
    providerName = DEFAULT_PROVIDER,
    width = DEFAULT_PANEL_WIDTH,
    active,
    items,
    dockStyle,
    locations,
    config,
    defaultWaypointsLimit = 5,
    searchResults,
    searchLoading,
    itineraryLoading,
    setLoading,
    itineraryData,
    onSearchByLocationName,
    onItineraryRun,
    onActive,
    onUpdateLocations,
    onSelectLocationFromMap,
    onAddAsLayer,
    onResetItinerary,
    onError
}, context) => {

    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });

    const availableProviders = {
        ...defaultProviders,
        ...Object.fromEntries(
            configuredItems
                .filter(({ target }) => target === 'provider')
                .map((item) => [item.name, item.Component])
        )
    };

    const apiRegister = useRef({});

    const registerApi = useCallback((name, providerAPI) => {
        apiRegister.current[name] = providerAPI;
    }, []);

    const SelectedProvider = availableProviders[providerName];

    const selectedApi = apiRegister.current[providerName];

    const [editing, setEditing] = useState([]);

    const isEditing = useMemo(() => editing.some((e) => e), [editing]);

    const handleRun = useCallback(() => {
        if (selectedApi) {
            setLoading(true);
            selectedApi
                .getDirections(locations)
                .then(onItineraryRun)
                .catch(onError)
                .finally(() => setLoading(false));
        }
    }, [selectedApi, locations, onItineraryRun]);

    const [waypoints, setWaypoints] = useState(getDefaultWaypoints());

    const handleReset = () => {
        onResetItinerary();
        setWaypoints(getDefaultWaypoints());
    };

    const handleClose = () => {
        onActive(false);
        handleReset();
    };

    return (
        <ResponsivePanel
            dock
            containerStyle={dockStyle}
            containerId="itinerary"
            containerClassName={active ? 'itinerary-active' : ''}
            open={active}
            size={width}
            position="right"
            bsStyle="primary"
            title={<Message msgId="itinerary.title" />}
            onClose={handleClose}
            glyph="1-line"
            style={dockStyle}
        >
            {isEditing ? <div className="editing-overlay">
                <Text className="edit-text" fontSize={"lg"}>
                    <Message msgId="itinerary.clickOnMap" />
                </Text>
            </div> : null}
            <FlexBox column gap="md" classNames={['_padding-md']}>
                <Waypoints
                    containerId={DRAGGABLE_CONTAINER_ID}
                    waypoints={waypoints}
                    locations={locations}
                    items={[]}
                    isDraggable
                    searchResults={searchResults}
                    searchLoading={searchLoading}
                    defaultWaypointsLimit={defaultWaypointsLimit}
                    onSetWaypoints={setWaypoints}
                    onUpdateLocations={onUpdateLocations}
                    onSelectLocationFromMap={onSelectLocationFromMap}
                    onSearchByLocationName={onSearchByLocationName}
                    onToggleCoordinateEditor={setEditing}
                />
                <div className="itinerary-divider" />
                {SelectedProvider ? <SelectedProvider registerApi={registerApi} config={config} /> : null}
                <ItineraryAction
                    onHandleRun={handleRun}
                    locations={locations}
                    itineraryLoading={itineraryLoading}
                    onHandleReset={handleReset}
                />
                <div className="itinerary-divider" />
                <RouteDetail
                    itineraryData={itineraryData}
                    onAddAsLayer={onAddAsLayer}
                />
            </FlexBox>
        </ResponsivePanel>
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
                icon: <Glyphicon glyph="1-line" />,
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
