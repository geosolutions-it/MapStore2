const {includes, isNil} = require('lodash');
const logical = ["and", "or", "not"];
const operators = {
    '=': "equalTo",
    "<>": "notEqualTo",
    "><": "between",
    '<': "lessThen",
    '<=': "lessThenOrEqualTo",
    '>': "greaterThen",
    '>=': "greaterThenOrEqualTo",
    'like': "like",
    'ilike': "ilike"
    // TODO: support unary operators like isNull
    // TODO: support geometry operations
};
/**
 * Returns a function that convert objects coming from CQL/parser.js --> read function
 * into ogc filter
 * @param {object} filterBuilder The FilterBuilder instance to use for this conversion.
 * @example
 * const cqlFilter = "property = 'value";
 * const filterObj = parser.read(cqlFilter);
 * const fb = filterBuilder();
 * const toOGCFilter = fromObject(fb);
 * const ogcFilter = toOgcFiler(filterObject);
 * // ogcFilter --> "<ogc:PropertyIsEqualTo><ogc:PropertyName>property</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>"
 */
const fromObject = (filterBuilder = {}) => ({type, filters = [], value, property, lowerBoundary, upperBoundary }) => {
    if (includes(logical, type)) {
        return filterBuilder[type](
            ...filters.map(fromObject(filterBuilder))
        );
    }
    return filterBuilder.property(property)[operators[type]](isNil(value) ? lowerBoundary : value, upperBoundary);
};

module.exports = fromObject;
