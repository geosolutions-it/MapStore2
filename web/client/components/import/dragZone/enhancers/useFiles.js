
import { compose, mapPropsStream, withHandlers } from 'recompose';
import turfBbox from '@turf/bbox';
import { getConfigProp } from '../../../../utils/ConfigUtils';


const getProjections = () => {
    const projections = (getConfigProp('projectionDefs') || []).concat([{code: "EPSG:3857", extent: [-20026376.39, -20048966.10, 20026376.39, 20048966.10]},
        {code: "EPSG:4326", extent: [-180, -90, 180, 90]}
    ]);
    return projections;
};

const getExtentForProjection = code => {
    return getProjections().find(project => project.code === code) || {extent: [-20026376.39, -20048966.10, 20026376.39, 20048966.10]};
};

export const checkIfLayerFitsExtentForProjection = layer => {
    const crs = layer.bbox?.crs || "EPSG:3857";
    const { extent } = getExtentForProjection(crs);
    const [, , maxX, maxY] = turfBbox({type: 'FeatureCollection', features: layer.features || []});
    return ((extent[2] >= maxX) && (extent[3] >= maxY));
};

/**
 * Enhancer for processing map configuration and layers object
 * Recognizes if the file dropped is a map or a layer
 * Then a related action for loading a map or a layer is performed and throws warning if any error occurs
 */
export default compose(
    withHandlers({
        useFiles: ({ currentMap, loadMap = () => { }, onClose = () => { }, setLayers = () => { },
            annotationsLayer, loadAnnotations = () => {} }) =>
            ({ layers = [], maps = [] }, warnings) => {
                const map = maps[0]; // only 1 map is allowed
                if (map) {
                    // also handles maps without zoom or center
                    const { zoom, center } = currentMap;
                    loadMap({
                        ...map,
                        map: {
                            ...map.map,
                            zoom: map.map.zoom || zoom,
                            center: map.map.center || center
                        }
                    }, null, !map.map.zoom && (map.map.bbox || {bounds: map.map.maxExtent}));
                    onClose(); // close if loaded the map
                }
                if (layers.length > 0) {
                    const isAnnotation = layers && layers[0].name === "Annotations";
                    if (!annotationsLayer && isAnnotation) {
                        loadAnnotations(layers[0].features, false);
                        onClose(); // close if loaded a new annotation layer
                    } else {
                        let validLayers = [];
                        layers.forEach((layer) => {
                            const valid = checkIfLayerFitsExtentForProjection(layer);
                            valid && validLayers.push(layer); // if invalid show an error to the user.
                        });
                        setLayers(validLayers, warnings); // TODO: warnings
                    }
                }
            }
    }),
    mapPropsStream(props$ => props$.merge(
        props$
            .distinctUntilKeyChanged('files')
            .filter(({files}) => files)
            .do(({ files, useFiles = () => { }, warnings = []}) => useFiles(files, warnings))
            .ignoreElements()
    ))
);

