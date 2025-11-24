import {includes} from 'lodash';
const logical = ["and", "or", "not"];
const cql = ["include"];
const operators = {
    '=': "equal",
    "<>": "notEqual",
    "><": "between",
    '<': "less",
    '<=': "lessOrEqual",
    '>': "greater",
    '>=': "greaterOrEqual",
    'like': "like",
    'ilike': "ilike"
    // TODO: support unary operators like isNull
    // TODO: support geometry operations
};
const spatial = ["intersects", "within", "bbox", "dwithin", "contains"];
const geometryTypes  = ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "GeometryCollection"];
/**
 * Returns a function that convert objects coming from CQL/parser.js --> read function
 * into XML OGC filter
 * @param {object} filterBuilder The FilterBuilder instance to use for this conversion.
 * @example
 * const cqlFilter = "property = 'value";
 * const filterObj = parser.read(cqlFilter);
 * const fb = filterBuilder();
 * const toOGCFilter = fromObject(fb);
 * const ogcFilter = toOgcFiler(filterObject);
 * // ogcFilter --> "<ogc:PropertyIsEqualTo><ogc:PropertyName>property</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>"
 */
const fromObject = (filterBuilder = {}) => ({type, filters = [], args = [], name, value, ...rest }) => {
    if (type === "literal") {
        return filterBuilder.literal(value);
    }
    if (type === "property") {
        return filterBuilder.valueReference(name);
    }
    if (includes(logical, type)) {
        return filterBuilder[type](
            ...filters.map(fromObject(filterBuilder))
        );
    }
    if (includes(cql, type)) {
        return ""; // TODO: implement in filterBuilder as empty filter
    }
    if (includes(Object.keys(operators), type)) {
        return filterBuilder.operations[operators[type]](...args.map(fromObject(filterBuilder)));
    }
    if (includes(filterBuilder.operators, type)) {
        return filterBuilder.operations[type](...args.map(fromObject(filterBuilder)));
    }
    if (includes(geometryTypes, type)) {
        return filterBuilder.geometry({
            type,
            ...rest
        });
    }

    if (includes(spatial, type.toLowerCase())) {
        return filterBuilder.operations[type.toLowerCase()](name, ...args.map(fromObject(filterBuilder)));
    }
    if (typeof filterBuilder[type] === "function") {
        return  filterBuilder[type](name, ...args.map(fromObject(filterBuilder)));
    }
    throw new Error(`Filter type ${type} not supported`);
};

export default fromObject;
