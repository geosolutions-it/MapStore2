const coordinateArrayToWKT = (coordinates) => {
    const [x, y] = coordinates;
    return `${x} ${y}`;
};

/**
 * Convert a geoJSON Point to a WKT Point
 * @private
 * @param {object} point the geoJSON Point
 * @returns {string} WKT string
 */
const pointToWKT = (point) => {
    const {coordinates} = point;
    return `POINT(${coordinateArrayToWKT(coordinates)})`;
};

/**
 * Convert a geoJSON MultiPoint to a WKT MultiPoint
 * @private
 * @param {object} multiPoint the geoJSON MultiPoint
 * @returns {string} WKT string
 *
 */
const multiPointToWKT = (multiPoint) => {
    const {coordinates} = multiPoint;
    const points = coordinates.map(coordinateArrayToWKT);
    return `MULTIPOINT(${points.join(', ')})`;
};

/**
 * Convert a geoJSON LineString to a WKT LineString
 * @private
 * @param {object} lineString the geoJSON LineString
 * @returns {string} WKT string
 */
const lineStringToWKT = (lineString) => {
    const {coordinates} = lineString;
    const points = coordinates.map(coordinateArrayToWKT);
    return `LINESTRING(${points.join(', ')})`;
};

/**
 * Convert a geoJSON MultiLineString to a WKT MultiLineString
 * @private
 * @param {object} multiLineString the geoJSON MultiLineString
 * @returns {string} WKT string
 */
const multiLineStringToWKT = (multiLineString) => {
    const {coordinates} = multiLineString;
    const lines = coordinates.map(line => `(${line.map(coordinateArrayToWKT).join(', ')})`);
    return `MULTILINESTRING(${lines.join(', ')})`;
};

/**
 * Convert a geoJSON Polygon to a WKT Polygon
 * @private
 * @param {object} polygon the geoJSON Polygon
 * @returns {string} WKT string
 */
const polygonToWKT = (polygon) => {
    const {coordinates} = polygon;
    const rings = coordinates.map(ring => `(${ring.map(coordinateArrayToWKT).join(', ')})`);
    return `POLYGON(${rings.join(', ')})`;
};

/**
 * Convert a geoJSON MultiPolygon to a WKT MultiPolygon
 * @private
 * @param {object} multiPolygon the geoJSON MultiPolygon
 * @returns {string} WKT string
 */
const multiPolygonToWKT = (multiPolygon) => {
    const {coordinates} = multiPolygon;
    const polygons = coordinates.map(polygon => `(${polygon.map(ring => `(${ring.map(coordinateArrayToWKT).join(', ')})`).join(', ')})`);
    return `MULTIPOLYGON(${polygons.join(', ')})`;
};

let toWKT;

/**
 * Convert a geoJSON GeometryCollection to a WKT GeometryCollection
 * @private
 * @param {object} geometryCollection the geoJSON GeometryCollection
 * @returns {string} WKT string
 */
const geometryCollectionToWKT = (geometryCollection) => {
    const {geometries} = geometryCollection;
    const geometriesWKT = geometries.map(geoJSON => toWKT(geoJSON));
    return `GEOMETRYCOLLECTION(${geometriesWKT.join(', ')})`;
};

/**
 * Converts a geoJSON geometry to a WKT geometry
 * @param {object} geoJSON the geoJSON geometry
 * @returns {string} WKT string
 * @example
 * const geoJSON = {
 *    type: 'Point',
 *   coordinates: [30, 10]
 * };
 * const wkt = toWKT(geoJSON);
 * // wkt = 'POINT(30 10)'
 */
toWKT = (geoJSON) => {
    switch (geoJSON.type) {
    case 'Point':
        return pointToWKT(geoJSON);
    case 'MultiPoint':
        return multiPointToWKT(geoJSON);
    case 'LineString':
        return lineStringToWKT(geoJSON);
    case 'MultiLineString':
        return multiLineStringToWKT(geoJSON);
    case 'Polygon':
        return polygonToWKT(geoJSON);
    case 'MultiPolygon':
        return multiPolygonToWKT(geoJSON);
    case 'GeometryCollection':
        return geometryCollectionToWKT(geoJSON);
    default:
        return '';
    }
};

export default toWKT;
