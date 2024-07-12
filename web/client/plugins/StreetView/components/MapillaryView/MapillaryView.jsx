/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import React, { useRef, useState, useEffect } from "react";
import axios from 'axios';
import EmptyStreetView from '../EmptyStreetView';
import GeoJSONDataProvider from "../../utils/mapillaryUtils/GeoJSONDataProvider";
import 'mapillary-js/dist/mapillary.css';

const MapillaryView = (props) => {
    const {
        size,
        location,
        className = "google-street-view",
        style = {},
        setPov = () => {}, setLocation = () => {},
        providerSettings,
        apiKey
    } = props;
    const divRef = useRef();
    const [viewer, setViewer] = useState();
    const [loading, setLoading] = useState(false);

    const getMapillaryViewer = () => import('mapillary-js').then((module) =>  module.Viewer);
    const initiateMapillaryViewer = (Viewer, dataProvider = {}) => {
        const mly = new Viewer({
            container: divRef.current,
            dataProvider,
            imageId: location?.properties?.imageId || location?.properties?.filename,
            accessToken: apiKey,
            component: {
                cover: false
            }
        });
        setViewer(mly);
        mly.on('bearing', evt => {
            setPov({ heading: evt.bearing });
        });
        mly.on('image', evt => {
            setLocation(
                {
                    latLng: {
                        lat: evt.image.lngLat.lat,
                        lng: evt.image.lngLat.lng,
                        h: evt.image.computedAltitude || 0
                    },
                    properties: {
                        imageId: evt.image.id,
                        filename: evt.image.id,
                        id: evt.image.id
                    }
                }
            );
        });
    };
    const addMapillaryViewer = (isCustomDataProvider, options) => {
        setLoading(true);
        getMapillaryViewer().then( Viewer => {
            let promise = new Promise((resolve, reject) => {
                if (isCustomDataProvider && options?.url) {
                    axios.get(`${options.url}index.json`).then(res => {
                        const geojson = res.data;
                        resolve(geojson);
                    }).catch(err=> reject(err));
                    return;
                }
                resolve();
            });
            promise.then((geojson) => {
                const dataProvider = new GeoJSONDataProvider({
                    url: options.url,
                    geometryLevel: options?.geometryLevel || 14,
                    geojson: geojson || {
                        type: "FeatureCollection",
                        features: []
                    }
                });
                initiateMapillaryViewer(Viewer, dataProvider);
                setLoading(false);
            });
        }).catch(err=>{
            setLoading(false);
            console.error(err);
        });
    };
    // initialize components
    useEffect(() => {
        // clean up (will unmount)
        return () => {
            if (viewer?.remove) {
                viewer.remove();
            }
            if (props?.resetStViewData) {
                props.resetStViewData();
            }
        };
    }, []);
    // update images in viewer based on location change
    useEffect(() => {
        if (location && viewer) {
            const id = location?.properties?.imageId || location?.properties?.filename;
            if (id && viewer.isNavigable) {
                viewer.moveTo(id);
            }
        }
    }, [location]);

    // initiate mapillary viewer first time
    useEffect(() => {
        if (!viewer && location) {
            const options = {
                url: providerSettings?.ApiURL,
                geometryLevel: providerSettings?.geometryLevel || 14
            };
            let isCustomDataProvider = providerSettings?.ApiURL;
            addMapillaryViewer(isCustomDataProvider, options);
        }
    }, [viewer, location]);

    // handle resize events to resize the panorama
    useEffect(() => {
        if (viewer) {
            viewer.resize();
        }
    }, [size]);
    return (<>
        <div className={className} style={{display: !viewer ? "block" : "none", ...style}} ><EmptyStreetView loading={loading} /></div>
        <div className={className} style={{
            position: "absolute", margin: style.margin, height: style.height, width: style.width}} ref={divRef}>
        </div>
    </>);


};

export default MapillaryView;

