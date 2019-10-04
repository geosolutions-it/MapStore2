/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const zoomToFeatureHandler = require('../zoomToFeatureHandler');

const SAMPLE_FEATURES = [
    {
        "type": "Feature",
        "id": "",
        "geometry": null,
        "properties": {
            "GRAY_INDEX": 336
        }
    },
    {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        2.4609375,
                        55.27911529201561
                    ],
                    [
                        3.515625,
                        45.1510532655634
                    ],
                    [
                        12.83203125,
                        45.089035564831036
                    ],
                    [
                        12.568359375,
                        55.3791104480105
                    ],
                    [
                        2.4609375,
                        55.27911529201561
                    ]
                ]
            ]
        }
    }
];

describe('zoomToFeatureHandler enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('zoomToFeatureHandler rendering with defaults', (done) => {
        const Sink = zoomToFeatureHandler(createSink( props => {
            expect(props.zoomToFeature).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('callback to zoomToExtent', () => {
        const actions = {
            zoomToExtent: () => {}
        };
        const spy = expect.spyOn(actions, 'zoomToExtent');

        const Sink = zoomToFeatureHandler(createSink( props => {
            props.zoomToFeature();
        }));
        ReactDOM.render(<Sink
            zoomToExtent={actions.zoomToExtent}
            currentFeatureCrs="EPSG:3857"
            currentFeature={SAMPLE_FEATURES}/>, document.getElementById("container"));
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toBeAn(Array);
        expect(spy.calls[0].arguments[1]).toBe("EPSG:3857");
    });
    it('not zoom if at least one geometry is not available', () => {
        const actions = {
            zoomToExtent: () => { }
        };
        const spy = expect.spyOn(actions, 'zoomToExtent');

        const Sink = zoomToFeatureHandler(createSink(props => {
            props.zoomToFeature();
        }));
        ReactDOM.render(<Sink
            zoomToExtent={actions.zoomToExtent}
            currentFeatureCrs="EPSG:3857"
            currentFeature={[SAMPLE_FEATURES[0]]} />, document.getElementById("container"));
        expect(spy).toNotHaveBeenCalled();

    });
});
