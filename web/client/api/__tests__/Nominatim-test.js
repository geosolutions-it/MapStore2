/*
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Nominatim from '../Nominatim';
import expect from 'expect';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

let mockAxios;

describe('Test Nominatim API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    describe('geocode', () => {
        it('should use default host and protocol when no options provided', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('nominatim.openstreetmap.org');
                    expect(config.url).toContain('https');
                } catch (e) {
                    done(e);
                }
                return [200, []];
            });
            Nominatim.geocode('Bern').then(() => done()).catch(done);
        });

        it('should use custom host from options', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('my-nominatim.example.com');
                    expect(config.url).toNotContain('nominatim.openstreetmap.org');
                } catch (e) {
                    done(e);
                }
                return [200, []];
            });
            Nominatim.geocode('Bern', {host: 'my-nominatim.example.com'}).then(() => done()).catch(done);
        });

        it('should use custom protocol from options', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('http://');
                    expect(config.url).toNotContain('https://');
                } catch (e) {
                    done(e);
                }
                return [200, []];
            });
            Nominatim.geocode('Bern', {protocol: 'http'}).then(() => done()).catch(done);
        });

        it('should use custom host and protocol from options', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('http://');
                    expect(config.url).toContain('my-nominatim.example.com');
                } catch (e) {
                    done(e);
                }
                return [200, []];
            });
            Nominatim.geocode('Bern', {
                host: 'my-nominatim.example.com',
                protocol: 'http'
            }).then(() => done()).catch(done);
        });

        it('should not pass host and protocol as query parameters', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toNotContain('host=');
                    expect(config.url).toNotContain('protocol=');
                } catch (e) {
                    done(e);
                }
                return [200, []];
            });
            Nominatim.geocode('Bern', {
                host: 'my-nominatim.example.com',
                protocol: 'http'
            }).then(() => done()).catch(done);
        });

        it('should pass other options as query parameters', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('limit=2');
                    expect(config.url).toContain('polygon_geojson=1');
                } catch (e) {
                    done(e);
                }
                return [200, []];
            });
            Nominatim.geocode('Bern', {limit: 2, polygon_geojson: 1}).then(() => done()).catch(done);
        });
    });

    describe('reverseGeocode', () => {
        it('should use default host and protocol when no options provided', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('nominatim.openstreetmap.org/reverse');
                    expect(config.url).toContain('https');
                } catch (e) {
                    done(e);
                }
                return [200, {}];
            });
            Nominatim.reverseGeocode({lat: 46.7, lng: 7.6}).then(() => done()).catch(done);
        });

        it('should use custom host for reverse geocode', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('my-nominatim.example.com/reverse');
                    expect(config.url).toNotContain('nominatim.openstreetmap.org');
                } catch (e) {
                    done(e);
                }
                return [200, {}];
            });
            Nominatim.reverseGeocode({lat: 46.7, lng: 7.6}, {
                host: 'my-nominatim.example.com'
            }).then(() => done()).catch(done);
        });

        it('should use custom protocol for reverse geocode', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toContain('http://');
                } catch (e) {
                    done(e);
                }
                return [200, {}];
            });
            Nominatim.reverseGeocode({lat: 46.7, lng: 7.6}, {
                protocol: 'http'
            }).then(() => done()).catch(done);
        });

        it('should not pass host and protocol as query parameters in reverse geocode', (done) => {
            mockAxios.onGet().reply(config => {
                try {
                    expect(config.url).toNotContain('host=');
                    expect(config.url).toNotContain('protocol=');
                } catch (e) {
                    done(e);
                }
                return [200, {}];
            });
            Nominatim.reverseGeocode({lat: 46.7, lng: 7.6}, {
                host: 'my-nominatim.example.com',
                protocol: 'http'
            }).then(() => done()).catch(done);
        });
    });
});
