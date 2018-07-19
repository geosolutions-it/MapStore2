const {includes} = require('lodash');
const logical = ["and", "or", "not"];
const operators = {
    '=': "equalTo",
    "<>": "notEqualTo",
    '<': "lessThen",
    '<=': "lessThenOrEqualTo",
    '>': "greaterThen",
    '>=': "greaterThenOrEqualTo",
    'like': "like",
    'ilike': "ilike"
    // TODO: support ternary operators like between '><' or unary like isNull
    // TODO: support geometry operations
};
const fromObject = (filterBuilder = {}) => ({type, filters =[], value, property }) => {
    if (includes(logical, type)) {
        return filterBuilder[type](
            ...filters.map(fromObject(filterBuilder))
        );
    }
    return filterBuilder.property(property)[operators[type]](value);
};

module.exports = fromObject;
