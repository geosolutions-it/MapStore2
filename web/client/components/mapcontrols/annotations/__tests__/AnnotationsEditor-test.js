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
const AnnotationsEditor = require('../AnnotationsEditor');

const TestUtils = require('react-dom/test-utils');

describe("test the AnnotationsEditor Panel", () => {
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
        const viewer = ReactDOM.render(<AnnotationsEditor/>, document.getElementById("container"));
        expect(viewer).toExist();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode).toExist();
    });

    it('test display annotation', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };
        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} />, document.getElementById("container"));
        expect(viewer).toExist();

        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode).toExist();
        expect(viewerNode.innerText.indexOf('mytitle') !== -1).toBe(true);
        expect(viewerNode.innerHTML.indexOf('<i>desc</i>') !== -1).toBe(true);
    });

    it('test display annotation with component field', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };
        const MyComponent = (props) => {
            return <span>my feature: {props.annotation.id}</span>;
        };
        const viewer = ReactDOM.render(<AnnotationsEditor feature={feature} {...feature} config={{fields: [
            {
                name: 'custom',
                type: 'component',
                value: MyComponent,
                showLabel: false,
                editable: false
            }
        ]}}/>, document.getElementById("container"));
        expect(viewer).toExist();

        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode).toExist();
        expect(viewerNode.innerText.indexOf('my feature: 1') !== -1).toBe(true);
    });

    it('test editing annotation', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };
        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature
        }}/>, document.getElementById("container"));
        expect(viewer).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "input").length).toEqual(1);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(viewer, "quill").length).toEqual(1);
    });

    it('test click edit annotation', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onEditHandler: (id) => { return id; },
            onRemoveHandler: (id) => { return id; }
        };

        const spyEdit = expect.spyOn(testHandlers, 'onEditHandler');
        const spyRemove = expect.spyOn(testHandlers, 'onRemoveHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} onEdit={testHandlers.onEditHandler}
            onRemove={testHandlers.onRemoveHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let editButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[1]);

        expect(editButton).toExist();
        TestUtils.Simulate.click(editButton);

        expect(spyEdit.calls.length).toEqual(1);
        expect(spyRemove.calls.length).toEqual(0);
    });

    it('test click remove annotation', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onEditHandler: (id) => { return id; },
            onRemoveHandler: (id) => { return id; }
        };

        const spyEdit = expect.spyOn(testHandlers, 'onEditHandler');
        const spyRemove = expect.spyOn(testHandlers, 'onRemoveHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} onEdit={testHandlers.onEditHandler}
            onRemove={testHandlers.onRemoveHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let removeButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[2]);

        expect(removeButton).toExist();
        TestUtils.Simulate.click(removeButton);

        expect(spyEdit.calls.length).toEqual(0);
        expect(spyRemove.calls.length).toEqual(1);
    });

    it('test click remove geometry', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onAddHandler: (id) => { return id; },
            onRemoveHandler: (id) => { return id; }
        };

        const spyAdd = expect.spyOn(testHandlers, 'onAddHandler');
        const spyRemove = expect.spyOn(testHandlers, 'onRemoveHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature
        }} onAddGeometry={testHandlers.onAddHandler}
           onDeleteGeometry={testHandlers.onRemoveHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let removeButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[2]);

        expect(removeButton).toExist();
        TestUtils.Simulate.click(removeButton);

        expect(spyAdd.calls.length).toEqual(0);
        expect(spyRemove.calls.length).toEqual(1);
    });

    it('test click add geometry', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onAddHandler: (id) => { return id; },
            onRemoveHandler: (id) => { return id; }
        };

        const spyAdd = expect.spyOn(testHandlers, 'onAddHandler');
        const spyRemove = expect.spyOn(testHandlers, 'onRemoveHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature
        }} onAddGeometry={testHandlers.onAddHandler}
           onDeleteGeometry={testHandlers.onRemoveHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let addButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[0]);

        expect(addButton).toExist();
        TestUtils.Simulate.click(addButton);

        expect(spyAdd.calls.length).toEqual(1);
        expect(spyRemove.calls.length).toEqual(0);
    });

    it('test click save', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onSaveHandler: (id) => { return id; },
            onCancelHandler: (id) => { return id; }
        };

        const spySave = expect.spyOn(testHandlers, 'onSaveHandler');
        const spyCancel = expect.spyOn(testHandlers, 'onCancelHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature,
            geometry: {}
        }} onSave={testHandlers.onSaveHandler}
           onCancelEdit={testHandlers.onCancelHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let saveButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[3]);

        expect(saveButton).toExist();
        TestUtils.Simulate.click(saveButton);

        expect(spySave.calls.length).toEqual(1);
        expect(spyCancel.calls.length).toEqual(0);
    });

    it('test click cancel', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onSaveHandler: (id) => { return id; },
            onCancelHandler: (id) => { return id; }
        };

        const spySave = expect.spyOn(testHandlers, 'onSaveHandler');
        const spyCancel = expect.spyOn(testHandlers, 'onCancelHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature,
            geometry: {}
        }} onSave={testHandlers.onSaveHandler}
           onCancelEdit={testHandlers.onCancelHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let cancelButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[4]);

        expect(cancelButton).toExist();
        TestUtils.Simulate.click(cancelButton);

        expect(spySave.calls.length).toEqual(0);
        expect(spyCancel.calls.length).toEqual(1);
    });

    it('test click save validate title error', () => {
        const feature = {
            id: "1",
            title: '',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onSaveHandler: (id) => { return id; },
            onErrorHandler: (msg) => { return msg; }
        };

        const spySave = expect.spyOn(testHandlers, 'onSaveHandler');
        const spyError = expect.spyOn(testHandlers, 'onErrorHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature,
            geometry: {}
        }} onSave={testHandlers.onSaveHandler}
           onError={testHandlers.onErrorHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let saveButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[3]);

        expect(saveButton).toExist();
        TestUtils.Simulate.click(saveButton);

        expect(spySave.calls.length).toEqual(0);
        expect(spyError.calls.length).toEqual(1);
        expect(spyError.calls[0].arguments[0].title).toBe('annotations.mandatory');
    });

    it('test click save validate geometry error', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onSaveHandler: (id) => { return id; },
            onErrorHandler: (msg) => { return msg; }
        };

        const spySave = expect.spyOn(testHandlers, 'onSaveHandler');
        const spyError = expect.spyOn(testHandlers, 'onErrorHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature
        }} onSave={testHandlers.onSaveHandler}
           onError={testHandlers.onErrorHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let saveButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[3]);

        expect(saveButton).toExist();
        TestUtils.Simulate.click(saveButton);

        expect(spySave.calls.length).toEqual(0);
        expect(spyError.calls.length).toEqual(1);
        expect(spyError.calls[0].arguments[0].geometry).toBe('annotations.emptygeometry');
    });

    it('test edit field', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature
        }}/>, document.getElementById("container"));
        expect(viewer).toExist();

        const titleField = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "input")[0]);
        titleField.value = 'anothertitle';
        TestUtils.Simulate.change(titleField);

        expect(viewer.state.editedFields.title).toEqual('anothertitle');
    });

    it('test errors', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature
        }} errors={{
            title: 'myerror'
        }}/>, document.getElementById("container"));
        expect(viewer).toExist();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode.innerText.indexOf('myerror') !== -1).toBe(true);
    });

    it('test styling', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} styling editing={{
            properties: feature,
            style: {
                iconGlyph: 'comment',
                iconColor: 'red',
                iconShape: 'square'
            }
        }}/>, document.getElementById("container"));
        expect(viewer).toExist();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode.className).toBe('mapstore-annotations-info-viewer-styler');
    });

    it('test styler click on marker', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onSetStyle: (style) => { return style; }
        };

        const spySetStyle = expect.spyOn(testHandlers, 'onSetStyle');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature,
            style: {
                iconGlyph: 'comment',
                iconColor: 'red',
                iconShape: 'square'
            }
        }} onSetStyle={testHandlers.onSetStyle} styling/>, document.getElementById("container"));
        expect(viewer).toExist();
        let marker = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(viewer, "mapstore-annotations-info-viewer-marker")[0]);

        expect(marker).toExist();
        TestUtils.Simulate.click(marker);

        expect(spySetStyle.calls.length).toEqual(1);
        expect(spySetStyle.calls[0].arguments[0]).toExist();
    });

    it('test styler select glyph', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onSetStyle: (style) => { return style; }
        };

        const spySetStyle = expect.spyOn(testHandlers, 'onSetStyle');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{
            properties: feature,
            style: {
                iconGlyph: 'comment',
                iconColor: 'red',
                iconShape: 'square'
            }
        }} onSetStyle={testHandlers.onSetStyle} styling/>, document.getElementById("container"));
        expect(viewer).toExist();

        let select = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(viewer, "Select-control")[0]);

        expect(select).toExist();
        TestUtils.Simulate.keyDown(select, { keyCode: 40, key: 'ArrowDown' });
        TestUtils.Simulate.keyDown(select, { keyCode: 13, key: 'Enter' });

        expect(spySetStyle.calls.length).toEqual(1);
        expect(spySetStyle.calls[0].arguments[0]).toExist();
    });

    it('test annotation zoom', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>',
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [45, 13]
            }
        };

        const testHandlers = {
            onZoom: () => { }
        };
        const spyZoom = expect.spyOn(testHandlers, 'onZoom');

        const viewer = ReactDOM.render(<AnnotationsEditor feature={feature} {...feature} onZoom={testHandlers.onZoom}/>, document.getElementById("container"));
        expect(viewer).toExist();

        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode).toExist();
        const zoomButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(viewer, "mapstore-annotations-info-viewer-buttons")[0]).querySelector('button');

        expect(zoomButton).toExist();
        TestUtils.Simulate.click(zoomButton);

        expect(spyZoom.calls.length).toEqual(1);
    });
});
