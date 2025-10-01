/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { CONTROL_NAME } from '../constants';
import FlexBox from '../../../components/layout/FlexBox';
import VisibilityCheck from '../../TOC/components/VisibilityCheck';
import Text from '../../../components/layout/Text';
import { download } from '../../../utils/FileUtils';
import Message from '../../../components/I18N/Message';
import OpacitySlider from '../../TOC/components/OpacitySlider';
import { getMarkerLayerIdentifier, getRouteDetailText, getRunLayerIdentifier } from '../utils/IsochroneUtils';

/**
 * Route detail
 * @param {object} props - The props of the component
 * @param {object} props.isochroneData - The isochrone data
 * @param {function} props.onLayerPropertyChange - The function to handle the layer property change
 * @param {function} props.onAddAsLayer - The function to handle the add as layer operation
 * @param {function} props.onDeleteLayer - The function to handle the delete layer operation
 * @param {function} props.onDeleteIsochroneData - The function to handle the delete isochrone data operation
 * @param {function} props.onSetCurrentRunParameters - The function to handle the set current run parameters operation
 * @param {function} props.onUpdateLocation - The function to handle the update location operation
 */
const RouteDetail = ({
    isochroneData = [],
    onLayerPropertyChange = () => {},
    onAddAsLayer = () => {},
    onDeleteLayer = () => {},
    onDeleteIsochroneData = () => {},
    onSetCurrentRunParameters = () => {},
    onUpdateLocation = () => {}
}, context) => {

    const exportGeoJSON = (layer, config) => {
        const features = layer.features ?? [];
        const style = get(layer, 'style', {});
        download(
            JSON.stringify({
                type: 'FeatureCollection',
                msType: CONTROL_NAME,
                features,
                style
            }),
            getRouteDetailText(config, context.messages) + '.json',
            'application/geo+json'
        );
    };

    const handlePropertyChange = (id, options) => {
        // update run layer property
        onLayerPropertyChange(getRunLayerIdentifier(id), options);
        // update marker layer property
        if (!isNil(options.visibility)) {
            onLayerPropertyChange(getMarkerLayerIdentifier(id), options);
        }
    };

    const handleDeleteLayer = (id) => {
        // delete run layer
        onDeleteLayer({ id: getRunLayerIdentifier(id)});
        // delete isochrone data
        onDeleteIsochroneData(id);
    };

    const handleUseLayerParameters = (config) => {
        onSetCurrentRunParameters(config);
        config.location && onUpdateLocation(config.location);
    };

    return (
        <FlexBox column flexBox className="ms-isochrone-area-detail">
            {(isochroneData ?? []).map((data) => {
                const { layer = {}, config = {}, id } = data ?? {};
                return (
                    <FlexBox key={id} flexBox className="ms-isochrone-layer-container">
                        <FlexBox className="ms-isochrone-layer-header-container">
                            <FlexBox.Fill flexBox className="ms-isochrone-layer-header" gap="sm">
                                <VisibilityCheck
                                    value={!!layer?.visibility}
                                    onChange={(value) => handlePropertyChange(id, {"visibility": value})} />
                                <FlexBox gap="sm" centerChildrenVertically>
                                    <Glyphicon glyph="1-layer" />
                                    <Text fontSize="sm">{getRouteDetailText(config, context.messages)}</Text>
                                </FlexBox>
                            </FlexBox.Fill>
                            <DropdownButton
                                noCaret
                                pullRight
                                title={<Glyphicon glyph="option-vertical" />}
                                className="ms-isochrone-options square-button-sm"
                            >
                                <MenuItem onClick={() => handleUseLayerParameters(config)}>
                                    <Message msgId="isochrone.useRunParameters" />
                                </MenuItem>
                                <MenuItem onClick={() => exportGeoJSON(layer, config)}>
                                    <Message msgId="isochrone.exportAsGeoJSON" />
                                </MenuItem>
                                <MenuItem onClick={() => onAddAsLayer(layer)}>
                                    <Message msgId="isochrone.addAsLayer" />
                                </MenuItem>
                                <MenuItem onClick={() => handleDeleteLayer(id)}>
                                    <Message msgId="isochrone.deleteResult" />
                                </MenuItem>
                            </DropdownButton>
                        </FlexBox>
                        <div
                            className="mapstore-slider with-tooltip"
                            onClick={(e) => { e.stopPropagation(); }}>
                            <OpacitySlider
                                opacity={layer?.opacity ?? 1}
                                onChange={(value) => handlePropertyChange(id, {"opacity": value})} />
                        </div>
                    </FlexBox>
                );
            })}
        </FlexBox>
    );
};

RouteDetail.contextTypes = {
    messages: PropTypes.object
};

export default RouteDetail;
