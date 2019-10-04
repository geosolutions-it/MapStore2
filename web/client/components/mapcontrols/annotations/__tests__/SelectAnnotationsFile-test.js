/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const SelectAnnotationsFile = require('../SelectAnnotationsFile');


describe("test the SelectAnnotationsFile modal", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test default properties', () => {
        const annotations = ReactDOM.render(<SelectAnnotationsFile/>, document.getElementById("container"));
        expect(annotations).toExist();
        const annotationsNode = ReactDOM.findDOMNode(annotations);
        expect(annotationsNode).toNotExist();
    });
    it('test file selected', (done) => {
        const jsonFile = new File([`{ "coordinates": [
                    4.6142578125,
                    45.67548217560647
                ],
                "type": "Point"
            }`
        ], "file.json", {
            type: "application/json"
        });
        const onFileChoosen = (features, override) => {
            expect(features instanceof Array).toBe(true);
            expect(features.length).toBe(1);
            expect(override).toBe(false);
            done();
        };
        const annotations = ReactDOM.render(<SelectAnnotationsFile onFileChoosen={onFileChoosen} show/>, document.getElementById("container"));
        expect(annotations).toExist();
        const annotationsNode = ReactDOM.findDOMNode(annotations);
        expect(annotationsNode).toExist();
        annotations.checkfile([jsonFile]);
    });

    it('test file selected to fail', (done) => {
        const jsonFile = new File([`[{
            "geometry": {
                "type": "MultiPolygon"
            },
            "properties": {
                "id": "25cbbbb0-1625-11e8-a091-639e3ca0149f",
                "title": "Pino"
            },
            "style": {
                "highlight": false
            },
            "type": "Feature"
            }]`
        ], "file.txt", {
            type: "text/plain"
        });
        const annotations = ReactDOM.render(<SelectAnnotationsFile show/>, document.getElementById("container"));
        expect(annotations).toExist();
        const annotationsNode = ReactDOM.findDOMNode(annotations);
        expect(annotationsNode).toExist();
        annotations.componentDidUpdate = () => {
            if (annotations.state.error) {
                expect(annotations.state.error).toExist();
                done();
            }
        };
        annotations.checkfile([jsonFile]);
    });

});
