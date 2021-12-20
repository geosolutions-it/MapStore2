import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import expect from "expect";

import Print from "../Print";
import { getLazyPluginForTest, getByXPath } from './pluginsTestUtils';

import {setStore} from "../../utils/StateUtils";

import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import {addTransformer, resetTransformers} from "../../utils/PrintUtils";

const initialState = {
    controls: {
        print: {
            enabled: true
        }
    },
    print: {
        spec: {
            sheet: "A4"
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
                    projection: "EPSG:3857",
                    center: {x: 0, y: 0},
                    layers
                }
            }
        },
        items
    });
}

describe('Print Plugin', () => {
    let mockAxios;
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        mockAxios.restore();
        resetTransformers();
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
            plugin: () => {return null;},
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

    it("print using default printing service", (done) => {
        getPrintPlugin().then(({ Plugin, store }) => {
            try {
                setStore(store);

                mockAxios.onPost().reply(({url, data }) => {
                    try {
                        expect(url).toContain("fakeservice");
                        const spec = JSON.parse(data);
                        expect(spec.layout).toBe("A4_no_legend");
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                });

                ReactDOM.render(<Plugin/>, document.getElementById("container"));
                const submit = document.getElementsByClassName("print-submit").item(0);
                expect(submit).toExist();
                submit.click();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it("print with custom transformer", (done) => {
        getPrintPlugin().then(({ Plugin, store }) => {
            try {
                setStore(store);
                addTransformer("custom", (state, spec) => Promise.resolve({
                    ...spec,
                    custom: "mycustomvalue"
                }));
                mockAxios.onPost().reply(({ data }) => {
                    try {
                        const spec = JSON.parse(data);
                        expect(spec.custom).toBe("mycustomvalue");
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                });

                ReactDOM.render(<Plugin/>, document.getElementById("container"));
                const submit = document.getElementsByClassName("print-submit").item(0);
                expect(submit).toExist();
                submit.click();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it("print using custom printing service", (done) => {
        const printingService = {
            print() {}
        };
        let spy = expect.spyOn(printingService, "print");
        getPrintPlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin printingService={printingService}/>, document.getElementById("container"));
                const submit = document.getElementsByClassName("print-submit").item(0);
                expect(submit).toExist();
                submit.click();
                setTimeout(() => {
                    expect(spy.calls.length).toBe(1);
                    done();
                }, 0);
            } catch (ex) {
                done(ex);
            }
        });
    });
});
