/*
* Copyright 2024, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { useRef, useEffect } from 'react';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {
    Style,
    Icon
} from 'ol/style';
import markerSvg from './img/marker.svg';
import chroma from 'chroma-js';

const geoJSONParser = new GeoJSON();

function OLMapLocationSupport({
    location,
    pov,
    map,
    markerColor = 'rgba(255, 0, 0, 0.6)',
    onUpdate = () => {}
}) {

    const { latLng } = location || {};
    const {
        lat: latitude,
        lng: longitude,
        h: height = 0
    } = latLng || {};
    const { heading = 0 } = pov || {};

    const position = useRef();
    useEffect(() => {
        const _position = new Feature({
            geometry: new Point(0, 0)
        });
        const _vectorLayer = new VectorLayer({
            zIndex: 99999,
            source: new VectorSource({
                features: [_position]
            })
        });
        if (map) {
            map.addLayer(_vectorLayer);
        }
        _position.setGeometry(null);
        const [r, g, b, a] = chroma(markerColor).rgba();
        _position.setStyle(
            new Style({
                image: new Icon({
                    color: `rgb(${r}, ${g}, ${b})`,
                    opacity: a,
                    width: 64,
                    height: 64,
                    src: markerSvg
                })
            })
        );
        position.current = _position;
        return () => {
            if (map && _vectorLayer) {
                map.removeLayer(_vectorLayer);
            }
            position.current = undefined;
        };
    }, []);


    useEffect(() => {
        if (position.current && latitude !== undefined && longitude !== undefined) {
            const projection = map.getView().getProjection().getCode();
            const feature = geoJSONParser.readFeature({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude, height]
                }
            }, {
                dataProjection: 'EPSG:4326',
                featureProjection: projection
            });
            position.current.setGeometry(feature.getGeometry());
            position.current.getStyle().getImage().setRotation(heading * Math.PI / 180);
            onUpdate();
        }
    }, [latitude, longitude, height, heading]);
    return null;
}

export default OLMapLocationSupport;
