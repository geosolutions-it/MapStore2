/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import enhancer from './enhancers/Map';
import autoMapType from '../../map/enhancers/autoMapType';
import mapType from '../../map/enhancers/mapType';
import autoResize from '../../map/enhancers/autoResize';
import onMapViewChanges from '../../map/enhancers/onMapViewChanges';
import withDraw from '../../map/enhancers/withDraw';
import { compose } from 'recompose';

const MapWitDraw = compose(
    enhancer,
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    mapType,
    withDraw()
)(require('../../map/BaseMap'));

import { Portal } from 'react-overlays';

export default ({layer, onMapReady = () => {}}) => {
    return (
        <Portal container={document.querySelector('.rules-data-gird')}>
            <div className="rules-manager-map-modal" style={{position: "absolute", zIndex: 15, top: 0, bottom: 0, width: "100%"}}>
                <MapWitDraw
                    onMapReady={onMapReady}
                    options={{ style: { margin: 10, height: 'calc(100% - 20px)' }}}
                    layer={layer}
                    tools={["draw"]}/>
            </div>
        </Portal>);
};

