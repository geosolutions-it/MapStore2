
const {compose, mapPropsStream, withHandlers} = require('recompose');

module.exports = compose(
    withHandlers({
        useFiles: ({ currentMap, loadMap = () => { }, onClose = () => { }, setLayers = () => { } }) =>
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
                }
                if (layers.length > 0) {
                    setLayers(layers, warnings); // TODO: warnings
                } else {
                    // close if loaded only the map
                    if (map) {
                        onClose();
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
