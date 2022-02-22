import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";
import { getPluginForTest, getByXPath } from '../pluginsTestUtils';
import { getMapTransformerChain, getValidatorsChain, resetDefaultPrintingService } from "../../../utils/PrintUtils";

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

function getPrintProjectionPlugin() {
    return Promise.resolve(getPluginForTest(PrintProjection, {
        ...initialState
    }));
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
