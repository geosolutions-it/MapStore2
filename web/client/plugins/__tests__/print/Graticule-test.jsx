import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";
import { getPluginForTest, getByXPath } from '../pluginsTestUtils';
import { getMapTransformerChain, resetDefaultPrintingService } from "../../../utils/PrintUtils";

import PrintGraticule from "../../print/Graticule";
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
            projection: "EPSG:3857",
            layers: []
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

function getPrintGraticulePlugin() {
    return Promise.resolve(getPluginForTest(PrintGraticule, {
        ...initialState
    }));
}

function callMapTransformer(state, callback) {
    setTimeout(() => {
        const map = last(getMapTransformerChain()).transformer(state, initialState.print.map);
        callback(map);
    }, 0);
}

describe('PrintGraticule Plugin', () => {
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
        getPrintGraticulePlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(getByXPath("//*[text()='print.graticule']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('map transformer', (done) => {
        getPrintGraticulePlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                callMapTransformer(store.getState(), (map) => {
                    const graticuleLayers = map.layers.filter(l => l.type === "graticule");
                    expect(graticuleLayers.length).toBe(0);
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('map transformer with graticule enabled', (done) => {
        getPrintGraticulePlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                const checkbox = getByXPath("//input");
                ReactTestUtils.Simulate.change(checkbox, {
                    target: {
                        checked: true
                    }
                });
                callMapTransformer(store.getState(), (map) => {
                    const graticuleLayers = map.layers.filter(l => l.type === "graticule");
                    expect(graticuleLayers.length).toBe(1);
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
});
