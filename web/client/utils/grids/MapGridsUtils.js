import proj4 from 'proj4';

import { reprojectBbox, bboxToFeatureGeometry } from "../CoordinatesUtils";
import { getProjection } from "../ProjectionUtils";
import booleanIntersects from "@turf/boolean-intersects";
import { getXLabelFormatter, getYLabelFormatter } from './GridLabelsUtils';
import chunk from "lodash/chunk";
import orderBy from "lodash/orderBy";
import { getResolutions } from '../MapUtils';

function squaredDistance(x1, y1, x2, y2) {
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}

function squaredSegmentDistance(p, p1, p2) {
    const [x, y] = p;
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    let finalX1 = x1;
    let finalY1 = y1;
    if (dx !== 0 || dy !== 0) {
        const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
            finalX1 = x2;
            finalY1 = y2;
        } else if (t > 0) {
            finalX1 += dx * t;
            finalY1 += dy * t;
        }
    }
    return squaredDistance(x, y, finalX1, finalY1);
}

const MAX_INTERPOLATION_ITERATIONS = 10000;

function interpolationStepList(fractions, interpolate, transform) {
    const line = fractions.map(interpolate);
    return {
        fractions,
        line,
        reprojectedLine: line.map(transform)
    };
}

function interpolationStep(fraction, interpolate, transform) {
    const point = interpolate(fraction);
    return {
        fraction,
        point,
        reprojected: transform(point)
    };
}

function addPoint(line, point) {
    line.push(point[0]);
    line.push(point[1]);
    return line;
}

/**
 * Densifies a line, so that it is properly curved after reprojection.
 *
 * @param {function} interpolate interpolation function, receives a number from 0 to 1 and returns a point along
 * the line at the given fraction.
 * @param {string} fromProjection source line projection
 * @param {string} toProjection destination line projection
 * @param {number} squaredTolerance tolerance used to identify straight / curved lines
 * @return a densified line
 */
export function densifyLine(interpolate, fromProjection, toProjection, squaredTolerance) {
    const transform = proj4(fromProjection, toProjection).forward;

    let {fractions, line, reprojectedLine} = interpolationStepList([0, 1], interpolate, transform);
    let coordinates = [];
    coordinates = addPoint(coordinates, reprojectedLine[0]);

    let iteration = 0;
    while (iteration < MAX_INTERPOLATION_ITERATIONS && fractions.length > 0) {
        const fractionA = fractions.shift();
        const fractionB = fractions.shift();

        const a = line.shift();
        const b = line.shift();

        const reprojectedA = reprojectedLine.shift();
        const reprojectedB = reprojectedLine.shift();

        const {fraction: newFraction, point: newPoint, reprojected: reprojectedPoint} =
            interpolationStep((fractionA + fractionB) / 2, interpolate, transform);

        if (squaredSegmentDistance(reprojectedPoint, reprojectedA, reprojectedB) < squaredTolerance) {
            coordinates.push(reprojectedB[0]);
            coordinates.push(reprojectedB[1]);
        } else {
            fractions.unshift(fractionA, newFraction, newFraction, fractionB);
            line.unshift(a, newPoint, newPoint, b);
            reprojectedLine.unshift(reprojectedA, reprojectedPoint, reprojectedPoint, reprojectedB);
        }
        iteration++;
    }

    return coordinates;
}

function interpolateX(x, y1, y2, gridProjection, mapProjection, squaredTolerance) {
    return densifyLine(
        /**
         * @param {number} frac Fraction.
         * @return {import("../../coordinate.js").Coordinate} Coordinate.
         */
        function(frac) {
            return [x, y1 + ((y2 - y1) * frac)];
        },
        gridProjection, mapProjection, squaredTolerance);
}

function interpolateY(y, x1, x2, gridProjection, mapProjection, squaredTolerance) {
    return densifyLine(
        /**
         * @param {number} frac Fraction.
         * @return {import("../../coordinate.js").Coordinate} Coordinate.
         */
        function(frac) {
            return [x1 + ((x2 - x1) * frac), y];
        },
        gridProjection, mapProjection, squaredTolerance);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

const INTERVALS = {
    "degrees": [
        90, 45, 30, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.01, 0.005, 0.002, 0.001
    ],
    "m": [
        10_000_000, 5_000_000, 2_000_000, 1_000_000, 500_000, 200_000, 100_000, 50_000, 20_000, 10_000, 5_000, 2_000, 1_000, 500, 200, 100
    ]
};

/**
 * Returns the (default) list of grid intervals (in projection units) for the given projection.
 * @param {string} projection
 */
export function getIntervals(projection) {
    const def = proj4.defs(projection);
    return INTERVALS[def?.units ?? "m"];
}

/**
 * Returns the interval to use (in grid projection units), from the given intervals list,
 * for the given resolution.
 *
 * @param {number[]} intervals list of allowed intervals.
 * @param {Point} center projection center point in grid coordinates.
 * @param {number} cellPixels desired cell size in pixels.
 * @param {number} resolution current map resolution.
 * @param {function} gridToMap function to transform a point from grid coordinates to map coordinates.
 * @return {number} The interval in projection units.
 */
export function getInterval(intervals, center, cellPixels, resolution, gridToMap) {
    const [centerX, centerY] = center;
    const gridCellTargetDist = Math.pow(cellPixels * resolution, 2);
    return intervals.reduce((result, current) => {
        const delta = current / 2;
        const p1 = gridToMap([centerX - delta, centerY - delta]);
        const p2 = gridToMap([centerX + delta, centerY + delta]);
        const dist = Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2);
        if (dist > gridCellTargetDist) {
            return current;
        }
        return result;
    }, -1);
}

function getYLine(y, minX, maxX, squaredTolerance, gridProjection, mapProjection) {
    return interpolateY(y, minX, maxX, gridProjection, mapProjection, squaredTolerance);
}

function getXLine(x, minY, maxY, squaredTolerance, gridProjection, mapProjection) {
    return interpolateX(x, minY, maxY, gridProjection, mapProjection, squaredTolerance);
}

function getXPoint(coordinates, extent, position) {
    const clampedBottom = Math.max(extent[1], coordinates[1]);
    const clampedTop = Math.min(extent[3], coordinates[coordinates.length - 1]);
    const lat = clamp(
        extent[1] + Math.abs(extent[1] - extent[3]) * position,
        clampedBottom, clampedTop);
    const coordinate = [coordinates[0], lat];
    return coordinate;
}

function getXLabels(lines, extent, formatter, position, options) {
    return lines.map((l, index) => {
        const textPoint = getXPoint(l, extent, position);
        return {
            geom: textPoint,
            text: formatter(l[0], {
                ...options,
                index,
                extent
            })
        };
    });
}

function getYPoint(coordinates, extent, position) {
    const clampedLeft = Math.max(extent[0], coordinates[0]);
    const clampedRight = Math.min(extent[2], coordinates[coordinates.length - 2]);
    const lon = clamp(
        extent[0] + Math.abs(extent[0] - extent[2]) * position,
        clampedLeft, clampedRight);
    const coordinate = [lon, coordinates[1]];
    return coordinate;
}

function getYLabels(lines, extent, formatter, position, options) {
    return lines.map((l, index) => {
        const textPoint = getYPoint(l, extent, position);
        return {
            geom: textPoint,
            text: formatter(l[1], {
                ...options,
                index,
                extent
            })
        };
    });
}

function intervalsNumber(min, max, size) {
    return Math.round((max - min) / size) + 1;
}

function linePoints(from, step, min, max) {
    return [...Array(intervalsNumber(min, max, Math.abs(step)) - 1).keys()]
        .map(n => clamp(from + (n + 1) * step, min, max));
}

function intersects(line, extent) {
    return booleanIntersects({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [[line[0], line[1]], [line[2], line[3]]]
        }
    }, bboxToFeatureGeometry(extent));
}

function limitTo(array, maxElements) {
    return array.slice(0, maxElements);
}

function getRectangle(extent) {
    const [minX, minY, maxX, maxY] = extent;
    return [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY], [minX, minY]];
}

export function getFrame(extent, ratio = 0.1) {
    const [minX, minY, maxX, maxY] = extent;
    const size = Math.max(maxX - minX, maxY - minY) * ratio / 2.0;
    const exterior = [minX - size, minY - size, maxX + size, maxY + size];
    const interior = [minX + size, minY + size, maxX - size, maxY - size];
    return {
        exterior: getRectangle(exterior),
        interior: getRectangle(interior)
    };
}

/**
 * Returns an object representing a grid for the given parameters.
 * You can specify different projections for the map and the grid, for example
 * to have a lon-lat grid (EPSG:4326) on a mercator map (EPSG:3857). When projections
 * are different, grid lines may be curved, when reprojected for the map. In this case,
 * those lines need to be densified before being reprojected to the map projection.
 * The squaredTolerance parameter can be used to set the trade-off of the densification process,
 * between speed and precision.
 *
 * @param {number} interval interval (in grid projection units) between the grid lines.
 * @param {string} mapProjection projection used for the map
 * @param {string} gridProjection projection used for the grid
 * @param {number[]} extent map extent as [minX, minY, maxX, maxY]
 * @param {number[]} center projection center point in grid coordinates as [x, y].
 * @param {number} squaredTolerance tolerance used to densify points of curved lines
 * @param {number} maxLines used to limited the max nuber of grid lines generated (defaults to 100).
 * @param {boolean} withLabels if true labels for each grid line is added to the result object.
 * @param {boolean} xFormatter formatter function for labels on the x lines.
 * @param {boolean} yFormatter formatter function for labels on the y lines.
 * @param {number} xLabelPosition x labels offset.
 * @param {number} yLabelPosition y labels offset.
 * @param {number} frameSize if not zero, a frame is drawn around the map, with the given size as a ratio on the map extent.
 * @param {object} labelOptions options that can be used by the label formatter (center, zoom, etc.)
 * @return {object} An object with the XLines, yLines, xLabels, yLabels properties, representing arrays of
 * geometries for the related object.
 */
export function createGrid(interval, mapProjection, gridProjection, extent, projectionExtent, center, squaredTolerance, maxLines, withLabels, xFormatter, yFormatter, xLabelPosition, yLabelPosition, frameSize, labelOptions = {}) {
    if (interval === -1) {
        return {
            xLines: [],
            yLines: [],
            xLabels: [],
            yLabels: [],
            frame: null
        };
    }
    const mapToGrid = proj4(mapProjection, gridProjection).forward;
    const [gridCenterX, gridCenterY] = mapToGrid(center);

    const [minX, minY, maxX, maxY] = reprojectBbox([
        Math.max(extent[0], projectionExtent[0]),
        Math.max(extent[1], projectionExtent[1]),
        Math.min(extent[2], projectionExtent[2]),
        Math.min(extent[3], projectionExtent[3])
    ], mapProjection, gridProjection || 'EPSG:4326');

    const [projMinX, projMinY, projMaxX, projMaxY] = reprojectBbox(
        projectionExtent,
        mapProjection,
        gridProjection || 'EPSG:4326'
    );

    const centerX = clamp(
        Math.floor(gridCenterX / interval) * interval,
        projMinX,
        projMaxX
    );
    const leftPoints = orderBy(linePoints(centerX, -interval, minX, centerX));
    const rightPoints = orderBy(linePoints(centerX, interval, centerX, maxX));

    const centerY = clamp(
        Math.floor(gridCenterY / interval) * interval,
        projMinY,
        projMaxY
    );
    const downPoints = orderBy(linePoints(centerY, -interval, minY, centerY));
    const upPoints = orderBy(linePoints(centerY, interval, centerY, maxY));

    const xLines = limitTo([...leftPoints, centerX, ...rightPoints]
        .map(p => getXLine(p, minY, maxY, squaredTolerance, gridProjection || "EPSG:4326", mapProjection))
        .filter(l => intersects(l, extent)), maxLines);
    const yLines = limitTo([...downPoints, centerY, ...upPoints]
        .map(p => getYLine(p, minX, maxX, squaredTolerance, gridProjection || "EPSG:4326", mapProjection))
        .filter(l => intersects(l, extent)), maxLines);

    const frame = frameSize ? getFrame(extent, frameSize) : null;

    return {
        xLines: xLines,
        yLines: yLines,
        xLabels: withLabels ? getXLabels(xLines, extent, xFormatter, xLabelPosition, labelOptions) : [],
        yLabels: withLabels ? getYLabels(yLines, extent, yFormatter, yLabelPosition, labelOptions) : [],
        frame
    };

}

function getCenter(extent) {
    return [
        (extent[2] + extent[0]) / 2.0,
        (extent[3] + extent[1]) / 2.0
    ];
}

/**
 * Returns a GeoJSON representing a grid with the given parameters.
 *
 * @param {string} mapProjection projection used for the map
 * @param {string} gridProjection projection used for the grid
 * @param {number[]} extent map extent as [minX, minY, maxX, maxY]
 * @param {number[]} center projection center point in grid coordinates as [x, y].
 * @param {number} zoom current zoom, used to calculate grid interval
 * @param {boolean} withLabels if true labels for each grid line is added to the result object.
 * @param {boolean} xFormatter formatter function for labels on the x lines.
 * @param {boolean} yFormatter formatter function for labels on the y lines.
 * @param {number} xLabelPosition x labels offset.
 * @param {number} yLabelPosition y labels offset.
 * @param {number} maxLines used to limited the max nuber of grid lines generated (defaults to 100).
 * @param {number[]} intervals list of intervals to use (one is choosed based on the current zoom and targetSize).
 * @param {number} targetSize approximate pixels for every grid cell.
 * @param {number[]} resolutions list of map resolutions.
 * @param {object} xLabelStyle style to use for x labels.
 * @param {object} yLabelStyle style to use for y labels.
 * @param {number} pixelRatio defaults to the browser devicePixelRatio, used to support hidpi screens, such as Retina.
 * @return {object} GeoJSON representation of the grid lines and labels
 */
export function getGridGeoJson({
    mapProjection,
    gridProjection,
    extent,
    center = null,
    zoom,
    withLabels = false,
    xLabelFormatter,
    yLabelFormatter,
    xLabelPosition = 0,
    yLabelPosition = 1,
    maxLines = 100,
    intervals,
    targetSize = 100,
    resolutions,
    xLabelStyle,
    yLabelStyle,
    pixelRatio = devicePixelRatio,
    frameSize = 0.0
}) {
    const resolution = (resolutions ?? getResolutions(mapProjection))[Math.round(zoom)];
    const mapToGrid = proj4(mapProjection, gridProjection).forward;
    const gridToMap = proj4(gridProjection, mapProjection).forward;
    const projectionCenter = mapToGrid(getCenter(getProjection(gridProjection).extent));
    const interval = getInterval(
        intervals ?? getIntervals(gridProjection),
        projectionCenter,
        targetSize,
        resolution,
        gridToMap
    );
    const squaredTolerance =
                resolution * resolution / (4 * pixelRatio * pixelRatio);
    const grid = createGrid(
        interval,
        mapProjection,
        gridProjection,
        extent,
        getProjection(mapProjection).extent,
        center ?? getCenter(extent),
        squaredTolerance,
        maxLines,
        withLabels,
        getXLabelFormatter(gridProjection, xLabelFormatter),
        getYLabelFormatter(gridProjection, yLabelFormatter),
        xLabelPosition,
        yLabelPosition,
        frameSize,
        {
            center,
            resolution,
            interval
        }
    );
    const lines = [...grid.xLines, ...grid.yLines].map(l => ({
        type: "Feature",
        properties: {
            "ms_style": "lines"
        },
        geometry: {
            type: "LineString",
            coordinates: chunk(l, 2)
        }
    }));
    const xPoints = [...grid.xLabels].map(p => ({
        type: "Feature",
        properties: {
            "ms_style": xLabelStyle ? {
                ...xLabelStyle,
                label: p.text
            } : "xlabels",
            valueText: p.text
        },
        geometry: {
            type: "Point",
            coordinates: p.geom
        }
    }));
    const yPoints = [...grid.yLabels].map(p => ({
        type: "Feature",
        properties: {
            "ms_style": yLabelStyle ? {
                ...yLabelStyle,
                label: p.text
            } : "ylabels",
            valueText: p.text
        },
        geometry: {
            type: "Point",
            coordinates: p.geom
        }
    }));
    const frame = grid.frame ? [grid.frame].map(f => ({
        type: "Feature",
        properties: {
            "ms_style": "frame"
        },
        geometry: {
            type: "Polygon",
            coordinates: [f.exterior, f.interior]
        }
    })) : [];

    return {
        type: "FeatureCollection",
        features: [...lines, ...frame, ...xPoints, ...yPoints]
    };
}
