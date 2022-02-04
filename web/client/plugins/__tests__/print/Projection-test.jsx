import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";
import { getPluginForTest, getByXPath } from '../pluginsTestUtils';
import { getSpecTransformerChain, getMapTransformerChain, getValidatorsChain, resetDefaultPrintingService } from "../../../utils/PrintUtils";

import PrintProjection from "../../print/Projection";
import last from "lodash/last";
import ReactTestUtils from "react-dom/test-utils";

const initialState = {
    controls: {
        print: {
            enabled: true
        }
    },
    locale: {
        current: "en-US"
    },
    print: {
        spec: {
            sheet: "A4"
        },
        map: {
            scale: 1784,
            scaleZoom: 2,
            projection: "EPSG:3857"
        },
        capabilities: {
            createURL: "http://fakeservice",
            layouts: [{
                name: "A4_no_legend",
                map: {
                    width: 100,
                    height: 100
                }
            }],
            dpis: [],
            scales: []
        }
    }
};

const baseSpec = {
    layers: [{
        type: "Vector",
        geoJson: {
            type: "FeatureCollection",
            features: [{
                type: "Point",
                coordinates: [100000, 200000]
            }]
        }
    }, {
        type: "unknown"
    }],
    projection: "EPSG:3857",
    srs: "EPSG:3857",
    pages: [{
        center: [100000, 200000],
        scale: 10000
    }]
};

function getPrintProjectionPlugin() {
    return Promise.resolve(getPluginForTest(PrintProjection, {
        ...initialState
    }));
}

function callTransformer(state, callback) {
    setTimeout(() => {
        last(getSpecTransformerChain()).transformer(state, baseSpec).then(callback);
    }, 0);
}

function callMapTransformer(state, callback) {
    setTimeout(() => {
        const map = last(getMapTransformerChain()).transformer(state, initialState.print.map);
        callback(map);
    }, 0);
}

function callValidator(state, callback) {
    setTimeout(() => {
        const validations = last(getValidatorsChain()).validator(state, {valid: true});
        callback(validations);
    }, 0);
}

describe('PrintProjection Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        resetDefaultPrintingService();
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('default configuration', (done) => {
        getPrintProjectionPlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(getByXPath("//*[text()='print.projection']")).toExist();
                expect(getByXPath("//option[@value='EPSG:4326']")).toExist();
                expect(getByXPath("//option[@value='EPSG:3857']")).toExist();
                expect(getByXPath("//option[@value='EPSG:900913']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('custom projections', (done) => {
        getPrintProjectionPlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin projections={[{"name": "WGS84", "value": "EPSG:4326"}, {"name": "Mercator", "value": "EPSG:3857"}]}/>, document.getElementById("container"));
                expect(getByXPath("//*[text()='print.projection']")).toExist();
                expect(getByXPath("//option[@value='EPSG:4326']")).toExist();
                expect(getByXPath("//option[@value='EPSG:3857']")).toExist();
                expect(getByXPath("//option[@value='EPSG:900913']")).toNotExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('transformer with default crs', (done) => {
        getPrintProjectionPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                callTransformer(store.getState(), (spec) => {
                    expect(spec.pages[0].center[0].toFixed(2)).toEqual(100000);
                    expect(spec.pages[0].center[1].toFixed(2)).toEqual(200000);
                    expect(spec.pages[0].scale.toFixed(0)).toEqual(10000);
                    expect(spec.srs).toBe('EPSG:3857');
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('transformer with user chosen crs', (done) => {
        getPrintProjectionPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                const combo = getByXPath("//select");
                ReactTestUtils.Simulate.change(combo, {
                    target: {
                        value: "EPSG:4326"
                    }
                });
                callTransformer(store.getState(), (spec) => {
                    expect(spec.pages[0].center[0].toFixed(2)).toEqual(0.9);
                    expect(spec.pages[0].center[1].toFixed(2)).toEqual(1.80);
                    expect(spec.pages[0].scale.toFixed(0)).toEqual(125483353);
                    expect(spec.srs).toBe('EPSG:4326');
                    expect(spec.layers.length).toBe(2);
                    expect(spec.layers[0].type).toBe("Vector");
                    expect(spec.layers[0].geoJson.features.length).toBe(1);
                    expect(spec.layers[0].geoJson.features[0].coordinates[0].toFixed(2)).toEqual(0.90);
                    expect(spec.layers[0].geoJson.features[0].coordinates[1].toFixed(2)).toEqual(1.80);
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('map transformer with default crs', (done) => {
        getPrintProjectionPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                callMapTransformer(store.getState(), (map) => {
                    expect(map.projection).toBe('EPSG:3857');
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('map transformer with user chosen crs', (done) => {
        getPrintProjectionPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                const combo = getByXPath("//select");
                ReactTestUtils.Simulate.change(combo, {
                    target: {
                        value: "EPSG:4326"
                    }
                });
                callMapTransformer(store.getState(), (map) => {
                    expect(map.projection).toBe('EPSG:4326');
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('validator without allowPreview', (done) => {
        getPrintProjectionPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                const combo = getByXPath("//select");
                ReactTestUtils.Simulate.change(combo, {
                    target: {
                        value: "EPSG:4326"
                    }
                });
                callValidator(store.getState(), (validation) => {
                    expect(validation).toExist();
                    expect(validation.valid).toBe(false);
                    expect(validation.errors.length).toBe(1);
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('validator with allowPreview', (done) => {
        getPrintProjectionPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin allowPreview projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                const combo = getByXPath("//select");
                ReactTestUtils.Simulate.change(combo, {
                    target: {
                        value: "EPSG:4326"
                    }
                });
                callValidator(store.getState(), (validation) => {
                    expect(validation).toExist();
                    expect(validation.valid).toBe(true);
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
});
