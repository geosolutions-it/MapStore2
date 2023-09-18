/**
* Copyright 2023, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { Portal } from 'react-overlays';
import { compose } from 'recompose';
import PropTypes from 'prop-types';

import BaseMapComp from '../../components/map/BaseMap';
import autoMapType from '../../components/map/enhancers/autoMapType';
import autoResize from '../../components/map/enhancers/autoResize';
import mapType from '../../components/map/enhancers/mapType';
import onMapViewChanges from '../../components/map/enhancers/onMapViewChanges';
import withDraw from '../../components/map/enhancers/withDraw';
import mapEnhancer from './enhancers/mapEnhancer';

const MapWitDrawComp = compose(
    mapEnhancer,
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    mapType,
    withDraw()
)(BaseMapComp);


const MapWithDraw = ({
    containerSelector,
    map,
    mapStateSource,
    layer = {},
    onMapReady = () => {}
}) => {
    return (
        <Portal container={document.querySelector(containerSelector)}>
            <MapWitDrawComp
                map={map}
                mapStateSource={mapStateSource}
                onMapReady={onMapReady}
                options={{ style: { margin: 10, height: 'calc(100% - 20px)' }}}
                layer={layer}
                tools={["draw"]}/>
        </Portal>);
};

MapWithDraw.propTypes = {
    containerSelector: PropTypes.string,
    map: PropTypes.object,
    mapStateSource: PropTypes.string,
    onMapReady: PropTypes.bool,
    layer: PropTypes.object
};

export default MapWithDraw;
