import expect from "expect";
import { getIntervals, getInterval, createGrid, densifyLine, getGridGeoJson} from "../MapGridsUtils";
import proj4 from 'proj4';

const identityTransform = (p) => p;
const identityFormatter = v => v;
const TRANSFORM_4326_3857 = proj4("EPSG:4326", "EPSG:3857").forward;

describe('Test MapGridsUtils getIntervals', () => {
    it('getIntervals for EPSG:4326', () => {
        expect(getIntervals("EPSG:4326").length).toBeGreaterThan(0);
    });
    it('getIntervals for EPSG:3857', () => {
        expect(getIntervals("EPSG:3857").length).toBeGreaterThan(0);
    });
    it('getIntervals for EPSG:3857 and EPSG:4326 are different', () => {
        expect(getIntervals("EPSG:3857")[0] === getIntervals("EPSG:4326")[0]).toBe(false);
    });
});

describe('Test MapGridsUtils getInterval', () => {
    const GRID_CELL_SIZE = 100;
    const EPSG4326_INTERVALS = getIntervals("EPSG:4326");

    it('getInterval for map and grid in EPSG:4326 and resolution 1', () => {
        expect(getInterval(EPSG4326_INTERVALS, [0, 0], GRID_CELL_SIZE, 1, identityTransform)).toBe(90);
    });
    it('getInterval for map and grid in EPSG:4326 and resolution 0.5', () => {
        expect(getInterval(EPSG4326_INTERVALS, [0, 0], GRID_CELL_SIZE, 0.5, identityTransform)).toBe(45);
    });
    it('getInterval for map and grid in EPSG:4326 and resolution 0.2', () => {
        expect(getInterval(EPSG4326_INTERVALS, [0, 0], GRID_CELL_SIZE, 0.2, identityTransform)).toBe(20);
    });

    it('getInterval for map in EPSG:3857 and grid in EPSG:4326 and resolution 100000', () => {
        expect(getInterval(EPSG4326_INTERVALS, [0, 0], GRID_CELL_SIZE, 100000, TRANSFORM_4326_3857)).toBe(90);
    });
    it('getInterval for map in EPSG:3857 and grid in EPSG:4326 and resolution 50000', () => {
        expect(getInterval(EPSG4326_INTERVALS, [0, 0], GRID_CELL_SIZE, 50000, TRANSFORM_4326_3857)).toBe(45);
    });
    it('getInterval for map in EPSG:3857 and grid in EPSG:4326 and resolution 20000', () => {
        expect(getInterval(EPSG4326_INTERVALS, [0, 0], GRID_CELL_SIZE, 20000, TRANSFORM_4326_3857)).toBe(20);
    });
});

describe('Test MapGridsUtils createGrid', () => {
    const EPSG_4326_EXTENT = [-180, -90, 180, 90];
    const EPSG_3857_EXTENT = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];
    const MAX_LINES = 100;
    it('createGrid for map and grid in EPSG:4326 and interval 45, no labels', () => {
        const grid = createGrid(
            45,
            "EPSG:4326",
            "EPSG:4326",
            EPSG_4326_EXTENT,
            EPSG_4326_EXTENT,
            [0, 0],
            1.0,
            MAX_LINES,
            false,
            identityFormatter,
            identityFormatter,
            0,
            0
        );
        expect(grid.xLines.length).toBe(9);
        expect(grid.yLines.length).toBe(5);
        expect(grid.xLabels.length).toBe(0);
        expect(grid.yLabels.length).toBe(0);
        expect(grid.xLines[0]).toEqual([ -180, -90, -180, 90]);
        expect(grid.xLines[4]).toEqual([0, -90, 0, 90]);
        expect(grid.xLines[8]).toEqual([180, -90, 180, 90]);
        expect(grid.yLines[0]).toEqual([-180, -90, 180, -90]);
        expect(grid.yLines[2]).toEqual([-180, 0, 180, 0]);
        expect(grid.yLines[4]).toEqual([-180, 90, 180, 90]);
    });
    it('createGrid for map and grid in EPSG:4326 small extent', () => {
        const grid = createGrid(
            45,
            "EPSG:4326",
            "EPSG:4326",
            [-88, -45, 88, 45],
            EPSG_4326_EXTENT,
            [0, 0],
            1.0,
            MAX_LINES,
            false,
            identityFormatter,
            identityFormatter,
            0,
            0
        );
        expect(grid.xLines.length).toBe(5);
        expect(grid.yLines.length).toBe(3);
        expect(grid.xLabels.length).toBe(0);
        expect(grid.yLabels.length).toBe(0);
        expect(grid.xLines[0]).toEqual([-88, -45, -88, 45]);
        expect(grid.xLines[1]).toEqual([ -45, -45, -45, 45 ]);
        expect(grid.xLines[2]).toEqual([0, -45, 0, 45]);
        expect(grid.xLines[3]).toEqual([ 45, -45, 45, 45 ]);
        expect(grid.xLines[4]).toEqual([ 88, -45, 88, 45 ]);
        expect(grid.yLines[0]).toEqual([-88, -45, 88, -45 ]);
        expect(grid.yLines[1]).toEqual([-88, 0, 88, 0]);
        expect(grid.yLines[2]).toEqual([-88, 45, 88, 45]);
    });
    it('createGrid for map and grid in EPSG:4326 and interval 45, with labels', () => {
        const grid = createGrid(
            45,
            "EPSG:4326",
            "EPSG:4326",
            EPSG_4326_EXTENT,
            EPSG_4326_EXTENT,
            [0, 0],
            1.0,
            MAX_LINES,
            true,
            identityFormatter,
            identityFormatter,
            0,
            0
        );
        expect(grid.xLabels.length).toBe(9);
        expect(grid.yLabels.length).toBe(5);
        expect(grid.xLabels[0].text).toBe(-180);
        expect(grid.xLabels[4].text).toBe(0);
        expect(grid.xLabels[8].text).toBe(180);
        expect(grid.yLabels[0].text).toBe(-90);
        expect(grid.yLabels[2].text).toBe(0);
        expect(grid.yLabels[4].text).toBe(90);
    });
    it('createGrid for map and grid in EPSG:4326 and interval 45, with labels and custom formatters', () => {
        const grid = createGrid(
            45,
            "EPSG:4326",
            "EPSG:4326",
            EPSG_4326_EXTENT,
            EPSG_4326_EXTENT,
            [0, 0],
            1.0,
            MAX_LINES,
            true,
            v => v + 1,
            v => v - 1,
            0,
            0
        );
        expect(grid.xLabels.length).toBe(9);
        expect(grid.yLabels.length).toBe(5);
        expect(grid.xLabels[0].text).toBe(-179);
        expect(grid.xLabels[4].text).toBe(1);
        expect(grid.xLabels[8].text).toBe(181);
        expect(grid.yLabels[0].text).toBe(-91);
        expect(grid.yLabels[2].text).toBe(-1);
        expect(grid.yLabels[4].text).toBe(89);
    });
    it('createGrid for map and grid in EPSG:4326 and interval 45, with frame', () => {
        const grid = createGrid(
            45,
            "EPSG:4326",
            "EPSG:4326",
            EPSG_4326_EXTENT,
            EPSG_4326_EXTENT,
            [0, 0],
            1.0,
            MAX_LINES,
            true,
            identityFormatter,
            identityFormatter,
            0,
            0,
            0.1
        );
        expect(grid.frame).toEqual({
            exterior: [ [ -198, -108 ], [ 198, -108 ], [ 198, 108 ], [ -198, 108 ], [ -198, -108 ] ],
            interior: [ [ -162, -72 ], [ 162, -72 ], [ 162, 72 ], [ -162, 72 ], [ -162, -72 ] ]
        });
    });
    it('createGrid for map in EPSG:3857 and grid in EPSG:4326 and interval 45', () => {
        const grid = createGrid(
            45,
            "EPSG:3857",
            "EPSG:4326",
            EPSG_3857_EXTENT,
            EPSG_3857_EXTENT,
            [0, 0],
            1.0,
            MAX_LINES,
            false,
            identityFormatter,
            identityFormatter,
            0,
            0
        );
        expect(grid.xLines.length).toBe(9);
        expect(grid.yLines.length).toBeGreaterThan(0);
        expect(grid.xLabels.length).toBe(0);
        expect(grid.yLabels.length).toBe(0);
        expect(grid.xLines[0].map(i => Math.round(i))).toEqual([-20026376, -20048966, -20026376, 20048966]);
        expect(grid.xLines[4].map(i => Math.round(i))).toEqual([0, -20048966, 0, 20048966]);
        expect(grid.xLines[8].map(i => Math.round(i))).toEqual([20026376, -20048966, 20026376, 20048966]);
        expect(grid.yLines[0].map(i => Math.round(i))).toEqual([-20026376, -5621521, 20026376, -5621521]);
        expect(grid.yLines[1].map(i => Math.round(i))).toEqual([-20026376, -0, 20026376, -0]);
        expect(grid.yLines[3].map(i => Math.round(i))).toEqual([-20026376, 20048966, 20026376, 20048966]);
    });
});

describe("densifyLine", () => {
    beforeEach(() => {
        proj4.defs(
            'ESRI:53009',
            '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 ' +
                '+b=6371000 +units=m +no_defs'
        );
    });
    it("interpolate EPSG:4326 to EPSG:4326", () => {
        expect(densifyLine((frac) => {
            return [0, -90 + 180 * frac];
        }, "EPSG:4326", "EPSG:4326", 0.1)).toEqual([0, -90, 0, 90]);
    });
    it("interpolate EPSG:4326 to EPSG:3857", () => {
        expect(densifyLine((frac) => {
            return [0, -85 + 170 * frac];
        }, "EPSG:4326", "EPSG:3857", 0.1).map(Math.round)).toEqual([ 0, -19971869, 0, 19971869]);
    });
    it("interpolate EPSG:4326 to EPSG:53009", () => {
        expect(densifyLine((frac) => {
            return [45, -85 + 170 * frac];
        }, "EPSG:4326", "ESRI:53009", 0.1).map(Math.round).length).toBeGreaterThan(4);
    });
});

describe("getGridGeoJson", () => {
    const EPSG_4326_EXTENT = [-180, -90, 180, 90];
    it("map and grid in EPSG:4326 and zoom 0, no labels", () => {
        const geoJson = getGridGeoJson({
            mapProjection: "EPSG:4326",
            gridProjection: "EPSG:4326",
            extent: EPSG_4326_EXTENT,
            zoom: 0
        });
        expect(geoJson.type).toBe("FeatureCollection");
        expect(geoJson.features.length).toBe(8);
        expect(geoJson.features[0].geometry.coordinates).toEqual([[-180, -90], [-180, 90]]);
        expect(geoJson.features[4].geometry.coordinates).toEqual([[180, -90], [180, 90]]);
        expect(geoJson.features[5].geometry.coordinates).toEqual([[-180, -90], [180, -90]]);
        expect(geoJson.features[7].geometry.coordinates).toEqual([[-180, 90], [180, 90]]);
    });
    it("map and grid in EPSG:4326 and zoom 5.2, no labels", () => {
        const geoJson = getGridGeoJson({
            mapProjection: "EPSG:4326",
            gridProjection: "EPSG:4326",
            extent: [5, 40, 10, 44],
            zoom: 5.2
        });
        expect(geoJson.type).toBe("FeatureCollection");
        expect(geoJson.features.length).toBe(7);
        expect(geoJson.features[1].geometry.coordinates.map(p => p.map(Math.round))).toEqual([[ 6, 40 ], [ 6, 44 ]]);
        expect(geoJson.features[4].geometry.coordinates.map(p => p.map(Math.round))).toEqual([[ 5, 40 ], [ 10, 40 ]]);
        expect(geoJson.features[6].geometry.coordinates.map(p => p.map(Math.round))).toEqual([[5, 44], [10, 44]]);
    });
    it("map and grid in EPSG:4326 and zoom 5, with labels", () => {
        const geoJson = getGridGeoJson({
            mapProjection: "EPSG:4326",
            gridProjection: "EPSG:4326",
            extent: [5, 40, 10, 44],
            zoom: 5,
            withLabels: true
        });
        expect(geoJson.type).toBe("FeatureCollection");
        expect(geoJson.features.length).toBe(14);
        expect(geoJson.features[9].geometry.coordinates).toEqual([ 8, 40 ]);
        expect(geoJson.features[9].properties.valueText).toEqual("8° 00′ 00″ E");
        expect(geoJson.features[10].geometry.coordinates).toEqual([ 10, 40 ]);
        expect(geoJson.features[10].properties.valueText).toEqual("10° 00′ 00″ E");
        expect(geoJson.features[11].geometry.coordinates).toEqual([ 10, 40 ]);
        expect(geoJson.features[11].properties.valueText).toEqual("40° 00′ 00″ N");
        expect(geoJson.features[13].geometry.coordinates).toEqual([ 10, 44 ]);
        expect(geoJson.features[13].properties.valueText).toEqual("44° 00′ 00″ N");
    });
});
