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

const dragDropContext = require('react-dnd').DragDropContext;
const html5Backend = require('react-dnd-html5-backend');
const AnnotationsEditor = dragDropContext(html5Backend)(require('../AnnotationsEditor'));
const TestUtils = require('react-dom/test-utils');

const actions = {
    onChangeProperties: () => {},
    onSetUnsavedChanges: () => {},
    onEdit: () => {},
    onCancelEdit: () => {},
    onSetUnsavedStyle: () => {},
    onError: () => {},
    onDownload: () => {}
};
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
        const properties = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const viewer = ReactDOM.render(<AnnotationsEditor {...properties} {...actions} editing={{
            properties
        }}/>, document.getElementById("container"));
        expect(viewer).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "input").length).toEqual(1);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(viewer, "quill").length).toEqual(1);
    });

    it('test click remove annotation', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onRemoveHandler: () => { }
        };

        const spyRemove = expect.spyOn(testHandlers, 'onRemoveHandler');

        let viewer = ReactDOM.render(<AnnotationsEditor annotations={["test"]} {...feature} editing={{properties: {id: "1"}}} onChangeProperties={()=>{}} onSetUnsavedChanges={()=>{}}
            onConfirmRemove={testHandlers.onRemoveHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();
        let btnGroup = document.querySelector(".mapstore-annotations-info-viewer-buttons");
        let toolBarButtons = btnGroup.querySelectorAll('button');
        let removeBtn = toolBarButtons[1];
        expect(toolBarButtons.length).toBe(4);
        expect(removeBtn).toExist();
        TestUtils.Simulate.click(removeBtn);
        const dialog = document.getElementById("confirm-dialog");
        expect(dialog).toExist();
        const confirm = dialog.querySelectorAll('button')[1];
        TestUtils.Simulate.click(confirm);
        expect(spyRemove).toHaveBeenCalled();

        // Disable remove button when no annotations present except for the unsaved new annotation
        viewer = ReactDOM.render(<AnnotationsEditor {...feature} editing={{properties: {id: "1"}}} onChangeProperties={()=>{}} onSetUnsavedChanges={()=>{}}
            onConfirmRemove={testHandlers.onRemoveHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();
        btnGroup = document.querySelector(".mapstore-annotations-info-viewer-buttons");
        toolBarButtons = btnGroup.querySelectorAll('button');
        removeBtn = toolBarButtons[1];
        expect(toolBarButtons.length).toBe(4);
        expect(removeBtn.disabled).toBe(true);

    });

    it('test click save', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onSaveHandler: (id) => { return id; },
            onCancelHandler: (id) => { return id; },
            onToggleGeometryEditHandler: (flag) => { return flag; }
        };

        const spySave = expect.spyOn(testHandlers, 'onSaveHandler');
        const spyCancel = expect.spyOn(testHandlers, 'onCancelHandler');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions}
            selected={null}
            editing={{
                properties: feature,
                features: [{}]
            }}
            onSave={testHandlers.onSaveHandler}
            onCancelEdit={testHandlers.onCancelHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let saveButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[2]);

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

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions} editing={{
            properties: feature,
            geometry: {}
        }} onSave={testHandlers.onSaveHandler}
        onCancelEdit={testHandlers.onCancelHandler}
        onResetCoordEditor={()=>null}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let cancelButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[0]);

        expect(cancelButton).toExist();
        TestUtils.Simulate.click(cancelButton);

        expect(spySave.calls.length).toEqual(0);
        expect(spyCancel.calls.length).toEqual(1);
    });

    it('test click cancel trigger UnsavedChangesModal', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const testHandlers = {
            onToggleUnsavedChangesModal: (id) => { return id; }
        };

        const spyUnsavedModal = expect.spyOn(testHandlers, 'onToggleUnsavedChangesModal');

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions} editing={{
            properties: feature,
            geometry: {}
        }}
        onToggleUnsavedChangesModal={testHandlers.onToggleUnsavedChangesModal}
        unsavedChanges
        />, document.getElementById("container"));
        expect(viewer).toExist();

        let cancelButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[0]);

        expect(cancelButton).toExist();
        TestUtils.Simulate.click(cancelButton);

        expect(spyUnsavedModal.calls.length).toEqual(1);
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

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions} editing={{
            properties: feature,
            features: [{}]
        }} onSave={testHandlers.onSaveHandler}
        onError={testHandlers.onErrorHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let saveButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[2]);

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

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions} editing={{
            properties: feature,
            features: null
        }} onSave={testHandlers.onSaveHandler}
        onError={testHandlers.onErrorHandler}/>, document.getElementById("container"));
        expect(viewer).toExist();

        let saveButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[2]);

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
        const testHandlers = {
            onChangeProperties: (id) => { return id; }
        };
        const spyChangeProperties = expect.spyOn(testHandlers, 'onChangeProperties');
        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions}
            onChangeProperties={testHandlers.onChangeProperties}
            editing={{
                properties: feature
            }}/>, document.getElementById("container"));
        expect(viewer).toExist();

        const titleField = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "input")[0]);
        titleField.value = 'anothertitle';
        TestUtils.Simulate.change(titleField);
        expect(spyChangeProperties.calls.length).toEqual(2);

    });

    it('test errors', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions}
            editing={{
                properties: feature,
                geometry: {type: "MultiPoint"}
            }}
            errors={{
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

        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions} styling
            editing={{
                properties: feature,
                style: [{}]
            }}/>, document.getElementById("container"));
        expect(viewer).toExist();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode.className).toBe('mapstore-annotations-info-viewer');

        const stylerPanel = TestUtils.findRenderedDOMComponentWithClass(viewer, "mapstore-annotations-info-viewer-styler");
        expect(stylerPanel).toExist();
    });

    it('test onDownload annotation', () => {
        const feature = {
            id: "1",
            title: 'mytitle',
            description: '<span><i>desc</i></span>'
        };

        const spyOnDownload = expect.spyOn(actions, 'onDownload');
        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions}
            onDownload={actions.onDownload}
            editing={{
                features: [{id: "1"}],
                properties: feature,
                newFeature: true
            }}/>, document.getElementById("container"));

        expect(viewer).toExist();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode.className).toBe('mapstore-annotations-info-viewer');

        const buttonsRow = viewerNode.querySelector('.mapstore-annotations-info-viewer-buttons .noTopMargin');
        expect(buttonsRow).toBeTruthy();

        const buttons = buttonsRow.querySelectorAll('button');
        expect(buttons.length).toBe(4);

        const downloadCurrentAnnotation = buttons[3];
        expect(downloadCurrentAnnotation.disabled).toBe(false);

        TestUtils.Simulate.click(downloadCurrentAnnotation);
        expect(spyOnDownload).toHaveBeenCalled();
        expect(spyOnDownload.calls[0].arguments[0]).toEqual({features: [{id: "1"}], properties: feature});
    });
});
