import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";
import { getPluginForTest, getByXPath } from '../pluginsTestUtils';
import { getSpecTransformerChain, resetDefaultPrintingService } from "../../../utils/PrintUtils";

import PrintOutputFormat from "../../print/OutputFormat";
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
            outputFormats: [{name: "pdf"}, {name: "png"}, {name: "tiff"}],
            dpis: [],
            scales: []
        }
    }
};

const baseSpec = {
    layers: [],
    center: {x: 0, y: 0, projection: "EPSG:4326"},
    projection: "EPSG:4326"
};

function getPrintOutputFormatPlugin() {
    return Promise.resolve(getPluginForTest(PrintOutputFormat, {
        ...initialState
    }));
}

function callTransformer(state, callback) {
    setTimeout(() => {
        last(getSpecTransformerChain()).transformer(state, baseSpec).then(callback);
    }, 0);
}

describe('PrintOutputFormat Plugin', () => {
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
        getPrintOutputFormatPlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(getByXPath("//*[text()='print.outputFormat']")).toExist();
                expect(getByXPath("//option[@value='pdf']")).toExist();
                expect(getByXPath("//option[@value='png']")).toExist();
                expect(getByXPath("//option[@value='tiff']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('custom allowed formats', (done) => {
        getPrintOutputFormatPlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin allowedFormats={[{"value": "pdf", "name": "PDF"}, {"value": "png", "name": "PNG"}]}/>, document.getElementById("container"));
                expect(getByXPath("//option[@value='pdf']")).toExist();
                expect(getByXPath("//option[@value='png']")).toExist();
                expect(getByXPath("//option[@value='tiff']")).toNotExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('transformer with default format', (done) => {
        getPrintOutputFormatPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                callTransformer(store.getState(), (spec) => {
                    expect(spec.outputFormat).toBe('pdf');
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('transformer with user chosen format', (done) => {
        getPrintOutputFormatPlugin().then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                const combo = getByXPath("//select");
                ReactTestUtils.Simulate.change(combo, {
                    target: {
                        value: "png"
                    }
                });
                callTransformer(store.getState(), (spec) => {
                    expect(spec.outputFormat).toBe('png');
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
});
