/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { describeDomains, getHistogram } = require('../MultiDim');

describe('MultiDim API', () => {
    it('describeDomains', (done) => {
        describeDomains('base/web/client/test-resources/wmts/DescribeDomains.xml', "test:layer").subscribe(
            result => {
                try {
                    const domains = result.Domains.DimensionDomain;
                    expect(result).toExist();
                    expect(domains.length).toBe(3);
                    expect(domains[0].Identifier).toBe("elevation");
                    expect(domains[0].Domain).toBe("0.0,200.0,400.0,600.0,800.0,1000.0");
                    expect(domains[1].Identifier).toBe("REFERENCE_TIME");
                    expect(domains[1].Domain).toBe("2016-02-23T00:00:00.000Z,2016-02-24T00:00:00.000Z");
                    expect(domains[2].Identifier).toBe("time");
                    expect(domains[2].Domain).toBe("2016-02-23T03:00:00.000Z,2016-02-23T06:00:00.000Z");
                    done();
                } catch (ex) {
                    done(ex);
                }
            },
            error => done(error)
        );
    });
    it('getHistogram', (done) => {
        getHistogram('base/web/client/test-resources/wmts/Histogram1.xml', "test:layer").subscribe(
            result => {
                try {
                    const histogram = result.Histogram;
                    expect(histogram).toExist();
                    expect(histogram.Identifier).toBe("time");
                    expect(histogram.Values).toBe("240,0,240,0,0,240");
                    expect(histogram.Domain).toBe("2016-02-23T00:00:00.000Z/2016-02-25T00:00:00.000Z/PT8H");
                    done();
                } catch (ex) {
                    done(ex);
                }
            },
            error => done(error)
        );
    });
});
