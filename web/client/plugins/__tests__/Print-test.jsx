import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import expect from "expect";

import Print from "../Print";
import { getLazyPluginForTest, getByXPath } from './pluginsTestUtils';

import {setStore} from "../../utils/StateUtils";

import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import {addTransformer, resetDefaultPrintingService} from "../../utils/PrintUtils";
import ReactTestUtils from 'react-dom/test-utils';

const initialState = {
    controls: {
        print: {
            enabled: true
        }
    },
    maptype: {
        mapType: "openlayers"
    },
    map: {
        center: {
            x: 0,
            y: 0,
            crs: "EPSG:4326"

        },
        zoom: 5,
        bbox: {
            bounds: {
                minx: 0,
                miny: 0,
                maxx: 100,
                maxy: 100
            },
            crs: "EPSG:3857"
        },
        projection: "EPSG:3857",
        resolutions: [0.5, 1, 2, 4, 8, 16, 32]
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
            scales: [1_000_000, 500_000, 100_000]
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
    expect(getByXPath("//*[text()='print.outputFormat']")).toExist();
    expect(getByXPath("//*[text()='print.projection']")).toExist();
    expect(getByXPath("//*[text()='print.rotation']")).toExist();
    expect(document.getElementById("print_preview")).toExist();
    expect(getByXPath("//*[text()='print.sheetsize']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.legend']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.2pages']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.landscape']")).toExist();
    expect(getByXPath("//*[text()='print.alternatives.portrait']")).toExist();
    expect(getByXPath("//*[text()='print.legend.font']")).toExist();
    expect(getByXPath("//*[text()='print.legend.forceLabels']")).toExist();
    expect(getByXPath("//*[text()='print.legend.forceIconsSize']")).toExist();
    expect(getByXPath("//*[text()='print.legend.iconsWidth']")).toExist();
    expect(getByXPath("//*[text()='print.legend.iconsHeight']")).toExist();
    expect(getByXPath("//*[text()='print.legend.dpi']")).toExist();
    expect(getByXPath("//*[text()='print.resolution']")).toExist();
    expect(getByXPath("//*[text()='print.submit']")).toExist();
    expect(document.getElementById("mapstore-print-preview-panel")).toNotExist();
}

function getPrintPlugin({items = [], layers = [], preview = false, projection = "EPSG:3857", state = initialState} = {}) {
    return getLazyPluginForTest({
        plugin: Print,
        storeState: {
            ...state,
            browser: "good",
            layers,
            map: {
                ...state.map,
                projection
            },
            print: {
                pdfUrl: preview ? "http://fakepreview" : undefined,
                ...state.print,
                map: {
                    projection,
                    center: {x: 0, y: 0},
                    layers
                }
            }
        },
        items
    }).then((plugin) => {
        const {store} = plugin;
        setStore(store);
        return plugin;
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
        resetDefaultPrintingService();
        setTimeout(done);
    });

    it('default configuration', (done) => {
        getPrintPlugin().then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    mapPreviewOptions={{
                        onLoadingMapPlugins: (loading) => {
                            if (!loading) {
                                expectDefaultItems();
                                done();
                            }
                        }
                    }}
                />, document.getElementById("container"));
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

    it('default configuration with useFixedScales', (done) => {
        let submittedSpec;
        const printingService = {
            print(spec) {
                submittedSpec = spec;
            },
            getMapConfiguration() {
                return {
                    layers: []
                };
            },
            validate() { return {};}
        };
        getPrintPlugin({}).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin printingService={printingService}
                    useFixedScales mapPreviewOptions={{
                        onLoadingMapPlugins: (loading) => {
                            if (!loading) {
                                const submit = document.getElementsByClassName("print-submit").item(0);
                                expect(submit).toExist();
                                submit.click();
                                expect(submittedSpec.scales.length).toBe(3);
                                done();
                            }
                        }
                    }}/>, document.getElementById("container"));
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('test configuration with useFixedScales and enableScalebox = true', (done) => {
        const printingService = {
            getMapConfiguration() {
                return {
                    layers: [],
                    center: {
                        x: 0,
                        y: 0,
                        crs: "EPSG:4326"
                    }
                };
            },
            validate() { return {};}
        };
        getPrintPlugin({
            state: {...initialState,
                print: {...initialState.print,
                    capabilities: {...initialState.print.capabilities,
                        scales: [1000000, 500000, 100000].map(value => ({name: value, value}))}
                }}
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    projectionOptions={{
                        "projections": [{"name": "UTM32N", "value": "EPSG:23032"}, {"name": "EPSG:3857", "value": "EPSG:3857"}, {"name": "EPSG:4326", "value": "EPSG:4326"}]
                    }}
                    printingService={printingService}
                    useFixedScales mapPreviewOptions={{
                        enableScalebox: true
                    }}/>, document.getElementById("container"));
                const comp = document.getElementById("container");
                ReactTestUtils.act(() => new Promise((resolve) => resolve(comp))).then(()=>{
                    expect(comp).toExist();
                    const scaleBoxComp = document.querySelector("#mappreview-scalebox select");
                    expect(scaleBoxComp).toExist();
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('test configuration with useFixedScales and enableScalebox = false', (done) => {
        const printingService = {
            getMapConfiguration() {
                return {
                    layers: [],
                    center: {
                        x: 0,
                        y: 0,
                        crs: "EPSG:4326"
                    }
                };
            },
            validate() { return {};}
        };
        getPrintPlugin({
            state: {...initialState,
                print: {...initialState.print,
                    capabilities: {...initialState.print.capabilities,
                        scales: [1000000, 500000, 100000].map(value => ({name: value, value}))}
                }}
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    projectionOptions={{
                        "projections": [{"name": "UTM32N", "value": "EPSG:23032"}, {"name": "EPSG:3857", "value": "EPSG:3857"}, {"name": "EPSG:4326", "value": "EPSG:4326"}]
                    }}
                    printingService={printingService}
                    useFixedScales mapPreviewOptions={{
                        enableScalebox: false
                    }}/>, document.getElementById("container"));
                const comp = document.getElementById("container");
                ReactTestUtils.act(() => new Promise((resolve) => resolve(comp))).then(()=>{
                    expect(comp).toExist();
                    const scaleBoxComp = document.querySelector("#mappreview-scalebox select");
                    expect(scaleBoxComp).toNotExist();
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('test configuration with editScale = true', (done) => {
        const printingService = {
            getMapConfiguration() {
                return {
                    layers: [],
                    center: {
                        x: 0,
                        y: 0,
                        crs: "EPSG:4326"
                    }
                };
            },
            validate() { return {};}
        };
        getPrintPlugin({
            state: {...initialState,
                print: {...initialState.print,
                    capabilities: {...initialState.print.capabilities,
                        scales: [1000000, 500000, 100000].map(value => ({name: value, value}))}
                }}
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    projectionOptions={{
                        "projections": [{"name": "UTM32N", "value": "EPSG:23032"}, {"name": "EPSG:3857", "value": "EPSG:3857"}, {"name": "EPSG:4326", "value": "EPSG:4326"}]
                    }}
                    printingService={printingService}
                    editScale mapPreviewOptions={{
                        enableScalebox: false
                    }}/>, document.getElementById("container"));
                const comp = document.getElementById("container");
                ReactTestUtils.act(() => new Promise((resolve) => resolve(comp))).then(()=>{
                    expect(comp).toExist();
                    const scaleBoxComp = document.querySelector("#mappreview-scalebox select");
                    expect(scaleBoxComp).toNotExist();
                    done();
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('default configuration with not allowed layers', (done) => {
        getPrintPlugin({
            layers: [{visibility: true, type: "google"}]
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    mapPreviewOptions={{
                        onLoadingMapPlugins: (loading) => {
                            if (!loading) {
                                expectDefaultItems();
                                expect(getByXPath("//*[text()='print.defaultBackground']")).toExist();
                                done();
                            }
                        }
                    }}
                />, document.getElementById("container"));
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
                ReactDOM.render(<Plugin
                    mapPreviewOptions={{
                        onLoadingMapPlugins: (loading) => {
                            if (!loading) {
                                expectDefaultItems();
                                expect(getByXPath("//*[text()='print.mycustomplugin']")).toExist();
                                done();
                            }
                        }
                    }}
                />, document.getElementById("container"));
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
        getPrintPlugin().then(({ Plugin }) => {
            try {
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
        getPrintPlugin().then(({ Plugin }) => {
            try {
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
            print() {},
            getMapConfiguration() {
                return {
                    layers: []
                };
            },
            validate() { return {};}
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

    it("print using alternative background", (done) => {
        const actions = {
            onPrint: () => {}
        };
        let spy = expect.spyOn(actions, "onPrint");
        getPrintPlugin({
            layers: [{visibility: true, type: "osm"}],
            projection: "EPSG:4326"
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    pluginCfg={{
                        onPrint: actions.onPrint
                    }}
                    defaultBackground={["osm", "empty"]}
                />, document.getElementById("container"));
                const input = getByXPath("//*[text()='print.defaultBackground']");
                expect(input).toExist();
                ReactTestUtils.Simulate.change(input, {
                    target: {
                        checked: true
                    }
                });
                input.click();
                const submit = document.getElementsByClassName("print-submit").item(0);
                expect(submit).toExist();
                ReactTestUtils.Simulate.click(submit);
                setTimeout(() => {
                    expect(spy.calls.length).toBe(1);
                    expect(spy.calls[0].arguments[1].layers.length).toBe(0);
                    done();
                }, 0);
            } catch (ex) {
                done(ex);
            }
        });
    });
    it("test configuration with useFixedScales and visibility limits on layer", (done) => {
        const actions = {
            onPrint: () => {}
        };
        let spy = expect.spyOn(actions, "onPrint");
        getPrintPlugin({
            layers: [{visibility: true, type: "osm"}, {id: "test", url: "/test", name: "test", type: "wms", visibility: true, maxResolution: 500000}],
            projection: "EPSG:4326",
            state: {...initialState,
                print: {...initialState.print,
                    capabilities: {...initialState.print.capabilities,
                        scales: [1000000, 500000, 100000].map(value => ({name: value, value}))}
                }}
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    pluginCfg={{
                        onPrint: actions.onPrint
                    }}
                    useFixedScales
                    defaultBackground={["osm", "empty"]}
                />, document.getElementById("container"));
                const submit = document.getElementsByClassName("print-submit").item(0);
                expect(submit).toExist();
                ReactTestUtils.Simulate.click(submit);
                setTimeout(() => {
                    expect(spy.calls.length).toBe(1);
                    expect(spy.calls[0].arguments[1].layers.length).toBe(1);
                    expect(spy.calls[0].arguments[1].layers[0].layers).toEqual(["test"]);
                    done();
                }, 0);
            } catch (ex) {
                done(ex);
            }
        });
    });

    it("test configuration with not round zoom level", (done) => {
        const actions = {
            onPrint: () => {}
        };
        let spy = expect.spyOn(actions, "onPrint");
        getPrintPlugin({
            layers: [
                {visibility: true, type: "osm"},
                {id: "test", url: "/test", name: "test", type: "wms", visibility: true, maxResolution: 500000}
            ],
            projection: "EPSG:4326",
            state: {
                ...initialState,
                map: {
                    ...initialState.map,
                    zoom: 5.1
                }
            }
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    pluginCfg={{
                        onPrint: actions.onPrint
                    }}
                    defaultBackground={["osm", "empty"]}
                />, document.getElementById("container"));
                const submit = document.getElementsByClassName("print-submit").item(0);
                expect(submit).toExist();
                ReactTestUtils.Simulate.click(submit);
                setTimeout(() => {
                    expect(spy.calls.length).toBe(1);
                    expect(spy.calls[0].arguments[1].layers.length).toBe(1);
                    expect(spy.calls[0].arguments[1].layers[0].layers).toEqual(["test"]);
                    done();
                }, 0);
            } catch (ex) {
                done(ex);
            }
        });
    });
    it("test removing visible layers with invisible group", (done) => {
        const actions = {
            onPrint: () => {}
        };
        let spy = expect.spyOn(actions, "onPrint");
        getPrintPlugin({
            layers:
                {
                    flat: [
                        {
                            id: 'test:Linea_costa__38262060-608e-11ef-b6d2-f1ba404475c4',
                            format: 'image/png',
                            group: 'Default.34a0a320-608e-11ef-b6d2-f1ba404475c4',
                            search: {
                                url: '/geoserver/wfs',
                                type: 'wfs'
                            },
                            name: 'test:Linea_costa',
                            description: '',
                            title: 'Linea_costa',
                            type: 'wms',
                            url: '/geoserver/wms',
                            visibility: true
                        },
                        {
                            type: 'wms',
                            format: 'image/png',
                            featureInfo: null,
                            url: '/geoserver/wms',
                            visibility: true,
                            dimensions: [],
                            name: 'test:areeverdiPolygon',
                            title: 'areeverdiPolygon',
                            id: 'test:areeverdiPolygon__722d7920-608e-11ef-8123-43293ce7e0e8'
                        }
                    ],
                    groups: [
                        {
                            id: 'Default',
                            title: 'Default',
                            name: 'Default',
                            nodes: [
                                'test:areeverdiPolygon__722d7920-608e-11ef-8123-43293ce7e0e8',
                                {
                                    id: 'Default.34a0a320-608e-11ef-b6d2-f1ba404475c4',
                                    title: 'g1',
                                    name: '34a0a320-608e-11ef-b6d2-f1ba404475c4',
                                    nodes: [
                                        'test:Linea_costa__38262060-608e-11ef-b6d2-f1ba404475c4'
                                    ],
                                    visibility: false
                                }
                            ],
                            visibility: true
                        }
                    ]
                },
            projection: "EPSG:4326",
            state: {
                ...initialState,
                map: {
                    ...initialState.map,
                    zoom: 5.1
                }
            }
        }).then(({ Plugin }) => {
            try {
                ReactDOM.render(<Plugin
                    pluginCfg={{
                        onPrint: actions.onPrint
                    }}
                    defaultBackground={["osm", "empty"]}
                />, document.getElementById("container"));
                const submit = document.getElementsByClassName("print-submit").item(0);
                expect(submit).toExist();
                ReactTestUtils.Simulate.click(submit);

                setTimeout(() => {
                    expect(spy.calls.length).toBe(1);
                    expect(spy.calls[0].arguments[1].layers.length).toBe(1);
                    expect(spy.calls[0].arguments[1].layers[0].layers).toEqual(['test:areeverdiPolygon']);
                    done();
                }, 0);
            } catch (ex) {
                done(ex);
            }
        });
    });
});
