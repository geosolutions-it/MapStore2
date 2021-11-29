import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import expect from "expect";

import Print from "../Print";
import { getLazyPluginForTest } from './pluginsTestUtils';
import {NullComponent} from "../Null";

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

const CustomComponent = ({actions}) => {
    useEffect(() => {
        actions.addParameter("custom", "");
    }, []);
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
    expect(getByXPath("//*[text()='print.submit']")).toExist();
    expect(document.getElementById("mapstore-print-preview-panel")).toNotExist();
}

function getPrintPlugin({items = [], layers = [], preview = false} = {}) {
    return getLazyPluginForTest({
        plugin: Print,
        storeState: {
            ...initialState,
            browser: "good",
            layers,
            print: {
                pdfUrl: preview ? "http://fakepreview" : undefined,
                ...initialState.print,
                map: {
                    center: {x: 0, y: 0},
                    layers
                }
            }
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

    it('default configuration with preview enabled', (done) => {
        getPrintPlugin({
            preview: true
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(document.getElementById("mapstore-print-preview-panel")).toExist();
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

    it('custom plugin sets initial state', (done) => {
        getPrintPlugin({items: [{
            plugin: CustomComponent,
            target: "left-panel"
        }]}).then(({ Plugin, store }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(store.getState()?.print?.spec?.params?.custom).toNotBe(undefined);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('custom plugin replaces existing', (done) => {
        getPrintPlugin({items: [{
            plugin: CustomComponent,
            target: "name"
        }]}).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(getByXPath("//*[text()='print.title']")).toNotExist();
                expect(getByXPath("//*[text()='print.mycustomplugin']")).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('custom plugin removes existing', (done) => {
        getPrintPlugin({items: [{
            plugin: NullComponent,
            target: "name"
        }]}).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(getByXPath("//*[text()='print.title']")).toNotExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
