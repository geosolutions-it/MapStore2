/**
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
        expect(annotations).toExist();
        const annotationsNode = ReactDOM.findDOMNode(annotations);
        expect(annotationsNode).toNotExist();
    });

    it('test removing annotations', () => {
        const annotations = ReactDOM.render(<Annotations removing={{}}/>, document.getElementById("container"));
        expect(annotations).toExist();

        const annotationsNode = ReactDOM.findDOMNode(annotations);
        expect(annotationsNode).toExist();
    });

    it('test removing annotations and confirm', () => {
        const testHandlers = {
            onConfirmHandler: (obj) => { return obj; },
            onCancelHandler: () => {}
        };

        const spyConfirm = expect.spyOn(testHandlers, 'onConfirmHandler');
        const spyCancel = expect.spyOn(testHandlers, 'onCancelHandler');

        const removingObj = {};

        const annotations = ReactDOM.render(<Annotations removing={removingObj} onConfirmRemove={testHandlers.onConfirmHandler}
            onCancelRemove={testHandlers.onCancelHandler}/>, document.getElementById("container"));
        expect(annotations).toExist();

        let confirmButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(annotations, "button")[1]);

        expect(confirmButton).toExist();
        TestUtils.Simulate.click(confirmButton);

        expect(spyConfirm.calls.length).toEqual(1);
        expect(spyConfirm.calls[0].arguments[0]).toEqual(removingObj);
        expect(spyCancel.calls.length).toEqual(0);
    });

    it('test removing annotations and cancel', () => {
        const testHandlers = {
            onConfirmHandler: (obj) => { return obj; },
            onCancelHandler: () => {}
        };

        const spyConfirm = expect.spyOn(testHandlers, 'onConfirmHandler');
        const spyCancel = expect.spyOn(testHandlers, 'onCancelHandler');

        const annotations = ReactDOM.render(<Annotations removing onConfirmRemove={testHandlers.onConfirmHandler}
            onCancelRemove={testHandlers.onCancelHandler}/>, document.getElementById("container"));
        expect(annotations).toExist();

        let cancelButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(annotations, "button")[2]);

        expect(cancelButton).toExist();
        TestUtils.Simulate.click(cancelButton);

        expect(spyConfirm.calls.length).toEqual(0);
        expect(spyCancel.calls.length).toEqual(1);
    });

    it('test rendering list mode', () => {
        const annotationsList = [{
            properties: {
                title: 'a',
                description: 'b'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }, {
            properties: {
                title: 'a',
                description: 'b'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }];

        const annotations = ReactDOM.render(<Annotations mode="list" annotations={annotationsList}/>, document.getElementById("container"));
        expect(annotations).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card").length).toBe(2);
    });

    it('test rendering list mode with filter', () => {
        const annotationsList = [{
            properties: {
                title: 'a',
                description: 'b'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }, {
            properties: {
                title: 'c',
                description: 'd'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }];

        const annotations = ReactDOM.render(<Annotations mode="list" filter="b" annotations={annotationsList}/>, document.getElementById("container"));
        expect(annotations).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card").length).toBe(1);
    });

    it('test rendering detail mode', () => {
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

        const Editor = () => <div className="myeditor"/>;
        const annotations = ReactDOM.render(<Annotations mode="detail" editor={Editor} current="1" annotations={annotationsList}/>, document.getElementById("container"));
        expect(annotations).toExist();
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
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }}/>, document.getElementById("container"));
        expect(annotations).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card").length).toBe(0);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "myeditor").length).toBe(1);
    });

    it('test rendering custom class', () => {
        const annotationsList = [{
            properties: {
                title: 'a',
                description: 'b'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }, {
            properties: {
                external: true,
                title: 'c',
                description: 'd'
            },
            style: {
                iconShape: 'square',
                iconColor: 'blue'
            }
        }];

        const classNameSelector = (annotation) => {
            if (annotation && annotation.properties && annotation.properties.external) {
                return 'external';
            }
            return '';
        };

        const annotations = ReactDOM.render(<Annotations mode="list" classNameSelector={classNameSelector} annotations={annotationsList} />, document.getElementById("container"));

        expect(annotations).toExist();

        const cards = TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card");
        expect(cards.length).toBe(2);

        const cardsExternal = TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card external");
        expect(cardsExternal.length).toBe(1);
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
        expect(annotations).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "mapstore-annotations-panel-card").length).toBe(0);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(annotations, "myeditor1").length).toBe(1);
    });
});
