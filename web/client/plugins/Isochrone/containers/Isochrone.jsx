/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import uuid from 'uuid';
import isEmpty from 'lodash/isEmpty';

import FlexBox from '../../../components/layout/FlexBox';
import ResponsivePanel from '../../../components/misc/panels/ResponsivePanel';
import Message from '../../../components/I18N/Message';
import ConfirmDialog from '../../../components/layout/ConfirmDialog';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import { DEFAULT_PROVIDER } from '../constants';
import GraphHopperProvider from '../components/GraphHopperProvider';
import Waypoints from '../components/GeoSearchPicker';
import Text from '../../../components/layout/Text';
import IsochroneAction from '../components/IsochroneAction';
import LoadingView from '../../../components/misc/LoadingView';
import RouteDetail from '../components/RouteDetail';

const defaultProviders = { [DEFAULT_PROVIDER]: GraphHopperProvider };
const getDefaultWaypoint = () => ({value: null, id: uuid()});

/**
 * Isochrone container component
 * @param {object} props - The props of the container
 * @param {boolean} props.active - The active state of the container
 * @param {object[]} props.configuredItems - The configured items
 * @param {string} props.providerName - The name of the provider. Default is 'GraphHopper'.
 * @param {number} props.width - The width of the container
 * @param {object} props.dockStyle - The dock style of the container
 * @param {object} props.location - The location of the container
 * @param {object} props.providerApiConfig - The provider API config
 * @param {object} props.searchConfig - The search config
 * @param {object[]} props.searchResults - The search results
 * @param {boolean} props.searchLoading - The search loading state
 * @param {boolean} props.isochroneLoading - The isochrone loading state
 * @param {object[]} props.isochroneData - The isochrone data
 * @param {object} props.isochroneCurrentParameters - The isochrone current run parameters
 * @param {function} props.onSetLoading - The function to set the loading state
 * @param {function} props.onSearchByLocationName - The function to search by location name
 * @param {function} props.onIsochroneRun - The function to run the isochrone
 * @param {function} props.onActive - The function to activate the container
 * @param {function} props.onUpdateLocation - The function to update the location
 * @param {function} props.onSelectLocationFromMap - The function to select the location from map
 * @param {function} props.onAddAsLayer - The function to add the isochrone as a layer
 * @param {function} props.onResetIsochrone - The function to reset the isochrone
 * @param {function} props.onLayerPropertyChange - The function to change the layer property
 * @param {function} props.onError - The function to handle the error
 * @param {function} props.onInitPlugin - The function to initialize the plugin
 * @param {function} props.onDeleteLayer - The function to delete the layer
 * @param {function} props.onDeleteIsochroneData - The function to delete the isochrone data
 */
const IsochroneContainer = ({
    active,
    configuredItems,
    providerName = DEFAULT_PROVIDER,
    width = DEFAULT_PANEL_WIDTH,
    dockStyle,
    location,
    providerApiConfig,
    searchConfig,
    searchResults,
    searchLoading,
    isochroneLoading,
    isochroneData,
    isochroneCurrentParameters,
    onSetLoading,
    onSearchByLocationName,
    onIsochroneRun,
    onActive,
    onUpdateLocation,
    onSelectLocationFromMap,
    onAddAsLayer,
    onResetIsochrone,
    onLayerPropertyChange,
    onError,
    onInitPlugin,
    onDeleteLayer,
    onDeleteIsochroneData,
    onSetCurrentRunParameters
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

    const [editing, setEditing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleRun = useCallback(() => {
        if (selectedApi) {
            onSetLoading(true);
            selectedApi
                .getIsochrones(location)
                .then(onIsochroneRun)
                .catch(onError)
                .finally(() => onSetLoading(false));
        }
    }, [selectedApi, location, onIsochroneRun]);

    const [waypoint, setWaypoint] = useState(getDefaultWaypoint());

    const handleReset = () => {
        onResetIsochrone();
        setWaypoint(getDefaultWaypoint());
    };

    const handleClose = (forceClose = false) => {
        if (!isEmpty(isochroneData) && !forceClose) {
            setShowConfirmDialog(true);
        } else {
            setShowConfirmDialog(false);
            onActive(false);
            handleReset();
        }
    };

    useEffect(() => {
        onInitPlugin({ searchConfig });
        return () => { handleClose(); };
    }, []);

    return (
        <ResponsivePanel
            dock
            containerStyle={dockStyle}
            containerId="isochrone"
            containerClassName={active ? 'ms-isochrone-active' : ''}
            open={active}
            size={width}
            position="right"
            bsStyle="primary"
            title={<Message msgId="isochrone.title" />}
            onClose={() => handleClose()}
            glyph="1-point-dashed"
            style={dockStyle}
        >
            {editing || isochroneLoading ? (
                <div className="ms-isochrone-editing-overlay">
                    {editing ? (
                        <Text className="ms-edit-text" fontSize={"lg"}>
                            <Message msgId="isochrone.clickOnMap" />
                        </Text>
                    ) : <LoadingView />}
                </div>
            ) : null}
            <FlexBox column gap="md" classNames={['ms-isochrone-container', '_padding-md', '_relative']}>
                <Waypoints
                    waypoint={waypoint}
                    location={location}
                    searchResults={searchResults}
                    searchLoading={searchLoading}
                    onSetWaypoint={setWaypoint}
                    onUpdateLocation={onUpdateLocation}
                    onSelectLocationFromMap={onSelectLocationFromMap}
                    onSearchByLocationName={onSearchByLocationName}
                    onToggleCoordinateEditor={setEditing}
                    {...searchConfig}
                />
                <div className="ms-isochrone-divider" />
                {SelectedProvider ? <SelectedProvider
                    registerApi={registerApi}
                    config={providerApiConfig}
                    currentRunParameters={isochroneCurrentParameters}
                    onSetCurrentRunParameters={onSetCurrentRunParameters}
                /> : null}
                <IsochroneAction disabled={isochroneLoading || isEmpty(location)} onHandleRun={handleRun} onHandleReset={handleReset} />
                <div className="ms-isochrone-divider" />
                <RouteDetail
                    isochroneData={isochroneData}
                    onAddAsLayer={onAddAsLayer}
                    onLayerPropertyChange={onLayerPropertyChange}
                    onDeleteLayer={onDeleteLayer}
                    onDeleteIsochroneData={onDeleteIsochroneData}
                    onSetCurrentRunParameters={onSetCurrentRunParameters}
                    onUpdateLocation={onUpdateLocation}
                />
            </FlexBox>
            <ConfirmDialog
                show={showConfirmDialog}
                onCancel={() => setShowConfirmDialog(false)}
                onConfirm={() => handleClose(true)}
                titleId="isochrone.confirmDialog.title"
                descriptionId="isochrone.confirmDialog.description"
                confirmId="isochrone.confirmDialog.confirm"
                cancelId="isochrone.confirmDialog.cancel"
                preventHide
            />
        </ResponsivePanel>
    );
};

export default IsochroneContainer;
