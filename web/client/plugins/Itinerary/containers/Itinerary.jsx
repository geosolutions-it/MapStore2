/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';
import uuid from 'uuid';
import times from 'lodash/times';

import FlexBox from '../../../components/layout/FlexBox';
import ResponsivePanel from '../../../components/misc/panels/ResponsivePanel';
import Message from '../../../components/I18N/Message';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import { DEFAULT_PROVIDER, DRAGGABLE_CONTAINER_ID } from '../constants';
import GraphHopperProvider from './Provider/GraphHopper';
import Waypoints from '../../../components/search/geosearchpicker';
import Text from '../../../components/layout/Text';
import RouteDetail from '../components/RouteDetail';
import ItineraryAction from '../components/ItineraryAction';

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

export default ItineraryContainer;
