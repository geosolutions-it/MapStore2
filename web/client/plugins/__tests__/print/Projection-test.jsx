import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";
import { getPluginForTest, getByXPath } from '../pluginsTestUtils';
import { getMapTransformerChain, getValidatorsChain, resetDefaultPrintingService } from "../../../utils/PrintUtils";

import PrintProjection, { projectionSelector } from "../../print/Projection";
import last from "lodash/last";
import ReactTestUtils from "react-dom/test-utils";
import proj4 from "proj4";

const PROJECTION_DEF_EPSG_32122 = {
    code: "EPSG:32122",
    def: "+proj=lcc +lat_1=41.7 +lat_2=40.43333333333333 +lat_0=39.66666666666666 +lon_0=-82.5 +x_0=600000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
};

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
            projection: "EPSG:3857",
            zoom: 3
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

function getPrintProjectionPlugin(state = initialState) {
    return Promise.resolve(getPluginForTest(PrintProjection, {
        ...initialState,
        ...state
    }));
}

const stateWithNoProjection = {
    print: {
        ...initialState.print,
        map: { scale: 1784, scaleZoom: 2, zoom: 3 }
    }
};

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

describe('projectionSelector', () => {
    beforeEach(() => {
        proj4.defs(PROJECTION_DEF_EPSG_32122.code, PROJECTION_DEF_EPSG_32122.def);
    });

    afterEach(() => {
        delete proj4.defs[PROJECTION_DEF_EPSG_32122.code];
    });

    it('returns params.projection when set', () => {
        const state = { print: { spec: { params: { projection: "EPSG:4326" } }, map: { projection: "EPSG:3857" } } };
        expect(projectionSelector(state)).toBe("EPSG:4326");
        expect(projectionSelector(state, "EPSG:32122")).toBe("EPSG:4326");
    });

    it('returns map.projection when params.projection is not set', () => {
        const state = { print: { spec: { params: {} }, map: { projection: "EPSG:3857" } } };
        expect(projectionSelector(state)).toBe("EPSG:3857");
        expect(projectionSelector(state, "EPSG:32122")).toBe("EPSG:3857");
    });

    it('returns defaultProjection when params and map projection are missing and defaultProjection is in availableCRS', () => {
        const state = { print: { spec: { params: {} }, map: {} } };
        expect(projectionSelector(state, "EPSG:32122")).toBe("EPSG:32122");
    });

    it('returns EPSG:3857 when defaultProjection is not in availableCRS', () => {
        const state = { print: { spec: { params: {} }, map: {} } };
        expect(projectionSelector(state, "EPSG:99999")).toBe("EPSG:3857");
    });

    it('returns EPSG:3857 when all are missing and no defaultProjection passed', () => {
        const state = { print: { spec: { params: {} }, map: {} } };
        expect(projectionSelector(state)).toBe("EPSG:3857");
        expect(projectionSelector(state, undefined)).toBe("EPSG:3857");
    });
});

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
                const comp = ReactDOM.render(<Plugin projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                ReactTestUtils.act(() => new Promise((resolve) => resolve(comp))).then(() => {
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
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('validator without allowPreview', (done) => {
        getPrintProjectionPlugin().then(({ Plugin, store }) => {
            try {
                const comp = ReactDOM.render(<Plugin projections={[{"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}/>, document.getElementById("container"));
                ReactTestUtils.act(() => new Promise((resolve) => resolve(comp))).then(() => {
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

// defaultProjection must be defined in proj4 (e.g. EPSG:32122) for these tests
describe('PrintProjection Plugin with defaultProjection', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        resetDefaultPrintingService();
        proj4.defs(PROJECTION_DEF_EPSG_32122.code, PROJECTION_DEF_EPSG_32122.def);
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        delete proj4.defs[PROJECTION_DEF_EPSG_32122.code];
        setTimeout(done);
    });

    it('custom projections with default projection', (done) => {
        getPrintProjectionPlugin(stateWithNoProjection).then(({ Plugin }) => {
            try {
                ReactDOM.render(
                    <Plugin
                        projections={[{"name": "Ohio North", "value": "EPSG:32122"}, {"name": "WGS84", "value": "EPSG:4326"}, {"name": "Mercator", "value": "EPSG:3857"}]}
                        defaultProjection="EPSG:32122"
                    />,
                    document.getElementById("container")
                );
                expect(getByXPath("//*[text()='print.projection']")).toExist();
                expect(getByXPath("//option[@value='EPSG:32122']")).toExist();
                expect(getByXPath("//option[@value='EPSG:4326']")).toExist();
                expect(getByXPath("//option[@value='EPSG:3857']")).toExist();
                const select = getByXPath("//select");
                expect(select).toExist();
                expect(select.value).toBe("EPSG:32122");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('map transformer uses defaultProjection when map has no projection', (done) => {
        getPrintProjectionPlugin(stateWithNoProjection).then(({ Plugin, store }) => {
            try {
                ReactDOM.render(
                    <Plugin
                        projections={[{"name": "Ohio North", "value": "EPSG:32122"}, {"name": "Mercator", "value": "EPSG:3857"}, {"name": "WGS84", "value": "EPSG:4326"}]}
                        defaultProjection="EPSG:32122"
                    />,
                    document.getElementById("container")
                );
                setTimeout(() => {
                    callMapTransformer(store.getState(), (map) => {
                        expect(map.projection).toBe('EPSG:32122');
                        done();
                    });
                }, 0);
            } catch (ex) {
                done(ex);
            }
        });
    });
});
