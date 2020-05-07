/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    mapSelector,
    projectionSelector,
    mapVersionSelector,
    mapIdSelector,
    projectionDefsSelector,
    mapNameSelector,
    mapInfoDetailsUriFromIdSelector,
    configuredRestrictedExtentSelector,
    configuredExtentCrsSelector,
    configuredMinZoomSelector,
    mapIsEditableSelector,
    mouseMoveListenerSelector,
    isMouseMoveActiveSelector,
    isMouseMoveCoordinatesActiveSelector,
    isMouseMoveIdentifyActiveSelector
} = require('../map');
const center = {x: 1, y: 1};
let state = {
    map: {center: center},
    mapInitialConfig: {
        mapId: 123
    }
};

describe('Test map selectors', () => {
    it('test mapInfoDetailsUriFromIdSelector from config', () => {
        const details = "rest%2Fgeostore%2Fdata%2F3495%2Fraw%3Fdecode%3Ddatauri";
        const props = mapInfoDetailsUriFromIdSelector({
            map: {
                present: {
                    info: {
                        details
                    }
                }
            }});

        expect(props).toExist();
        expect(props).toBe(details);
    });
    it('test mapSelector from config', () => {
        const props = mapSelector({config: state});

        expect(props.center).toExist();
        expect(props.center.x).toBe(1);
    });

    it('test mapSelector from map', () => {
        const props = mapSelector(state);

        expect(props.center).toExist();
        expect(props.center.x).toBe(1);
    });
    it('test projectionSelector from map', () => {
        let proj = "EPSG:3857";
        state.map.projection = proj;
        const projection = projectionSelector(state);

        expect(projection).toExist();
        expect(projection).toBe(proj);
    });

    it('test mapSelector from map with history', () => {
        const props = mapSelector({map: {present: {center}}});

        expect(props.center).toExist();
        expect(props.center.x).toBe(1);
    });

    it('test projectionDefsSelector ', () => {
        const props = projectionDefsSelector({localConfig: {projectionDefs: [{code: "some"}, {code: "another"}]}});

        expect(props.length).toBe(2);
    });

    it('test mapSelector from map non configured', () => {
        const props = mapSelector({config: null});

        expect(props).toNotExist();
    });

    it('test mapIdSelector', () => {
        const props = mapIdSelector(state);
        expect(props).toBe(123);
        const propsEmpty = mapIdSelector({});
        expect(propsEmpty).toBe(null);
    });

    it('test mapVersionSelector', () => {
        const props = mapVersionSelector({map: {present: {version: 2}}});
        expect(props).toBe(2);
    });

    it('test mapNameSelector', () => {
        const props = mapNameSelector({map: {present: {info: { name: 'map name' }}}});
        expect(props).toBe('map name');
    });

    it('test mapNameSelector no state', () => {
        const props = mapNameSelector({});
        expect(props).toBe('');
    });
    it('test configuredExtentSelectorCrs', () => {
        const props = configuredExtentCrsSelector({localConfig: {mapConstraints: {crs: 'EPSG:4326'}}});
        expect(props).toBe('EPSG:4326');
    });
    it('test configuredExtentSelector', () => {
        const props = configuredRestrictedExtentSelector({localConfig: {mapConstraints: {restrictedExtent: [12, 12, 12, 12]}}});
        expect(props.length).toBe(4);
    });
    it('test configuredMinZoomSelector', () => {
        const minZoom = configuredMinZoomSelector({ localConfig: { mapConstraints: { minZoom: 12 } } });
        expect(minZoom).toBe(12);
    });
    it('test configuredMinZoomSelector with different projection', () => {
        const minZoom = configuredMinZoomSelector({
            localConfig: {
                mapConstraints: {
                    minZoom: 12,
                    projectionsConstraints: {
                        "EPSG:1234": {
                            minZoom: 14
                        }
                    }
                }
            },
            map: {
                present: {
                    projection: "EPSG:1234"
                }
            }
        });
        expect(minZoom).toBe(14);
    });
    it('test mapIsEditableSelector for map', () => {
        const mapIsEditable = mapIsEditableSelector({map: {present: {info: {canEdit: true}}}});
        expect(mapIsEditable).toBe(true);
    });
    it('test mapIsEditableSelector for context', () => {
        const mapIsEditable = mapIsEditableSelector({context: {resource: {canEdit: true}}});
        expect(mapIsEditable).toBe(true);
    });
    it('test mouseMoveListenerSelector', () => {
        const identifyFloatingTool = ['identifyFloatingTool'];
        const mouseMoveListener = mouseMoveListenerSelector({map: {present: {eventListeners: {mousemove: identifyFloatingTool}}}});
        expect(mouseMoveListener).toBe(identifyFloatingTool);
    });
    it('test isMouseMoveActiveSelector', () => {
        const isMouseMoveActive = isMouseMoveActiveSelector({map: {present: {eventListeners: {mousemove: ['identifyFloatingTool']}}}});
        expect(isMouseMoveActive).toBe(true);
    });
    it('test isMouseMoveCoordinatesActiveSelector', () => {
        const isMouseMoveCoordinatesActive = isMouseMoveCoordinatesActiveSelector({map: {present: {eventListeners: {mousemove: ['mouseposition']}}}});
        expect(isMouseMoveCoordinatesActive).toBe(true);
    });
    it('test isMouseMoveIdentifyActiveSelector', () => {
        const isMouseMoveIdentifyActive = isMouseMoveIdentifyActiveSelector({map: {present: {eventListeners: {mousemove: ['identifyFloatingTool']}}}});
        expect(isMouseMoveIdentifyActive).toBe(true);
    });
});
