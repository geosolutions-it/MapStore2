

/**
 * Export all converters in a single object
 * @name converters
 * @memberof utils.Filter
 * @type {object}
 * @prop {function} toCql
 * @prop {function} toOgc
 */
import cql from './cql';
import geostyler from './geostyler';
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
    return !!getConverter(from, to);
};

converters.cql = cql;
converters.geostyler = geostyler;

converters.logic = {
    cql: (filter) => {
        if (filter.logic) {
            const logic = filter.logic.toUpperCase();
            const convertFilter = (f) => {
                if (canConvert(f.format, 'cql')) {
                    return getConverter(f.format, 'cql')(f);
                }
                return null;
            };

            if (!filter.filters || filter.filters.length === 0) {
                return []; // TODO: check consistency
            } else if (filter.filters.length === 1) {
                if (logic === 'NOT') {
                    return `(${logic} (${convertFilter(filter.filters[0])}))`;
                }
                return convertFilter(filter.filters[0]);
            }
            return `((${filter.filters.map(convertFilter).join(`) ${logic} (`)}))`;
        }
        return null;
    },
    ogc: (filter, ...opts) => {
        if (filter.logic) {
            const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
            const logic = capitalizeFirstLetter(filter.logic);
            const convertFilter = (f) => {
                if (canConvert(f.format, 'ogc')) {
                    return getConverter(f.format, 'ogc')(f, ...opts);
                }
                return null;
            };

            if (!filter.filters || filter.filters.length === 0) {
                return []; // TODO: check consistency
            } else if (filter.filters.length === 1) {
                if (logic === 'Not') {
                    return `<ogc:Not>${convertFilter(filter.filters[0])}</ogc:Not>`;
                }
                return convertFilter(filter.filters[0]);
            }


            const options = opts[0] ?? {filterNS: "ogc"};
            return  `<${options?.filterNS}:${logic}>${filter.filters.map(convertFilter).join("")}</${options?.filterNS}:${logic}>`;

        }
        return null;
    },
    geostyler: (filter) => {
        if (filter.logic) {
            const convertFilter = (f) => {
                if (canConvert(f.format, 'geostyler')) {
                    return getConverter(f.format, 'geostyler')(f);
                }
                return null;
            };
            if (!filter.filters || filter.filters.length === 0) {
                return [];
            } else if (filter.filters.length === 1) {
                if (filter.logic.toUpperCase() === 'NOT') {
                    return ['!', convertFilter(filter.filters[0])];
                }
                return convertFilter(filter.filters[0]);
            }
            return [ filter.logic.toUpperCase(), ...filter.filters.map(convertFilter) ];
        }
        return null;
    }
};
