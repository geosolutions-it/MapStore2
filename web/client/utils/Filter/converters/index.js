

/**
 * Export all converters in a single object
 * @name converters
 * @memberof utils.Filter
 * @type {object}
 * @prop {function} toCql
 * @prop {function} toOgc
 */
import cql from './cql';
const converters = {

};

/**
 * returns a converter function
 * @param {string|object} from format or filter to convert from
 * @param {*} to format to convert to
 * @returns {function} converter function
 */
export const getConverter = (from, to) => {
    return converters[from?.format ?? from]?.[to];
};
/**
 * Tells if a filter can be converted to another format
 * @param {string|object} from format or filter to convert from
 * @param {*} to format to convert to
 * @returns {boolean} true if the conversion is possible
 */
export const canConvert = (from, to) => {
    return !!getConverter(from, to)
};

converters.cql = cql;

converters.logic = {
    cql: (filter) => {
        if (filter.logic) {
            const logic = filter.logic.toUpperCase();
            const convertFilter = (f) => {
                if (canConvert(f.format, 'cql')) {
                    return getConverter(f.format, 'cql')(f);
                }
            }

            if(!filter.filters || filter.filters.length === 0) {
                return []; // TODO: check consistency
            }
            else if (filter.filters.length === 1) {
                return convertFilter(filter.filters[0]);
            }
            return `((${filter.filters.map(convertFilter).join(`) ${logic} (`)}))`
        }
    },
    ogc: (filter, ...opts) => {
        if (filter.logic) {
            const logic = filter.logic.toUpperCase();
            const convertFilter = (f) => {
                if (canConvert(f.format, 'ogc')) {
                    return getConverter(f.format, 'ogc')(f, ...opts);
                }
            }

            if(!filter.filters || filter.filters.length === 0) {
                return []; // TODO: check consistency
            }
            else if (filter.filters.length === 1) {
                return convertFilter(filter.filters[0]);
            } else {
            const logic = (filter.logic.toUpperCase()) === "AND" ? "And" : "Or";
            return  `<${options?.nsplaceholder}:${logic}>${filter.filters.map(convertFilter).join("")}</${options?.nsplaceholder}:${logic}>`
            }
        }
    }
};
