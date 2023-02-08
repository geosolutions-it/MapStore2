import filterBuilder from '../../ogc/Filter/FilterBuilder';
import fromObject from '../../ogc/Filter/fromObject';
import { read } from '../..//ogc/Filter/CQL/parser';
import { isString } from 'lodash';

/**
 * Converts a CQL filter to OGC filter
 * @param {object|string} cqlFilter CQL filter string or object
 * @param {object} fOpts conversion options
 * @returns {string}
 */
export const ogc = (cqlFilter, fOpts) => {
    const fb = filterBuilder(fOpts);
    const toFilter = fromObject(fb);
    if(isString(cqlFilter)) {
        return toFilter(read(cqlFilter));
    }
    return toFilter(read(cqlFilter.body));
};
export const cql = (ogcFilter) => {
    if(isString(ogcFilter)) {
        return ogcFilter;
    }
    return ogcFilter?.body;
}

export default {
    cql,
    ogc
};
