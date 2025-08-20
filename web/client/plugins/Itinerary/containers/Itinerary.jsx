/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import uuid from 'uuid';
import times from 'lodash/times';

import FlexBox from '../../../components/layout/FlexBox';
import ResponsivePanel from '../../../components/misc/panels/ResponsivePanel';
import Message from '../../../components/I18N/Message';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import { DEFAULT_PROVIDER, DRAGGABLE_CONTAINER_ID } from '../constants';
import GraphHopperProvider from '../components/Provider/GraphHopper';
import Waypoints from '../../../components/search/geosearchpicker';
import Text from '../../../components/layout/Text';
import RouteDetail from '../components/RouteDetail';
import Button from '../../../components/misc/Button';
import { debounce, isEqual } from 'lodash';
import LoadingView from '../../../components/misc/LoadingView';

const defaultProviders = { [DEFAULT_PROVIDER]: GraphHopperProvider };
const getDefaultWaypoints = () => times(2, () => ({value: null, id: uuid()}));

const ItineraryContainer = ({
    active,
    configuredItems,
    providerName = DEFAULT_PROVIDER,
    width = DEFAULT_PANEL_WIDTH,
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
                setLoading(true);
                selectedApi
                    .getDirections(locations)
                    .then(onItineraryRun)
                    .catch(onError)
                    .finally(() => setLoading(false));
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
        setProviderConfig({});
    };

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
                />
                <div className="itinerary-divider" />
                {SelectedProvider ? (
                    <SelectedProvider
                        registerApi={registerApi}
                        config={config}
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
