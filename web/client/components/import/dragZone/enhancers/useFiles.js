
import { compose, mapPropsStream, withHandlers } from 'recompose';
import turfBbox from '@turf/bbox';

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
                        const currentMapBounds = currentMap.bbox.bounds;
                        const [minX, minY, maxX, maxY] = turfBbox({type: 'FeatureCollection', features: layers[0].features});
                        console.log({currentMapBounds, minX, minY, maxX, maxY});
                        // if within bounds setLayers else show error notification
                        // warnings("Invalid selection");
                        // setLayers(layers, warnings); // TODO: warnings
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
