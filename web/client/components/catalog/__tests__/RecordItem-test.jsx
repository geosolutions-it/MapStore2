/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const RecordItem = require('../RecordItem.jsx').default;
const expect = require('expect');
const assign = require('object-assign');
const ReactTestUtils = require('react-dom/test-utils');

const TestUtils = require('react-dom/test-utils');
const SAMPLE_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const sampleRecord = {
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
    }]
};

const sampleRecord2 = {
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
    }]
};

const sampleRecord3 = {
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
    }]
};

const getCapRecord = assign({}, sampleRecord, {references: [{
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
    }]
};

const esriRecord = {
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
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toNotExist();
    });
    // test data
    it('creates the component with data', () => {
        const item = ReactDOM.render(<RecordItem record={sampleRecord}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
    });
    it('check WMTS resource', () => {
        let actions = {
            onLayerAdd: () => {

            }

        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord3}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments[0].format).toBe("image/png");
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
    });
    it('check WMTS resource format', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={{...sampleRecord3, format: "image/jpeg"}}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[0].format).toBe("image/jpeg");
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
    });
    it('check esri resource', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");

        const item = ReactDOM.render(<RecordItem
            record={esriRecord}
            onLayerAdd={actions.onLayerAdd}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
    });


    // test handlers
    it('check event handlers', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
    });

    it('check event handlers with catalogUrl and csw service', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="csw"
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[0].catalogURL).toExist();
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
    });

    it('check event handlers with catalogUrl and wms service', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[0].catalogURL).toNotExist();
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
    });
    it('check wms default format', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[0].catalogURL).toNotExist();
        expect(actionsSpy.calls[0].arguments[0].format).toBe('image/png');
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
    });
    it('check wms NOT default format', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={{...sampleRecord, formats: ["image/jpeg"]}}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[0].catalogURL).toNotExist();
        expect(actionsSpy.calls[0].arguments[0].format).toBe('image/jpeg');
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
    });
    it('check auth params to be removed (WMS)', () => {
        const recordToClean = {
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
            }]
        };
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            authkeyParamNames={["ms2-authkey"]}
            record={recordToClean}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[0].catalogURL).toNotExist();
        expect(actionsSpy.calls[0].arguments[0].params).toExist();
        expect(actionsSpy.calls[0].arguments[0].params.requiredParam).toBe("REQUIRED");
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
        expect(actionsSpy.calls[0].arguments[0].params["ms2-authkey"]).toNotExist("auth param is passed in params list but it shouldn't");
    });
    it('check auth params to be removed (WMTS)', () => {
        const recordToClean = {
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
            }]
        };
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            authkeyParamNames={["ms2-authkey"]}
            record={recordToClean}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
        expect(actionsSpy.calls[0].arguments[0].catalogURL).toNotExist();
        expect(actionsSpy.calls[0].arguments[0].params).toExist();
        expect(actionsSpy.calls[0].arguments[0].params.requiredParam).toBe("REQUIRED");
        expect(actionsSpy.calls[0].arguments[0].params["ms2-authkey"]).toNotExist("auth param is passed in params list but it shouldn't");
    });

    it('check event handlers with layerBaseConfig and csw service', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="csw"
            layerBaseConfig={{
                extraProp: 'val1'
            }}
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
        expect(actionsSpy.calls[0].arguments[0].extraProp).toBe('val1');
    });

    it('check event handlers with layerBaseConfig and wms service', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            catalogURL="fakeURL"
            catalogType="wms"
            layerBaseConfig={{
                extraProp: 'val1'
            }}
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments.length).toBe(2);
        expect(actionsSpy.calls[0].arguments[1].zoomToLayer).toBeTruthy();
        expect(actionsSpy.calls[0].arguments[0].extraProp).toBe('val1');
    });

    it('test create record item with no get capabilities links', () => {
        // instanciating a record item component
        const component = ReactDOM.render(<RecordItem record={sampleRecord} showGetCapLinks/>,
            document.getElementById("container"));
        // check that the component was intanciated
        expect(component).toExist();
        const componentDom = ReactDOM.findDOMNode(component);
        expect(componentDom).toExist();
        // we should have two buttons enable
        const buttons = componentDom.getElementsByTagName('button');
        expect(buttons.length).toBe(1);
    });

    it('test create record item with get capabilities links', () => {
        // instanciating a record item component
        const component = ReactDOM.render(<RecordItem record={getCapRecord} showGetCapLinks/>,
            document.getElementById("container"));
        // check that the component was intanciated
        expect(component).toExist();
        const componentDom = ReactDOM.findDOMNode(component);
        expect(componentDom).toExist();
        // we should have two buttons enable
        const buttons = componentDom.getElementsByTagName('button');
        expect(buttons.length).toBe(2);
    });

    it('test create record item with get capabilities links but show get capabilities links disable', () => {
        // instanciating a record item component
        const component = ReactDOM.render(<RecordItem showGetCapLinks={false} record={getCapRecord}/>,
            document.getElementById("container"));
        // check that the component was intanciated
        expect(component).toExist();
        const componentDom = ReactDOM.findDOMNode(component);
        expect(componentDom).toExist();
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
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord2}
            onError={actions.onError}
            crs="EPSG:3857"/>, document.getElementById("container"));
        expect(item).toExist();

        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
    });
    it('check add layer with bounding box', () => {
        let actions = {
            onLayerAdd: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
        />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments[0].bbox).toExist();
        expect(actionsSpy.calls[0].arguments[0].bbox.crs).toExist();
        expect(actionsSpy.calls[0].arguments[0].bbox.bounds).toExist();
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

    const localizedRecord = assign({}, noTitleRecord,
        {
            title: {
                "default": "deftitle",
                "en-US": "english"
            }
        });
    it('uses the correct localization', () => {
        // Default localization is en-US
        const item = ReactDOM.render(<RecordItem record={localizedRecord}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        const identifiers = itemDom.getElementsByClassName('identifier');
        expect(identifiers.length).toBe(1);
        const titles = itemDom.getElementsByClassName('mapstore-side-card-title');
        expect(titles.length).toBe(1);
        expect(titles.item(0).innerText).toBe('english');
    });

    it('uses the default localization', () => {
        // Default localization is en-US
        const item = ReactDOM.render(<RecordItem record={localizedRecord} currentLocale="it-IT"/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        const identifiers = itemDom.getElementsByClassName('identifier');
        expect(identifiers.length).toBe(1);
        const titles = itemDom.getElementsByClassName('mapstore-side-card-title');
        expect(titles.length).toBe(1);
        expect(titles.item(0).innerText).toBe('deftitle');
    });

    it('has not title', () => {
        // Default localization is en-US
        const item = ReactDOM.render(<RecordItem record={noTitleRecord} currentLocale="it-IT"/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
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
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        const dangerText = itemDom.getElementsByClassName('text-danger');
        expect(dangerText.length).toBe(1);
    });

    it('hide/show thumbnail', () => {

        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideThumbnail/>, document.getElementById("container"));
        expect(item).toExist();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let image = itemDom.getElementsByTagName('img');
        expect(image.length).toBe(0);

        item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideThumbnail={false}/>, document.getElementById("container"));
        expect(item).toExist();

        itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        image = itemDom.getElementsByTagName('img');
        expect(image.length).toBe(1);

    });

    it('hide/show identifier', () => {

        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideIdentifier/>, document.getElementById("container"));
        expect(item).toExist();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let identifier = itemDom.getElementsByClassName('identifier');
        expect(identifier.length).toBe(0);


        item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideIdentifier={false}/>, document.getElementById("container"));
        expect(item).toExist();

        itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        identifier = itemDom.getElementsByClassName('identifier');
        expect(identifier.length).toBe(1);

    });

    it('show Expand button', () => {
        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideExpand={false}/>, document.getElementById("container"));
        expect(item).toExist();

        item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideExpand={false}/>, document.getElementById("container"));
        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let expand = itemDom.getElementsByClassName('glyphicon-chevron-left');
        expect(expand.length).toBe(1);

    });
    it('hide Expand button', () => {
        let item = ReactDOM.render(<RecordItem record={longDescriptioRecord} hideExpand/>, document.getElementById("container"));
        expect(item).toExist();
        let itemDom = ReactDOM.findDOMNode(item);

        itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
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
        expect(item).toExist();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let expand = itemDom.getElementsByClassName('glyphicon-chevron-left');
        expect(expand.length).toBe(1);
        ReactTestUtils.Simulate.click(expand[0]);
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
        expect(item).toExist();

        let itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let expand = itemDom.getElementsByClassName('glyphicon-chevron-left');
        expect(expand.length).toBe(1);
        ReactTestUtils.Simulate.click(expand[0]);
        let desc = itemDom.getElementsByClassName('mapstore-side-card-desc');
        expect(desc.length).toBe(1);
        expect(desc[0].innerText.indexOf("sample title and description catalog.notAvailable") !== -1).toBe(true);
    });
    it('check default format is added to layer props', () => {
        const defaultFormat = 'image/jpeg';
        let actions = {
            onLayerAdd: () => {}
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordItem
            defaultFormat={defaultFormat}
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy.calls[0].arguments[0].format).toBe(defaultFormat);
    });
    it('check description is wrapped in span', () => {
        ReactDOM.render(<RecordItem record={sampleRecord}/>, document.getElementById("container"));

        const recordItemDiv = document.getElementsByClassName('mapstore-side-card')[0];
        expect(recordItemDiv).toExist();
        const descDiv = recordItemDiv.getElementsByClassName('mapstore-side-card-desc')[0];
        expect(descDiv).toExist();
        expect(descDiv.hasChildNodes()).toBe(true);
        expect(descDiv.firstElementChild.tagName).toBe('SPAN');
    });
});
