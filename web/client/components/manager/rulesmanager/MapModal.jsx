/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');

const enhancer = require("./enhancers/Map");
const autoMapType = require('../../map/enhancers/autoMapType');
const mapType = require('../../map/enhancers/mapType');
const autoResize = require('../../map/enhancers/autoResize');
const onMapViewChanges = require('../../map/enhancers/onMapViewChanges');
const withDraw = require("../../map/enhancers/withDraw");
const {compose} = require('recompose');

const MapWitDraw = compose(
    enhancer,
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    mapType,
    withDraw()
)(require('../../map/BaseMap'));

const Portal = require('react-overlays').Portal;

module.exports = ({layer, onMapReady = () => {}}) => {
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

