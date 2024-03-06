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
import { getPathURLFromFileUrl } from '../../../../utils/URLUtils';
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
    // initialize components
    useEffect(() => {
        // clean up
        return () => {
            viewer?.remove && viewer.remove();
            setViewer();
            props?.resetStViewData && props.resetStViewData();
        };
    }, []);
    const intiateMapViewer = async(isCustomDataProvider, options) => {
        const loadAPI = () => import('mapillary-js').then((module) =>  module.Viewer);
        const Viewer = await loadAPI();
        let dataProvider = {};
        if (isCustomDataProvider && options?.url) {
            const res = await axios.get(options.url);
            const geojson = res.data;
            let pathURL = getPathURLFromFileUrl(options.url);
            dataProvider = new GeoJSONDataProvider({
                url: pathURL,
                geometryLevel: options?.geometryLevel || 14,
                geojson,
                debug: !!options?.debugTiles,
                getImageFromUrl: options?.getImageFromUrl
            });
        }
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
    useEffect(() => {
        if (location) {
            if (!viewer) {
                const options = {
                    url: providerSettings?.ApiURL,
                    geometryLevel: providerSettings?.geometryLevel || 14,
                    debugTiles: providerSettings?.debugTiles || false,
                    getImageFromUrl: providerSettings?.getImageFromUrl || ''
                };
                let isCustomDataProvider = providerSettings?.ApiURL;
                intiateMapViewer(isCustomDataProvider, options);
            } else {
                const id = location?.properties?.imageId || location?.properties?.filename;
                if (id && viewer.isNavigable) {
                    viewer.moveTo(id);
                }
            }
        }
    }, [location]);

    // handle resize events to resize the panorama
    useEffect(() => {
        if (viewer) {
            viewer.resize();
        }
    }, [size]);
    return (<>
        <div className={className} style={{display: !viewer ? "block" : "none", ...style}} ><EmptyStreetView /></div>
        <div className={className} style={{
            // display: viewer ? "block" : "none",
            position: "absolute", margin: style.margin, height: style.height, width: style.width}} ref={divRef}>
        </div>
    </>);


};

export default MapillaryView;

