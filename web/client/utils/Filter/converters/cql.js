import filterBuilder from '../../ogc/Filter/FilterBuilder';
import fromObject from '../../ogc/Filter/fromObject';
import { read } from '../..//ogc/Filter/CQL/parser';

export const toOgc = (cqlFilter, fOpts) => {
    const fb = filterBuilder(fOpts);
    const toFilter = fromObject(fb);
    return toFilter(read(cqlFilter));
};
