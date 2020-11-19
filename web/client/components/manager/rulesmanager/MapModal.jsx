/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { Portal } from 'react-overlays';
import { compose } from 'recompose';

import BaseMapComp from '../../map/BaseMap';
import autoMapType from '../../map/enhancers/autoMapType';
import autoResize from '../../map/enhancers/autoResize';
import mapType from '../../map/enhancers/mapType';
import onMapViewChanges from '../../map/enhancers/onMapViewChanges';
import withDraw from '../../map/enhancers/withDraw';
import enhancer from './enhancers/Map';

const MapWitDraw = compose(
    enhancer,
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    mapType,
    withDraw()
)(BaseMapComp);


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

