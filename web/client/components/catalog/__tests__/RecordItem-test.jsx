/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import RecordItem from '../RecordItem.jsx';

const SAMPLE_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const sampleRecord = {
    serviceType: 'wms',
    isValid: true,
    identifier: "test-identifier",
    title: "sample title",
    tags: ["subject1", "subject2"],
    description: "sample abstract",
    thumbnail: SAMPLE_IMAGE,
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    formats: ["image/png", "image/jpeg", "text/html"],
    references: [{
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        SRS: [],
        params: {name: "workspace:layername"}
    }],
    ogcReferences: {
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        SRS: [],
        params: {name: "workspace:layername"}
    }
};

const sampleRecord2 = {
    serviceType: 'wms',
    isValid: true,
    identifier: "test-identifier",
    title: "sample title",
    tags: ["subject1", "subject2"],
    description: "sample abstract",
    thumbnail: SAMPLE_IMAGE,
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    references: [{
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        SRS: ['EPSG:4326'],
        params: {name: "workspace:layername"}
    }],
    ogcReferences: {
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        SRS: ['EPSG:4326'],
        params: {name: "workspace:layername"}
    }
};

const sampleRecord3 = {
    serviceType: 'wmts',
    isValid: true,
    identifier: "test-identifier",
    title: "sample title",
    tags: ["subject1", "subject2"],
    description: "sample abstract",
    thumbnail: SAMPLE_IMAGE,
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    format: "image/png",
    references: [{
        type: "OGC:WMTS",
        url: "http://wms.sample.service:80/geoserver/gwc/service/wmts",
        SRS: ['EPSG:4326', 'EPSG:3857'],
        params: {name: "workspace:layername"}
    }],
    ogcReferences: {
        type: "OGC:WMTS",
        url: "http://wms.sample.service:80/geoserver/gwc/service/wmts",
        SRS: ['EPSG:4326', 'EPSG:3857'],
        params: {name: "workspace:layername"}
    }
};

const getCapRecord = Object.assign({}, sampleRecord, {references: [{
    type: "OGC:WMS",
    url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
    params: {name: "workspace:layername"}
}, {
    type: "OGC:WMS-1.3.0-http-get-capabilities",
    url: "http://wms.sample.service:80/geoserver/workspace/layername/wms?service=wms&version=1.3.0&request=GetCapabilities&"
}, {
    type: "OGC:WFS-1.0.0-http-get-capabilities",
    url: "http://wfs.sample.service:80/geoserver/workspace/layername/wfs?service=wfs&version=1.0.0&request=GetCapabilities"
}
]});

const longDescriptioRecord = {
    serviceType: 'wms',
    isValid: true,
    identifier: "test-identifier",
    tags: ["subject1", "subject2"],
    description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? [33] At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat",
    thumbnail: SAMPLE_IMAGE,
    boundingBox: {
        extent: [10.686, 44.931, 46.693, 12.54],
        crs: "EPSG:4326"
    },
    references: [{
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        SRS: [],
        params: {name: "workspace:layername"}
    }],
    ogcReferences: {
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        SRS: [],
        params: {name: "workspace:layername"}
    }
};

const esriRecord = {
    serviceType: 'csw',
    layerType: 'esri',
    isValid: true,
    title: "Esri Title",
    description: "Atlantic Hurricanes 2000",
    identifier: "f4bed551-faa2-4e9c-9820-e623098ba526",
    tags: "",
    boundingBox: {
        extent: [-100.999999999, 10.3000000376, -3.9999999715, 70.7000000118],
        crs: "EPSG:4326"
    },
    references: [{
        type: "arcgis",
        url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer",
        SRS: [],
        params: {
            name: "0-Atlantic Hurricanes 2000"}
    }]
};

describe('This test for RecordItem', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const item = ReactDOM.render(<RecordItem />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeFalsy();
    });
    // test data
    it('creates the component with data', () => {
        const item = ReactDOM.render(<RecordItem record={sampleRecord}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
    });
    it('check WMTS resource', (done) => {
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord3}
            onLayerAdd={(layer, options) => {
                expect(layer.format).toBe("image/png");
                expect(options.zoomToLayer).toBeTruthy();
                done();
            }}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check WMTS resource format', (done) => {
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(layer.format).toBe("image/jpeg");
                expect(options.zoomToLayer).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={{...sampleRecord3, format: "image/jpeg"}}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check esri resource', (done) => {
        let actions = {
            onLayerAdd: (layer) => {
                expect(layer).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={esriRecord}
            onLayerAdd={actions.onLayerAdd}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });


    // test handlers
    it('check event handlers', (done) => {
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(options.zoomToLayer).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });

    it('check event handlers with catalogUrl and csw service', (done) => {
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(layer.catalogURL).toBeTruthy();
                expect(options.zoomToLayer).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="csw"
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });

    it('check event handlers with catalogUrl and wms service', (done) => {
        const service = { format: "image/jpeg", title: "GeoServer WMS", type: "wms", url: 'fakeURL'};
        let actions = {
            onLayerAdd: (layer, options) => {
                try {
                    expect(layer.catalogURL).toBeFalsy();
                    expect(layer.format).toBeTruthy();
                    expect(layer.format).toBe(service.format);
                    expect(options.zoomToLayer).toBeTruthy();
                } catch (e) {
                    done(e);
                }
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            service={service}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check wms default format', (done) => {
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(layer.catalogURL).toBeFalsy();
                expect(layer.format).toBe('image/png');
                expect(options.zoomToLayer).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check wms NOT default format', (done) => {
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(layer.catalogURL).toBeFalsy();
                expect(layer.format).toBe('image/jpeg');
                expect(options.zoomToLayer).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={{...sampleRecord, getMapFormats: ["image/jpeg"]}}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check auth params to be removed (WMS)', (done) => {
        const recordToClean = {
            serviceType: 'wms',
            isValid: true,
            identifier: "test-identifier",
            title: "sample title",
            tags: ["subject1", "subject2"],
            description: "sample abstract",
            thumbnail: SAMPLE_IMAGE,
            boundingBox: {
                extent: [10.686,
                    44.931,
                    46.693,
                    12.54],
                crs: "EPSG:4326"

            },
            references: [{
                type: "OGC:WMS",
                url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&ms2-authkey=TEST&requiredParam=REQUIRED",
                SRS: [],
                params: { name: "workspace:layername" }
            }],
            ogcReferences: {
                type: "OGC:WMS",
                url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&ms2-authkey=TEST&requiredParam=REQUIRED",
                SRS: [],
                params: { name: "workspace:layername" }
            }
        };
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(layer.catalogURL).toBeFalsy();
                expect(layer.params).toBeTruthy();
                expect(layer.params.requiredParam).toBe("REQUIRED");
                expect(options.zoomToLayer).toBeTruthy();
                expect(layer.params["ms2-authkey"]).toBeFalsy("auth param is passed in params list but it shouldn't");
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            authkeyParamNames={["ms2-authkey"]}
            record={recordToClean}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check auth params to be removed (WMTS)', (done) => {
        const recordToClean = {
            serviceType: 'wmts',
            isValid: true,
            identifier: "test-identifier",
            title: "sample title",
            tags: ["subject1", "subject2"],
            description: "sample abstract",
            thumbnail: SAMPLE_IMAGE,
            boundingBox: {
                extent: [10.686,
                    44.931,
                    46.693,
                    12.54],
                crs: "EPSG:4326"

            },
            references: [{
                type: "OGC:WMTS",
                url: "http://wms.sample.service:80/geoserver/gwc/service/wmts?ms2-authkey=TEST&requiredParam=REQUIRED",
                SRS: ['EPSG:4326', 'EPSG:3857'],
                params: { name: "workspace:layername" }
            }],
            ogcReferences: {
                type: "OGC:WMTS",
                url: "http://wms.sample.service:80/geoserver/gwc/service/wmts?ms2-authkey=TEST&requiredParam=REQUIRED",
                SRS: ['EPSG:4326', 'EPSG:3857'],
                params: { name: "workspace:layername" }
            }
        };
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(options.zoomToLayer).toBeTruthy();
                expect(layer.catalogURL).toBeFalsy();
                expect(layer.params).toBeTruthy();
                expect(layer.params.requiredParam).toBe("REQUIRED");
                expect(layer.params["ms2-authkey"]).toBeFalsy("auth param is passed in params list but it shouldn't");
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            authkeyParamNames={["ms2-authkey"]}
            record={recordToClean}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check additional OGC service', (done) => {
        const record = {
            serviceType: 'csw',
            layerType: "wms",
            isValid: true,
            identifier: "test-identifier",
            title: "sample title",
            tags: ["subject1", "subject2"],
            description: "sample abstract",
            thumbnail: SAMPLE_IMAGE,
            boundingBox: {
                extent: [10.686,
                    44.931,
                    46.693,
                    12.54],
                crs: "EPSG:4326"
            },
            references: [{
                type: "OGC:WMS",
                url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&ms2-authkey=TEST&requiredParam=REQUIRED",
                SRS: [],
                params: { name: "workspace:layername1" }
            }],
            ogcReferences: {
                type: "OGC:WMS",
                url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&ms2-authkey=TEST&requiredParam=REQUIRED",
                SRS: [],
                params: { name: "workspace:layername2" }
            },
            additionalOGCServices: {
                "wfs": {
                    url: "http://wfs.sample.service:80/geoserver/wfs?SERVICE=WFS",
                    name: "workspace:layername2",
                    fetchCapabilities: true,
                    references: [{
                        type: "OGC:WMS",
                        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&ms2-authkey=TEST&requiredParam=REQUIRED",
                        SRS: [],
                        params: { name: "workspace:layername1" }
                    }, {
                        type: "OGC:WFS",
                        url: "http://wfs.sample.service:80/geoserver/wfs?SERVICE=WFS",
                        SRS: [],
                        params: { name: "workspace:layername2" }
                    }]
                }
            }
        };
        let actions = {
            onLayerAdd: (layer, options) => {
                const url = "http://wfs.sample.service:80/geoserver/wfs?SERVICE=WFS";
                expect(layer.type).toBe("wfs");
                expect(layer.search).toBeTruthy();
                expect(layer.search).toEqual({url, type: "wfs"});
                expect(layer.url).toBe(url);
                expect(layer.name).toBe("workspace:layername2");
                expect(options.zoomToLayer).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            authkeyParamNames={["ms2-authkey"]}
            record={record}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="csw"
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        const splitButton = document.querySelector('#add-layer-button');
        expect(splitButton).toBeTruthy();
        TestUtils.Simulate.click(splitButton);
        const menuWFS = document.querySelector('#ogc-wfs');
        expect(menuWFS).toBeTruthy();
        TestUtils.Simulate.click(menuWFS);
    });

    it('check event handlers with layerBaseConfig and csw service', (done) => {
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(options.zoomToLayer).toBeTruthy();
                expect(layer.extraProp).toBe('val1');
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="csw"
            layerBaseConfig={{
                extraProp: 'val1'
            }}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });

    it('check event handlers with layerBaseConfig and wms service', (done) => {
        let actions = {
            onLayerAdd: (layer, options) => {
                expect(options.zoomToLayer).toBeTruthy();
                expect(layer.extraProp).toBe('val1');
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
            layerBaseConfig={{
                extraProp: 'val1'
            }}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });

    it('test create record item with no get capabilities links', () => {
        // instanciating a record item component
        const component = ReactDOM.render(<RecordItem record={sampleRecord} showGetCapLinks/>,
            document.getElementById("container"));
        // check that the component was intanciated
        expect(component).toBeTruthy();
        const componentDom = ReactDOM.findDOMNode(component);
        expect(componentDom).toBeTruthy();
        // we should have two buttons enable
        const buttons = componentDom.getElementsByTagName('button');
        expect(buttons.length).toBe(1);
    });

    it('test create record item with get capabilities links', () => {
        // instanciating a record item component
        const component = ReactDOM.render(<RecordItem record={getCapRecord} showGetCapLinks/>,
            document.getElementById("container"));
        // check that the component was intanciated
        expect(component).toBeTruthy();
        const componentDom = ReactDOM.findDOMNode(component);
        expect(componentDom).toBeTruthy();
        // we should have two buttons enable
        const buttons = componentDom.getElementsByTagName('button');
        expect(buttons.length).toBe(2);
    });

    it('test create record item with get capabilities links but show get capabilities links disable', () => {
        // instanciating a record item component
        const component = ReactDOM.render(<RecordItem showGetCapLinks={false} record={getCapRecord}/>,
            document.getElementById("container"));
        // check that the component was intanciated
        expect(component).toBeTruthy();
        const componentDom = ReactDOM.findDOMNode(component);
        expect(componentDom).toBeTruthy();
        // we should have only one button
        const buttons = componentDom.getElementsByTagName('button');
        expect(buttons.length).toBe(1);
    });

    // test handlers
    it('check add layer with unsupported crs', () => {
        let actions = {
            onError: () => {
            }
        };
        let actionsSpy = expect.spyOn(actions, "onError");
        let item = ReactDOM.render(<RecordItem
            record={sampleRecord2}
            onError={actions.onError}
            crs="EPSG:3857"/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);

        // With source metadata
        const record = {...sampleRecord2, serviceType: "cog", sourceMetadata: {crs: "EPSG:3946"}};
        item = ReactDOM.render(<RecordItem
            record={record}
            onError={actions.onError}
            crs="EPSG:3857"/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
        expect(actionsSpy.calls.length).toBe(2);

    });
    it('check add layer with bounding box', (done) => {
        let actions = {
            onLayerAdd: (layer) => {
                expect(layer.bbox).toBeTruthy();
                expect(layer.bbox.crs).toBeTruthy();
                expect(layer.bbox.bounds).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });

    // test title localization
    const noTitleRecord = {
        identifier: "test-identifier",
        tags: ["subject1", "subject2"],
        description: "sample abstract",
        thumbnail: SAMPLE_IMAGE,
        boundingBox: {
            extent: [10.686, 44.931, 46.693, 12.54],
            crs: "EPSG:4326"
        },
        references: [{
            type: "OGC:WMS",
            url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
            SRS: [],
            params: {name: "workspace:layername"}
        }]
    };

    const localizedRecord = Object.assign({}, noTitleRecord,
        {
            title: {
                "default": "deftitle",
                "en-US": "english"
            }
        });
    it('uses the correct localization', () => {
        // Default localization is en-US
        const item = ReactDOM.render(<RecordItem record={localizedRecord}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        const identifiers = itemDom.getElementsByClassName('identifier');
        expect(identifiers.length).toBe(1);
        const titles = itemDom.getElementsByClassName('mapstore-side-card-title');
        expect(titles.length).toBe(1);
        expect(titles.item(0).innerText).toBe('english');
    });

    it('uses the default localization', () => {
        // Default localization is en-US
        const item = ReactDOM.render(<RecordItem record={localizedRecord} currentLocale="it-IT"/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        const identifiers = itemDom.getElementsByClassName('identifier');
        expect(identifiers.length).toBe(1);
        const titles = itemDom.getElementsByClassName('mapstore-side-card-title');
        expect(titles.length).toBe(1);
        expect(titles.item(0).innerText).toBe('deftitle');
    });

    it('has not title', () => {
        // Default localization is en-US
        const item = ReactDOM.render(<RecordItem record={noTitleRecord} currentLocale="it-IT"/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        const identifiers = itemDom.getElementsByClassName('identifier');
        expect(identifiers.length).toBe(1);
        const titles = itemDom.getElementsByClassName('mapstore-side-card-title');
        expect(titles.length).toBe(0);
    });

    it('record without references', () => {
        const recordWithoutRef = {
            identifier: "test-identifier",
            title: "sample title",
            tags: ["subject1", "subject2"],
            description: "sample abstract",
            thumbnail: SAMPLE_IMAGE,
            boundingBox: {
                extent: [10.686,
                    44.931,
                    46.693,
                    12.54],
                crs: "EPSG:4326"
            },
            references: []
        };

        const item = ReactDOM.render(<RecordItem record={recordWithoutRef}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        const dangerText = itemDom.getElementsByClassName('text-danger');
        expect(dangerText.length).toBe(1);
    });

    it('hide/show thumbnail', () => {

        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideThumbnail/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let image = itemDom.getElementsByTagName('img');
        expect(image.length).toBe(0);

        item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideThumbnail={false}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        image = itemDom.getElementsByTagName('img');
        expect(image.length).toBe(1);

    });

    it('hide/show identifier', () => {

        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideIdentifier/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let identifier = itemDom.getElementsByClassName('identifier');
        expect(identifier.length).toBe(0);


        item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideIdentifier={false}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        identifier = itemDom.getElementsByClassName('identifier');
        expect(identifier.length).toBe(1);

    });

    it('show Expand button', () => {
        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideExpand={false}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideExpand={false}/>, document.getElementById("container"));
        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let expand = itemDom.getElementsByClassName('glyphicon-chevron-left');
        expect(expand.length).toBe(1);

    });
    it('hide Expand button', () => {
        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideExpand/>, document.getElementById("container"));
        expect(item).toBeTruthy();
        let itemDom = ReactDOM.findDOMNode(item);

        itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let expand = itemDom.getElementsByClassName('glyphicon-chevron-left');
        expect(expand.length).toBe(0);
    });

    it('show template description', () => {
        let item = ReactDOM.render(
            <RecordItem
                record={{
                    ...sampleRecord,
                    metadata: {
                        title: "sample title",
                        description: "sample abstract"
                    },
                    metadataTemplate: "<p>${title} and ${description}</p>"
                }}
                showTemplate
                hideExpand={false}
            />, document.getElementById("container"));
        expect(item).toBeTruthy();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let expand = itemDom.getElementsByClassName('glyphicon-chevron-left');
        expect(expand.length).toBe(1);
        TestUtils.Simulate.click(expand[0]);
        let desc = itemDom.getElementsByClassName('mapstore-side-card-desc');
        expect(desc.length).toBe(1);
        expect(desc[0].innerText.indexOf("sample title and sample abstract") !== -1).toBe(true);
    });
    it('show template description, with missing desc in metadata', () => {
        let item = ReactDOM.render(
            <RecordItem
                record={{
                    ...sampleRecord,
                    metadata: {
                        title: "sample title"
                    },
                    metadataTemplate: "<p>${title} and ${description}</p>"
                }}
                showTemplate
                hideExpand={false}
            />, document.getElementById("container"));
        expect(item).toBeTruthy();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let expand = itemDom.getElementsByClassName('glyphicon-chevron-left');
        expect(expand.length).toBe(1);
        TestUtils.Simulate.click(expand[0]);
        let desc = itemDom.getElementsByClassName('mapstore-side-card-desc');
        expect(desc.length).toBe(1);
        expect(desc[0].innerText.indexOf("sample title and description catalog.notAvailable") !== -1).toBe(true);
    });
    it('check default format is added to layer props', (done) => {
        const defaultFormat = 'image/jpeg';
        let actions = {
            onLayerAdd: (layer) => {
                expect(layer.format).toBe(defaultFormat);
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            defaultFormat={defaultFormat}
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check description is wrapped in span', () => {
        ReactDOM.render(<RecordItem record={sampleRecord}/>, document.getElementById("container"));

        const recordItemDiv = document.getElementsByClassName('mapstore-side-card')[0];
        expect(recordItemDiv).toBeTruthy();
        const descDiv = recordItemDiv.getElementsByClassName('mapstore-side-card-desc')[0];
        expect(descDiv).toBeTruthy();
        expect(descDiv.hasChildNodes()).toBe(true);
        expect(descDiv.firstElementChild.tagName).toBe('SPAN');
    });
    it('check formats are added to layer props (WMS)', (done) => {
        const defaultFormat = 'image/jpeg';
        const getMapFormats = ["image/png", "image/jpeg", "image/png8"];
        const getFeatureInfoFormats = ["text/html", "text/plain"];
        let actions = {
            onLayerAdd: (layer) => {
                try {
                    expect(layer.format).toBe(defaultFormat);
                    expect(layer.imageFormats).toEqual(getMapFormats);
                    expect(layer.infoFormats).toEqual(getFeatureInfoFormats);
                } catch (e) {
                    done(e);
                }
                done();
            }
        };

        const item = ReactDOM.render(<RecordItem
            defaultFormat={defaultFormat}
            record={{ ...sampleRecord, getMapFormats, getFeatureInfoFormats }}
            onLayerAdd={actions.onLayerAdd}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check add layer with force proxy', (done) => {
        let actions = {
            onLayerAdd: (layer) => {
                expect(layer.forceProxy).toBeTruthy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            service={{allowUnsecureLayers: true}}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
    it('check add layer with no force proxy', (done) => {
        let actions = {
            onLayerAdd: (layer) => {
                expect(layer.forceProxy).toBeFalsy();
                done();
            }
        };
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });
});
