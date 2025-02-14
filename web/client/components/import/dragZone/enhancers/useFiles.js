
import { compose, mapPropsStream, withHandlers } from 'recompose';
import { checkIfLayerFitsExtentForProjection } from '../../../../utils/CoordinatesUtils';
import { DEFAULT_VECTOR_FILE_MAX_SIZE_IN_MB } from '../../../../utils/FileUtils';

/**
 * Enhancer for processing map configuration and layers object
 * Recognizes if the file dropped is a map or a layer
 * Then a related action for loading a map or a layer is performed and throws warning if any error occurs
 */
export default compose(
    withHandlers({
        useFiles: ({ currentMap, loadMap = () => { }, loadMapInfo = () => { }, onClose = () => { }, setLayers = () => { },
            annotationsLayer, loadAnnotations = () => {}, warning = () => {}}) =>
            ({ layers = [], maps = [] }, warnings) => {
                const map = maps[0]; // only 1 map is allowed
                if (map) {
                    // also handles maps without zoom or center
                    const { zoom, center, mapId } = currentMap;
                    const { fileName } = map;
                    loadMap({
                        ...map,
                        map: {
                            ...map.map,
                            zoom: map.map.zoom || zoom,
                            center: map.map.center || center
                        }
                    }, mapId ? mapId : null, !map.map.zoom && (map.map.bbox || {bounds: map.map.maxExtent}));
                    // keeps mapinfo of pre-existing map if present (to keep save map overwrite)
                    if (mapId && fileName) {
                        loadMapInfo(mapId);
                    }
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
                            const isFileSizeNotValid = !!layer?.exceedFileMaxSize;     // this check is for file size limit for vector layer
                            const valid = layer.type === "vector" ? (checkIfLayerFitsExtentForProjection(layer) && !isFileSizeNotValid) : true;
                            if (valid && !isFileSizeNotValid) {
                                validLayers.push(layer);
                            } else if (isFileSizeNotValid) {
                                warning({
                                    title: "notification.warning",
                                    message: "mapImport.errors.exceedFileSizeLimit",
                                    autoDismiss: 6,
                                    position: "tc",
                                    values: {filename: layer.name ?? " ", maxfilesize: layer?.fileSizeLimitInMB ?? DEFAULT_VECTOR_FILE_MAX_SIZE_IN_MB}
                                });
                            } else {
                                warning({
                                    title: "notification.warning",
                                    message: "mapImport.errors.fileBeyondBoundaries",
                                    autoDismiss: 6,
                                    position: "tc",
                                    values: {filename: layer.name ?? " "}
                                });
                            }
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

