import React, {useState, useEffect, useRef} from 'react';
const changeView = (panoramaViewer) => () => {
    /*
    const rl = panoramaViewer.getRecording();
    // console.log(rl);

    if (rl != null) {
        const viewerData = {};
        const orientation = panoramaViewer.getOrientation();
        viewerData.yaw = orientation.yaw * Math.PI / 180;
        viewerData.hFov = orientation.hFov * Math.PI / 180.0;
        viewerData.xyz = rl.xyz;
        viewerData.srs = rl.srs;
        viewerData.scale = 50;


        map.removeLayer(cm_mapLayer);

        cm_mapLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            visible: this.visible,
            updateWhileInteracting: true
        });

        const coordinates = cm_calculateConeCoords({
            hFov: viewerData.hFov,
            scale: viewerData.scale
        });

        // return length and width of cone to fit in. (+1 for margin on edges)
        const dimensions = [
            coordinates[1][0] + 0.5,
            coordinates[2][1] + 0.5
        ];

        // Create canvas to draw the cone on.
        const context = cm_createCanvasContext2D(dimensions);
        const vectorContext = ol.render.toContext(context, {
            size: dimensions,
            pixelRatio: 1
        });

        // Set the coloring style for the cone.
        vectorContext.setStyle(colorStyle);

        // Draw the cone on the canvas.
        vectorContext.drawGeometry(new ol.geom.Polygon([coordinates]));

        cm_mapLayer.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                img: context.canvas,
                rotation: viewerData.yaw,
                anchor: [0.5, 1],
                imgSize: dimensions,
                rotateWithView: true
            })
        }));
        map.addLayer(cm_mapLayer);

        const mapSource = cm_mapLayer.getSource();
        const coneFeature = mapSource.getFeatureById('cone_' + cm_id);

        if (!coneFeature) {
            const point_geom = new ol.geom.Point([viewerData.xyz[0], viewerData.xyz[1]]);

            // Build feature from polygon
            coneFeature = new ol.Feature(point_geom);

            // Set id, type, style and viewerData for the feature
            coneFeature.setId('cone_' + cm_id);
            coneFeature.set('viewerData', viewerData);
            coneFeature.set('color', colorStyle);
            coneFeature.set('type', 'cone');

            // Add circleFeature and coneFeature to maplayer.
            cm_mapLayer.getSource().addFeature(coneFeature);
        } else {
            // update viewerdata of the feature.
            coneFeature.set('viewerData', viewerData);
            // Needed to draw the cone on the correct location.
            var coneGeometry = coneFeature.getGeometry();
            coneGeometry.setCoordinates([viewerData.xyz[0], viewerData.xyz[1]]);
        }
        map.render();

    }
    */
};
// write a component that loads the library and then renders the viewer
// https://streetsmart.cyclomedia.com/api/v23.14/documentation/
const CyclomediaView = ({ apiKey, api: StreetSmartApi, size, style, providerSettings = {}}) => {
    const {
        username,
        password
    } = providerSettings;
    const viewer = useRef(null);
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(null);
    // openImage(`${coordinates[0]},${coordinates[1]}`, 'EPSG:3857')
    const openImage = (query, srs) => {
        const viewerType = StreetSmartApi.ViewerType.PANORAMA;
        const options = {
            viewerType: viewerType,
            srs,
            panoramaViewer: {
                closable: false,
                maximizable: true,
                replace: true,
                recordingsVisible: true,
                navbarVisible: true,
                timeTravelVisible: true,
                measureTypeButtonVisible: true,
                measureTypeButtonStart: true,
                measureTypeButtonToggle: true
            }
        };
        const successCallback = function(result) {
            if (result && result[0]) {
            // TODO: show div
                const panoramaViewer = result[0];
                const viewerColor = panoramaViewer.getViewerColor();
                // update the map.
                panoramaViewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, changeView(panoramaViewer));
            }
        };
        const errorCallback = (error) => {
            setError(error);
            console.log('Cyclomedia API: open: error: ' + error);
        };
        // Open
        StreetSmartApi.open(query, options).then( successCallback, errorCallback);
    };
    const show = StreetSmartApi && initialized && !error;
    useEffect(() => {
        if (!StreetSmartApi) return;
        StreetSmartApi.init({
            targetElement: viewer.current,
            username,
            password,
            apiKey,
            loginOauth: false,
            // srs: 'EPSG:25832',
            srs: 'EPSG:4326',
            locale: 'en-us'
        // configurationUrl: 'https://atlas.cyclomedia.com/configuration',
        // addressSettings: {
        //     locale: "us",
        //     database: "Nokia"
        // }
        }).then(function() {
            setInitialized(true);
            console.log('Cyclomedia API: init: success!');
        }).catch(function(error) {
            setError(error);
            console.log('Cyclomedia API: init: error: ' + error);
        });
    }, [StreetSmartApi]);
    return <>
        <button onClick={() => {
            openImage('1252971.406,5432582.106', 'EPSG:3857');
        }} >TEST</button>
        <div style={{...style, textAlign: 'center', alignContent: 'center', display: error ? 'block' : 'none'}} key="error">{error}</div>
        <div style={{...style, textAlign: 'center', alignContent: 'center', display: initialized || error ? 'none' : 'block'}} key="loading">Initializing API...</div>
        <div style={{...style, display: show ? 'visible' : 'hidden'}} ref={viewer} key="main" id="cyclomedia_div" /></>;
};

export default CyclomediaView;
