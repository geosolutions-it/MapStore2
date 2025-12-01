/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';

import FlexBox from '../../../components/layout/FlexBox';
import ResponsivePanel from '../../../components/misc/panels/ResponsivePanel';
import Message from '../../../components/I18N/Message';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import { getDefaultWaypoints } from '../utils/ItineraryUtils';
import { DEFAULT_PROVIDER, DEFAULT_PROVIDER_CONFIGS, DRAGGABLE_CONTAINER_ID } from '../constants';
import GraphHopperProvider from '../components/GraphHopperProvider';
import Waypoints from '../components/geosearchpicker/GeoSearchPicker';
import Text from '../../../components/layout/Text';
import RouteDetail from '../components/RouteDetail';
import Button from '../../../components/misc/Button';
import { debounce, isEqual } from 'lodash';
import LoadingView from '../../../components/misc/LoadingView';

const defaultProviders = { [DEFAULT_PROVIDER]: GraphHopperProvider };
/**
 * Itinerary container
 * @param {object} props - The props of the component
 * @param {boolean} props.active - Whether the itinerary is active
 * @param {object} props.configuredItems - The configured items
 * @param {string} props.providerName - The name of the provider
 * @param {number} props.width - The width of the panel
 * @param {object} props.dockStyle - The style of the panel
 * @param {object[]} props.locations - The locations of the itinerary
 * @param {object} props.providerApiConfig - The provider api config of the itinerary
 * @param {number} props.defaultWaypointsLimit - The default waypoints limit
 * @param {object[]} props.searchResults - The search results
 * @param {boolean} props.searchLoading - Whether the search is loading
 * @param {boolean} props.itineraryLoading - Whether the itinerary is loading
 * @param {function} props.onSetLoading - The function to set the loading state
 * @param {object} props.itineraryData - The itinerary data
 * @param {function} props.onSearchByLocationName - The function to search by location name
 * @param {function} props.onItineraryRun - The function to run the itinerary
 * @param {function} props.onActive - The function to activate the itinerary
 * @param {function} props.onUpdateLocations - The function to update the locations
 * @param {function} props.onSelectLocationFromMap - The function to select a location from the map
 * @param {function} props.onAddAsLayer - The function to add the itinerary as a layer
 * @param {function} props.onResetItinerary - The function to reset the itinerary
 * @param {function} props.onError - The function to handle the error
 * @returns {React.ReactNode} The itinerary container
 */
const ItineraryContainer = ({
    active,
    configuredItems,
    providerName = DEFAULT_PROVIDER,
    width = DEFAULT_PANEL_WIDTH,
    dockStyle,
    locations,
    searchConfig,
    providerApiConfig,
    defaultWaypointsLimit = 5,
    searchResults,
    searchLoading,
    itineraryLoading,
    onSetLoading,
    itineraryData,
    onSearchByLocationName,
    onItineraryRun,
    onActive,
    onUpdateLocations,
    onSelectLocationFromMap,
    onAddAsLayer,
    onResetItinerary,
    onError,
    onInitPlugin
}) => {

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

    const fetchItinerary = useCallback(
        debounce(() => {
            if (selectedApi) {
                const filteredLocations = locations.filter(Boolean);
                // perform itinerary run only if there are at least 2 valid locations
                if (filteredLocations.length >= 2) {
                    onSetLoading(true);
                    selectedApi
                        .getDirections(filteredLocations)
                        .then(onItineraryRun)
                        .catch(onError)
                        .finally(() => onSetLoading(false));
                }
            }
        }, 500),
        [selectedApi, locations, onItineraryRun]
    );

    const [editing, setEditing] = useState([]);

    const isEditing = useMemo(() => editing.some((e) => e), [editing]);

    const [providerConfig, setProviderConfig] = useState({});

    const [waypoints, setWaypoints] = useState(getDefaultWaypoints());

    const prevProviderBody = useRef();

    const handleReset = () => {
        onResetItinerary();
        setWaypoints(getDefaultWaypoints());
        setProviderConfig({...DEFAULT_PROVIDER_CONFIGS});
    };

    const handleCloseAndReset = () => {
        onActive(false);
        handleReset();
    };

    useEffect(() => {
        onInitPlugin({ searchConfig });
        return () => { handleCloseAndReset(); };
    }, []);

    useEffect(() => {
        if (
            locations && locations.length > 1 && (
                !prevProviderBody.current ||
                !isEqual(prevProviderBody.current?.locations, locations) ||
                !isEqual(prevProviderBody.current?.providerConfig, providerConfig)
            )
        ) {
            prevProviderBody.current = { locations, providerConfig };
            fetchItinerary();
        }
    }, [locations, providerConfig, fetchItinerary]);

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
            onClose={handleCloseAndReset}
            glyph="route"
            style={dockStyle}
        >
            {isEditing || itineraryLoading ? (
                <div className="editing-overlay">
                    {isEditing ? (
                        <Text className="edit-text" fontSize={"lg"}>
                            <Message msgId="itinerary.clickOnMap" />
                        </Text>
                    ) : <LoadingView />}
                </div>
            ) : null}
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
                    {...searchConfig}
                />
                <div className="itinerary-divider" />
                {SelectedProvider ? (
                    <SelectedProvider
                        registerApi={registerApi}
                        config={providerApiConfig}
                        setProviderConfig={setProviderConfig}
                        providerConfig={providerConfig}
                    />
                ) : null}
                <FlexBox className="itinerary-run" gap="sm">
                    <Button onClick={handleReset}><Message msgId="itinerary.reset" /></Button>
                </FlexBox>
                <div className="itinerary-divider" />
                <RouteDetail
                    itineraryData={itineraryData}
                    onAddAsLayer={onAddAsLayer}
                />
            </FlexBox>
        </ResponsivePanel>
    );
};

export default ItineraryContainer;
