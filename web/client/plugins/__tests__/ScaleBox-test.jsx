/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import ScaleBoxPlugin, { scaleBoxSelector } from '../ScaleBox';
import { getPluginForTest } from './pluginsTestUtils';
import { getScales } from '../../utils/MapUtils';

describe('ScaleBox Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    describe('renders ScaleBox plugin', () => {
        it('default render of ScaleBox plugin', () => {
            const { Plugin } = getPluginForTest(ScaleBoxPlugin, {
                map: {
                    present: {
                        projection: 'EPSG:900913',
                        zoom: 5
                    }
                }
            });
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementById('mapstore-scalebox')).toExist();
        });
        it('dropdown shows custom scales from mapOptions.view.scales', () => {
            const customScales = [500000, 100000, 50000, 10000, 5000];
            const { Plugin } = getPluginForTest(ScaleBoxPlugin, {
                map: {
                    present: {
                        projection: 'EPSG:3857',
                        zoom: 2,
                        mapOptions: {
                            view: {
                                scales: customScales
                            }
                        }
                    }
                }
            });
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            const options = document.querySelectorAll('#mapstore-scalebox option');
            expect(options.length).toBe(customScales.length);
        });

        it('dropdown shows default scales when no custom scales configured', () => {
            const { Plugin } = getPluginForTest(ScaleBoxPlugin, {
                map: {
                    present: {
                        projection: 'EPSG:3857',
                        zoom: 5
                    }
                }
            });
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            const options = document.querySelectorAll('#mapstore-scalebox option');
            const defaultScales = getScales('EPSG:3857', null);
            expect(options.length).toBe(defaultScales.length);
        });
    });

    describe('scaleBoxSelector', () => {
        it('returns default scales when no custom scales are configured', () => {
            const state = {
                map: {
                    present: {
                        projection: 'EPSG:3857',
                        zoom: 5
                    }
                }
            };
            const result = scaleBoxSelector(state);
            const defaultScales = getScales('EPSG:3857', null);
            expect(result.scales).toEqual(defaultScales);
            expect(result.currentZoomLvl).toBe(5);
        });

        it('returns custom scales from mapOptions.view.scales', () => {
            const customScales = [20000000, 10000000, 4000000, 2000000, 1000000, 500000];
            const state = {
                map: {
                    present: {
                        projection: 'EPSG:3857',
                        zoom: 3,
                        mapOptions: {
                            view: {
                                scales: customScales
                            }
                        }
                    }
                }
            };
            const result = scaleBoxSelector(state);
            expect(result.scales).toEqual(customScales);
            expect(result.scales.length).toBe(6);
            expect(result.currentZoomLvl).toBe(3);
        });

        it('custom scales take priority over getScales default', () => {
            const customScales = [5000, 10000, 50000];
            const state = {
                map: {
                    present: {
                        projection: 'EPSG:3857',
                        zoom: 0,
                        mapOptions: {
                            view: {
                                scales: customScales,
                                resolutions: [46.30208333333333, 33.072916666666664, 26.458333333333332, 19.84375, 13.229166666666666, 6.614583333333333, 2.645833333333333, 1.3229166666666665, 0.6614583333333333]
                            }
                        }
                    }
                }
            };
            const result = scaleBoxSelector(state);
            expect(result.scales.length).toBe(3);
            expect(result.scales).toNotEqual(getScales('EPSG:3857', null));
        });

        it('falls back to getScales when mapOptions exists but view.scales is absent', () => {
            const state = {
                map: {
                    present: {
                        projection: 'EPSG:3857',
                        zoom: 2,
                        mapOptions: {
                            view: {}
                        }
                    }
                }
            };
            const result = scaleBoxSelector(state);
            expect(result.scales).toEqual(getScales('EPSG:3857', null));
        });

        it('handles map state being null', () => {
            const state = { map: null };
            const result = scaleBoxSelector(state);
            expect(result.scales).toEqual(getScales('EPSG:3857', null));
            expect(result.currentZoomLvl).toBe(null);
            expect(result.minZoom).toExist;
        });

        it('returns correct scales for non-3857 projection', () => {
            const state = {
                map: {
                    present: {
                        projection: 'EPSG:4326',
                        zoom: 0
                    }
                }
            };
            const result = scaleBoxSelector(state);
            expect(result.scales).toEqual(getScales('EPSG:4326', null));
        });

        it('custom scales override default even for non-3857 projection', () => {
            const customScales = [500000, 250000, 100000];
            const state = {
                map: {
                    present: {
                        projection: 'EPSG:4326',
                        zoom: 1,
                        mapOptions: {
                            view: {
                                scales: customScales
                            }
                        }
                    }
                }
            };
            const result = scaleBoxSelector(state);
            expect(result.scales).toEqual(customScales);
        });
    });
});
