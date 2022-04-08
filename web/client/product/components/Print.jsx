import React, { useEffect, useRef } from "react";
import "./print.less";
import Map from "ol/Map";
import View from "ol/View";
import OSM from 'ol/source/OSM';
import TileWMS from "ol/source/TileWMS";
import TileLayer from 'ol/layer/Tile';
import ScaleLine from "ol/control/ScaleLine";
import {defaults as defaultInteractions} from "ol/interaction.js";
import header from "./print_header.png";

export default  function() {
    const map = useRef(null);
    const legendUrl = "https://gs-stable.geosolutionsgroup.com/geoserver/wms?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image/png&layer=terradex:states";
    useEffect(() => {
        const page = new URLSearchParams(location.search).get("page") ?? "A4";
        const orientation = new URLSearchParams(location.search).get("orientation") ?? "portrait";
        document.body.classList.add(page);
        document.body.classList.add(orientation);
        const pageStyle = document.createElement("style");
        pageStyle.appendChild(document.createTextNode(`@page {margin: 0; size: ${page} ${orientation}}`));
        document.head.appendChild(pageStyle);
    }, []);
    useEffect(() => {
        map.current = new Map({
            target: "map",
            controls: [
                new ScaleLine({
                    target: "scalebar"
                })
            ],
            interactions: defaultInteractions({
                doubleClickZoom: false,
                dragAndDrop: false,
                dragPan: false,
                keyboardPan: false,
                keyboardZoom: false,
                mouseWheelZoom: false,
                pointer: false,
                select: false
            }),
            view: new View({
                center: [-10015046, 7008963],
                projection: "EPSG:3857",
                zoom: 4
            }),
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                new TileLayer({
                    source: new TileWMS({
                        url: "https://gs-stable.geosolutionsgroup.com/geoserver/wms",
                        params: {'LAYERS': 'terradex:states', 'TILED': true}
                    })
                })
            ]
        });
    }, []);
    return (
        <><div className="sheet">
            <div className="content">
                <div id="header"><img src={header}/></div>
                <div id="title">Title</div>
                <div id="description">description</div>
                <div id="map"></div>
                <div id="footer"><div id="date">{new Intl.DateTimeFormat("it-IT").format(new Date())}</div><div id="scalebar"></div></div>
            </div>
        </div>
        <div className="sheet">
            <div className="content">
                <div id="legend">States: <img src={legendUrl}/></div>
            </div>
        </div></>
    );
}
