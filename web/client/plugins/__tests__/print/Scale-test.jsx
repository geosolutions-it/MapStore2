import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";
import { getPluginForTest, getByXPath } from '../pluginsTestUtils';
import { getSpecTransformerChain, resetDefaultPrintingService } from "../../../utils/PrintUtils";
import ReactTestUtils from "react-dom/test-utils";

import PrintScale from "../../print/Scale";
import last from "lodash/last";

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
            scale: 1784
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
    layers: [],
    pages: [{
        center: {x: 0, y: 0, projection: "EPSG:4326"},
        scale: 1784
    }],
    projection: "EPSG:4326"
};

function getPrintScalePlugin() {
    return Promise.resolve(getPluginForTest(PrintScale, {
        ...initialState
    }));
}

function callTransformer(state, callback) {
    setTimeout(() => {
        last(getSpecTransformerChain()).transformer(state, {
            ...baseSpec,
            includeScale: state.print.spec?.params?.includeScale ?? false
        }).then(callback);
    }, 0);
}

describe('PrintScale Plugin', () => {
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
        getPrintScalePlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(getByXPath("//*[text()='print.scale']")).toExist();
                expect(getByXPath("//*[text()='print.includeScale']")).toExist();
                expect(getByXPath("//*[text()='1:1,784']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('transformer with checked flag', (done) => {
        getPrintScalePlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                ReactTestUtils.Simulate.change(getByXPath("//input[@type='checkbox']"), {
                    target: {
                        checked: true
                    }
                });
                callTransformer(store.getState(), (spec) => {
                    expect(spec.mapScale).toBe('1:1,784');
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('transformer with unchecked flag', (done) => {
        getPrintScalePlugin().then(({ Plugin, store}) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                callTransformer(store.getState(), (spec) => {
                    expect(spec.mapScale).toNotExist();
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('custom formatting', (done) => {
        const customFormat = (scale) => (`MyScale ${scale}`);

        getPrintScalePlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin format={customFormat}/>, document.getElementById("container"));
                expect(getByXPath("//*[text()='MyScale 1784']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('custom formatting for printing', (done) => {
        const customFormat = (scale, locale, forPrint) => {
            if (forPrint) {
                return `MyPrintedScale ${scale}`;
            }
            return `MyScale ${scale}`;
        };

        getPrintScalePlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin format={customFormat}/>, document.getElementById("container"));
                ReactTestUtils.Simulate.change(getByXPath("//input[@type='checkbox']"), {
                    target: {
                        checked: true
                    }
                });
                expect(getByXPath("//*[text()='MyScale 1784']")).toExist();
                callTransformer(store.getState(), (spec) => {
                    expect(spec.mapScale).toBe('MyPrintedScale 1784');
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
});
