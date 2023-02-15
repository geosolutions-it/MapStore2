import filterBuilder from '../../ogc/Filter/FilterBuilder';
import fromObject from '../../ogc/Filter/fromObject';
import { read } from '../../ogc/Filter/CQL/parser';
import { isString } from 'lodash';

/**
 * Converts a CQL filter to OGC filter
 * @param {object|string} cqlFilter CQL filter string or object
 * @param {object} fOpts conversion options
 * @param {string} fOpts.filterNS filter namespace
 * @param {string} fOpts.gmlVersion gml version (for geometry tags)
 * @param {string} fOpts.wfsVersion wfs version (for propName tags)
 * @returns {string} OGC filter (without the ogc:Filter container tag, only the part inside) TODO: add option to handle container tag)
 */
export const ogc = (cqlFilter, fOpts) => {
    const fb = filterBuilder(fOpts);
    const toFilter = fromObject(fb);
    if (isString(cqlFilter)) {
        return toFilter(read(cqlFilter));
    }
    return toFilter(read(cqlFilter.body));
};
export const cql = (ogcFilter) => {
    if (isString(ogcFilter)) {
        return ogcFilter;
    }
    return ogcFilter?.body;
};

export default {
    cql,
    ogc
};
