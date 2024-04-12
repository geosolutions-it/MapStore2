/*
* Copyright 2024, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { useRef, useEffect } from 'react';
import * as Cesium from 'cesium';
import markerData from './img/marker.gltf.json';
import chroma from 'chroma-js';

const markerUri  = URL.createObjectURL(
    new Blob([JSON.stringify(markerData)], { type: 'application/json' })
);

function CesiumMapLocationSupport({
    location,
    pov,
    map,
    markerColor = 'rgba(255, 0, 0, 0.6)',
    clampToGround,
    onUpdate = () => {}
}) {

    const { latLng } = location || {};
    const {
        lat: latitude,
        lng: longitude,
        h: height = 0
    } = latLng || {};
    const { heading = 0 } = pov || {};

    const dataSource = useRef();
    useEffect(() => {
        const _dataSource = new Cesium.CustomDataSource('streetViewDataSource');
        dataSource.current = _dataSource;
        if (map) {
            map.dataSources.add(_dataSource);
        }
        return () => {
            if (map?.isDestroyed && !map.isDestroyed()) {
                map.dataSources.remove(_dataSource);
            }
            dataSource.current = undefined;
        };
    }, []);

    useEffect(() => {
        if (dataSource.current && latitude !== undefined && longitude !== undefined) {
            const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
            const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading), 0, 0);
            const orientation = Cesium.Transforms.headingPitchRollQuaternion(
                position,
                hpr
            );
            if (!dataSource.current.entities.values.length) {
                const [r, g, b, a] = chroma(markerColor).gl();
                dataSource.current.entities.add({
                    position,
                    orientation,
                    model: {
                        uri: markerUri,
                        color: new Cesium.Color(r, g, b, a),
                        minimumPixelSize: 64,
                        heightReference: clampToGround
                            ? Cesium.HeightReference.CLAMP_TO_GROUND
                            : Cesium.HeightReference.NONE
                    }
                });
            }
            dataSource.current.entities.values[0].position = position;
            dataSource.current.entities.values[0].orientation = orientation;
            map.scene.requestRender();
            onUpdate();
        }
    }, [latitude, longitude, height, heading, clampToGround]);
    return null;
}

export default CesiumMapLocationSupport;
