/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describeCoverage } from '../WCS';
import axios from '../../libs/ajax';
import expect from 'expect';

import MockAdapter from "axios-mock-adapter";
let mockAxios;

let _xmlSample = `<wcs>
<enabled>true</enabled>
<name>WCS</name>
<title>Web Coverage Service</title>
<maintainer>http://geoserver.org/comm</maintainer>
<abstrct>This server implements the WCS specification 1.0 and 1.1.1, it's reference implementation of WCS 1.1.1. All layers published by this service are available on WMS also.
   </abstrct>
<accessConstraints>NONE</accessConstraints>
<fees>NONE</fees>
<versions>
  <org.geotools.util.Version>
    <version>1.0.0</version>
  </org.geotools.util.Version>
  <org.geotools.util.Version>
    <version>1.1.1</version>
  </org.geotools.util.Version>
  <org.geotools.util.Version>
    <version>2.0.1</version>
  </org.geotools.util.Version>
</versions>
<keywords>
  <string>WCS</string>
  <string>WMS</string>
  <string>GEOSERVER</string>
</keywords>
<metadataLink>
  <type>undef</type>
  <about>http://geoserver.sourceforge.net/html/index.php</about>
  <metadataType>other</metadataType>
</metadataLink>
<citeCompliant>false</citeCompliant>
<onlineResource>http://geoserver.org</onlineResource>
<schemaBaseURL>http://schemas.opengis.net</schemaBaseURL>
<verbose>false</verbose>
<gmlPrefixing>false</gmlPrefixing>
<latLon>false</latLon>
<maxInputMemory>0</maxInputMemory>
<maxOutputMemory>0</maxOutputMemory>
</wcs>`;

describe('Test WCS API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('describeCoverage', (done) => {
        mockAxios.onGet().reply(200, _xmlSample);
        describeCoverage([
            'http://gs-stable.geosolutionsgroup.com:443/geoserver/services/wcs/settings',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2/services/wcs/settings',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3/services/wcs/settings'
        ], 'testName').then((result) => {
            try {
                expect(result).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
