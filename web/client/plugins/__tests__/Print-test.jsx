import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";

import Print from "../Print";
import { getLazyPluginForTest } from './pluginsTestUtils';
import TextInput from "../print/TextInput";
import Layout from "../print/Layout";
import LegendOptions from "../print/LegendOptions";
import Resolution from "../print/Resolution";
import MapPreview from "../print/MapPreview";
import Option from "../print/Option";

function getByXPath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const initialState = {
    controls: {
        print: {
            enabled: true
        }
    },
    print: {
        spec: {},
        capabilities: {
            layouts: [],
            dpis: [],
            scales: []
        }
    }
};

const CustomComponent = () => {
    return <div>print.mycustomplugin</div>;
};

function expectDefaultItems() {
    expect(document.getElementById("mapstore-print-panel")).toExist();
    expect(getByXPath("//*[text()='print.title']")).toExist();
    expect(getByXPath("//*[text()='print.description']")).toExist();
    expect(document.getElementById("print_preview")).toExist();
    expect(getByXPath("//*[text()='print.sheetsize']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.legend']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.2pages']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.landscape']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.portrait']")).toExist();
    expect(getByXPath("//*[text()='print.legend.font']")).toExist();
    expect(getByXPath("//*[text()='print.legend.forceLabels']")).toExist();
    expect(getByXPath("//*[text()='print.legend.iconsSize']")).toExist();
    expect(getByXPath("//*[text()='print.legend.dpi']")).toExist();
    expect(getByXPath("//*[text()='print.resolution']")).toExist();
}

function getPrintPlugin({items = [], layers = []} = {}) {
    return getLazyPluginForTest({
        plugin: Print,
        storeState: {
            ...initialState,
            layers,
            print: {
                ...initialState.print,
                map: {
                    center: {x: 0, y: 0},
                    layers
                }
            }
        },
        additionalPlugins: {
            PrintTextInputPlugin: TextInput,
            PrintLayoutPlugin: Layout,
            PrintLegendOptionsPlugin: LegendOptions,
            PrintResolution: Resolution,
            PrintMapPreview: MapPreview,
            PrintOption: Option
        },
        items
    });
}

describe('Print Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('default configuration', (done) => {
        getPrintPlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expectDefaultItems();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('default configuration with not allowed layers', (done) => {
        getPrintPlugin({
            layers: [{visibility: true, type: "bing"}]
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expectDefaultItems();
                expect(getByXPath("//*[text()='print.defaultBackground']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('custom plugin', (done) => {
        getPrintPlugin({items: [{
            plugin: CustomComponent,
            target: "left-panel"
        }]}).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expectDefaultItems();
                expect(getByXPath("//*[text()='print.mycustomplugin']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
