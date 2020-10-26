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
    onSetAnnotationMeasurement: () => {},
    onDownload: () => {},
    onHideMeasureWarning: () => {},
    onSelectFeature: () => {}
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

    it('test Measurement annotation', () => {
        const feature = {
            id: "1",
            title: 'Measure Length',
            description: '<span><i>Description</i></span>',
            type: "Measure",
            iconGlyph: "1-measure-length"
        };
        const spyOnSetAnnotationMeasurement = expect.spyOn(actions, "onSetAnnotationMeasurement");
        const spyOnHideMeasureWarning = expect.spyOn(actions, "onHideMeasureWarning");
        const viewer = ReactDOM.render(<AnnotationsEditor {...feature} {...actions} styling
            onSetAnnotationMeasurement={actions.onSetAnnotationMeasurement}
            onHideMeasureWarning={actions.onHideMeasureWarning}
            onSelectFeature={actions.onHideMeasureWarning}
            measurementAnnotationEdit
            showAgain
            editing={{
                properties: feature,
                features: [{
                    type: 'Feature',
                    geometry: {type: "LineString"},
                    properties: {
                        id: 1,
                        values: [{
                            value: '1511',
                            formattedValues: "1,511 m",
                            position: [1, 1],
                            type: 'length'
                        }]
                    }
                },
                {type: 'Feature', geometry: {type: "Point"}}],
                style: [{}]
            }}/>, document.getElementById("container"));
        expect(viewer).toBeTruthy();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode.className).toBe('mapstore-annotations-info-viewer');

        const annotationInfoViewer = TestUtils.findRenderedDOMComponentWithClass(viewer, "mapstore-annotations-info-viewer-items");
        const geometriesToolbar = document.querySelector('.geometries-toolbar');
        const geometryCard = document.querySelectorAll('.geometry-card');
        expect(annotationInfoViewer).toBeTruthy();
        expect(geometriesToolbar).toBeTruthy();

        const geomButton = geometriesToolbar.children[1].getElementsByTagName('button');
        expect(geomButton.length).toBe(1);
        const editMeasureButton = geomButton[0];
        expect(editMeasureButton.children[0].className).toContain(feature.iconGlyph);
        expect(geometryCard.length).toBe(2);

        // Edit measurement
        TestUtils.Simulate.click(editMeasureButton);
        expect(spyOnSetAnnotationMeasurement).toHaveBeenCalled();
        expect(spyOnHideMeasureWarning).toHaveBeenCalled();
        expect(spyOnSetAnnotationMeasurement.calls[0].arguments).toBeTruthy();
        expect(spyOnSetAnnotationMeasurement.calls[0].arguments.length).toBe(2);
        const features = spyOnSetAnnotationMeasurement.calls[0].arguments[0];
        expect(features.length).toBe(1);
        expect(features[0].geometry.type).toBe('LineString');
    });

    it('test Measurement geometry', () => {
        const properties = {
            id: "1",
            title: 'Measure Length',
            description: '<span><i>Description</i></span>',
            type: "Measure",
            iconGlyph: "1-measure-length"
        };
        const feature = {
            properties,
            features: [{
                type: 'Feature',
                geometry: {type: "LineString"},
                properties: {
                    id: 1,
                    values: [{
                        value: '1511',
                        formattedValues: "1,511 m",
                        position: [1, 1],
                        type: 'length'
                    }]
                }
            },
            {type: 'Feature', geometry: {type: "Point"}}],
            style: [{}]
        };
        const viewer = ReactDOM.render(<AnnotationsEditor {...properties} {...actions} styling
            onSetAnnotationMeasurement={actions.onSetAnnotationMeasurement}
            measurementAnnotationEdit
            selected={feature}
            editing={feature}/>, document.getElementById("container"));
        expect(viewer).toBeTruthy();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode.className).toBe('mapstore-annotations-info-viewer');

        const annotationInfoViewer = TestUtils.findRenderedDOMComponentWithClass(viewer, "mapstore-annotations-info-viewer-items");
        const geometryCard = document.querySelectorAll('.geometry-card');
        expect(annotationInfoViewer).toBeTruthy();
        expect(geometryCard.length).toBe(2);

        // Onclick of measurement geometry
        TestUtils.Simulate.click(geometryCard[0]);
        const navTabs = document.querySelector('.nav-tabs');
        expect(navTabs.children.length).toBe(1);
        const styleTab = navTabs.children[0].childNodes[0].textContent;
        expect(styleTab).toContain('Style');
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
