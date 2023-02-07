import filterBuilder from '../../ogc/Filter/FilterBuilder';
import fromObject from '../../ogc/Filter/fromObject';
import { read } from '../..//ogc/Filter/CQL/parser';

export const toOGC = (cqlFilter, fOpts) => {
    const fb = filterBuilder(fOpts);
    const toFilter = fromObject(fb);
    return toFilter(read(cqlFilter.value));
};
export const toCQL = (ogcFilter) => {
    return ogcFilter.value;
}

export default {
    toCQL,
    toOGC
};
