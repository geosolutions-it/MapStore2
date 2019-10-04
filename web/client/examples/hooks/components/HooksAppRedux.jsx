import React, { useState, useEffect, useReducer, useContext } from 'react';
import Map from '../../../components/map/leaflet/Map';
import MousePosition from '../../../components/mapcontrols/mouseposition/MousePosition';
import Layer from '../../../components/map/leaflet/Layer';
import '../../../components/map/leaflet/plugins/OSMLayer';
import '../../../components/map/leaflet/plugins/WMSLayer';
import axios from 'axios';

import { changeZoomLevel, zoomToPoint } from '../../../actions/map';
import mapReducer from '../../../reducers/map';

import AppContext from '../appContext';

export default () => {
    /**
     * State management hooks.
     */

    // map state: center and zoom
    const [map, dispatch] = useReducer(mapReducer, {
        center: { x: 10, y: 43, crs: 'EPSG:4326' },
        zoom: 1
    });

    // WMS layer visibility state
    const [visible, setVisibility] = useState(false);

    // search text state
    const [search, setSearch] = useState("");

    /**
     * Search place effect.
     */
    useEffect(() => {
        if (search) {
            axios.get(`https://nominatim.openstreetmap.org/?q=${search}&format=json&bounded=0&polygon_geojson=1&priority=5&returnFullData=false`)
                .then(response => response.data).then((places) => {
                    if (places.length > 0) {
                        dispatch(zoomToPoint({
                            x: Number(places[0].lon), y: Number(places[0].lat)
                        }, 15, 'EPSG:4326'));
                    }
                });
        }
    }, [search]);
    const mode = useContext(AppContext);
    return (
        <>
            <button onClick={() => dispatch(changeZoomLevel(map.zoom + 1))}>Zoom In</button>
            <button onClick={() => dispatch(changeZoomLevel(map.zoom - 1))}>Zoom Out</button>&nbsp;
            <label>USA Population: <input type="checkbox" checked={visible} onChange={() => setVisibility(!visible)}/></label>
            <label>Search: </label><input type="text" onKeyUp={(e) => e.keyCode === 13 && setSearch(e.target.value)}/>
            <Map center={map.center} zoom={map.zoom} zoomControl={false} onMapViewChanges={(center, zoom) => {
                dispatch(zoomToPoint({
                    x: center.x,
                    y: center.y
                }, zoom, center.crs));
            }}>
                <Layer type="osm"/>
                <Layer type="wms" options={{ url: "https://demo.geo-solutions.it/geoserver/wms", name: "topp:states", visibility: visible}}/>
            </Map>
            <MousePosition mousePosition={map.center}/>
            <div>Current mode: {mode}</div>
        </>
    );
};
