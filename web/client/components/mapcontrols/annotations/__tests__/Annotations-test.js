/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const Annotations = require('../Annotations');

const TestUtils = require('react-dom/test-utils');

describe("test the Annotations Panel", () => {
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
        const annotations = ReactDOM.render(<Annotations/>, document.getElementById("container"));
        expect(annotations).toBeTruthy();
        const annotationsNode = ReactDOM.findDOMNode(annotations);
        expect(annotationsNode).toBeTruthy();
    });

    it('test removing annotations', () => {
        const annotations = ReactDOM.render(<Annotations removing={{}}/>, document.getElementById("container"));
        expect(annotations).toBeTruthy();

        const annotationsNode = ReactDOM.findDOMNode(annotations);
        expect(annotationsNode).toBeTruthy();
    });

    it('test rendering detail mode', () => {
        const annotationsList = [{
            properties: {
                id: '1',
                title: 'a',
                description: 'b'
            },
            geometry: {
                type: "MultiPoint"
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }, {
            properties: {
                id: '2',
                title: 'a',
                description: 'b'
            },
            geometry: {
                type: "MultiPoint"
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }];

        const Editor = () => <div className="myeditor"/>;
        const annotations = ReactDOM.render(<Annotations mode="detail" editor={Editor} current="1" annotations={annotationsList}/>, document.getElementById("container"));
        expect(annotations).toBeTruthy();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card").length).toBe(0);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "myeditor").length).toBe(1);
    });

    it('test rendering editing mode', () => {
        const Editor = () => <div className="myeditor"/>;
        const annotations = ReactDOM.render(<Annotations mode="editing" editor={Editor} editing={{
            properties: {
                id: '1',
                title: 'a',
                description: 'b'
            },
            geometry: {
                type: "MultiPoint"
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }}/>, document.getElementById("container"));
        expect(annotations).toBeTruthy();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card").length).toBe(0);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "myeditor").length).toBe(1);
    });

    it('test rendering custom class', () => {
        const annotationsList = [{
            properties: {
                title: 'a',
                description: 'b'
            },
            geometry: {
                type: "MultiPoint"
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue',
                iconGlyph: 'comment'
            }
        }, {
            properties: {
                external: true,
                title: 'c',
                description: 'd'
            },
            geometry: {
                type: "MultiPoint"
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue',
                iconGlyph: 'comment'
            }
        }];

        const classNameSelector = (annotation) => {
            if (annotation && annotation.properties && annotation.properties.external) {
                return 'external';
            }
            return '';
        };

        const annotations = ReactDOM.render(<Annotations mode="list" classNameSelector={classNameSelector} annotations={annotationsList} />, document.getElementById("container"));

        expect(annotations).toBeTruthy();

        /*
        TODO verify the external properties
        const cardsExternal = TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card external");
        expect(cardsExternal.length).toBe(1);*/
    });

    it('test custom editor', () => {
        const annotationsList = [{
            properties: {
                id: '1',
                title: 'a',
                description: 'b'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }, {
            properties: {
                id: '2',
                title: 'a',
                description: 'b'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }];

        const Editor = (props) => {
            return <span className={"myeditor" + props.feature.properties.id}>This is my editor</span>;
        };
        const annotations = ReactDOM.render(<Annotations mode="detail" editor={Editor} current="1" annotations={annotationsList} />, document.getElementById("container"));
        expect(annotations).toBeTruthy();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card").length).toBe(0);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "myeditor1").length).toBe(1);
    });

    it('test annotation card', ()=> {
        const actions = {
            onZoom: () => {},
            onToggleVisibility: () => {},
            onHighlight: () => {}
        };
        const spyOnToggleVisibility = expect.spyOn(actions, 'onToggleVisibility');
        const spyOnHighlight = expect.spyOn(actions, 'onHighlight');
        const spyOnZoom = expect.spyOn(actions, 'onZoom');
        const annotations = [{
            "type": "FeatureCollection",
            "properties": {
                "id": "819b4120-aa2c-11ea-95b6-c74060290256",
                "title": "Poly",
                "description": "<p>Description</p><p>Next Line</p>",
                "visibility": true
            },
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "coordinates": [[[-121.07812513411045, 42.11778385718358],
                            [ -116.2265622317791, 44.72175879125132],
                            [ -115.87499973177908, 40.773885871584866],
                            [ -114.96093589067458, 42.68889580392076],
                            [ -121.07812513411045, 42.11778385718358]]
                        ],
                        "type": "Polygon"
                    },
                    "properties": {
                        "id": "829d47d0-aa2c-11ea-95b6-c74060290256",
                        "isValidFeature": true,
                        "canEdit": false,
                        "geometryTitle": "Polygon-test"
                    }
                }
            ]
        }];
        const container = ReactDOM.render(<Annotations annotations={annotations} onZoom={actions.onZoom} onHighlight={actions.onHighlight} onToggleVisibility={actions.onToggleVisibility} />, document.getElementById("container"));
        expect(container).toBeTruthy();

        const sideCard = TestUtils.scryRenderedDOMComponentsWithClass(container, "mapstore-side-card");
        expect(sideCard).toBeTruthy();
        expect(sideCard.length).toBe(1);
        const sideCardTitle = TestUtils.scryRenderedDOMComponentsWithClass(container, "mapstore-annotations-panel-card-title");
        expect(sideCardTitle[0].innerText).toBe('Poly');
        const sideCardDescription = TestUtils.scryRenderedDOMComponentsWithClass(container, "mapstore-annotations-panel-card-description");
        expect(sideCardDescription[0].innerText).toBe('Description');
        const sideCardTools = document.querySelectorAll('.mapstore-side-card-tool .btn-group');
        expect(sideCardTools).toBeTruthy();
        const cardButtons = sideCardTools[0].querySelectorAll('button');
        expect(cardButtons.length).toBe(2);

        // Zoom to annotation
        const zoomBtn = cardButtons[0];
        TestUtils.Simulate.click(zoomBtn);
        expect(spyOnZoom).toHaveBeenCalled();

        // Toggle annotations visibility
        const visibilityBtn = cardButtons[1];
        TestUtils.Simulate.click(visibilityBtn);
        expect(spyOnToggleVisibility).toHaveBeenCalled();

        // Toggle annotation highlight
        TestUtils.Simulate.mouseEnter(sideCard[0]);
        expect(spyOnHighlight).toHaveBeenCalled();
    });
});
