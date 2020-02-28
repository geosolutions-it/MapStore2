import csw from '../api/CSW';
import wms from '../api/WMS';
import wmts from '../api/WMTS';
import * as tms from '../api/TMS';
import backgrounds from '../api/mapBackground';

/**
 * API for catalog
 * Must implement:
 *
 */
export default {
    csw,
    wms,
    tms,
    wmts,
    backgrounds
};
