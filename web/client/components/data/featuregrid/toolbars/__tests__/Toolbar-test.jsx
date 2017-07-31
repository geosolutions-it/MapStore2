/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var Toolbar = require('../Toolbar');
var expect = require('expect');
const spyOn = expect.spyOn;

const isVisibleButton = (el) => {
    return el.style.width !== 0 && el.style.width !== "0" && el.style.width !== "0px";
};

describe('Featuregrid toolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<Toolbar/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        const downloadBtn = document.getElementById("fg-download-grid");
        const editButton = document.getElementById("fg-edit-mode");
        expect(isVisibleButton(downloadBtn)).toBe(true);
        expect(isVisibleButton(editButton)).toBe(false);
    });
    it('check edit-mode button', () => {
        const events = {
            switchEditMode: () => {}
        };
        spyOn(events, "switchEditMode");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let editButton = document.getElementById("fg-edit-mode");
        expect(isVisibleButton(editButton)).toBe(true);
        editButton.click();
        expect(events.switchEditMode).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" isEditingAllowed/>, document.getElementById("container"));
        editButton = document.getElementById("fg-edit-mode");
        expect(isVisibleButton(editButton)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed={false}/>, document.getElementById("container"));
        editButton = document.getElementById("fg-edit-mode");
        expect(isVisibleButton(editButton)).toBe(false);
    });
    it('check back-view button', () => {
        const events = {
            switchViewMode: () => {}
        };
        spyOn(events, "switchViewMode");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let backButton = document.getElementById("fg-back-view");
        expect(isVisibleButton(backButton)).toBe(false);
        backButton.click();
        expect(events.switchViewMode).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" isEditingAllowed/>, document.getElementById("container"));
        backButton = document.getElementById("fg-back-view");
        expect(isVisibleButton(backButton)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" hasChanges/>, document.getElementById("container"));
        backButton = document.getElementById("fg-edit-mode");
        expect(isVisibleButton(backButton)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" hasNewFeatures/>, document.getElementById("container"));
        backButton = document.getElementById("fg-edit-mode");
        expect(isVisibleButton(backButton)).toBe(false);
    });
    it('check add-feature button', () => {
        const events = {
            createFeature: () => {}
        };
        spyOn(events, "createFeature");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let addButton = document.getElementById("fg-add-feature");
        expect(isVisibleButton(addButton)).toBe(false);
        addButton.click();
        expect(events.createFeature).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" isEditingAllowed/>, document.getElementById("container"));
        addButton = document.getElementById("fg-add-feature");
        expect(isVisibleButton(addButton)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" hasChanges/>, document.getElementById("container"));
        addButton = document.getElementById("fg-add-feature");
        expect(isVisibleButton(addButton)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" hasNewFeatures/>, document.getElementById("container"));
        addButton = document.getElementById("fg-add-feature");
        expect(isVisibleButton(addButton)).toBe(false);
    });
    it('check draw-feature button', () => {
        // mode === "EDIT" && selectedCount === 1 && (!hasGeometry || hasGeometry && !isSimpleGeom)
        const events = {
            startDrawingFeature: () => {}
        };
        spyOn(events, "startDrawingFeature");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let button = document.getElementById("fg-draw-feature");
        expect(isVisibleButton(button)).toBe(false);
        button.click();
        expect(events.startDrawingFeature).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasGeometry isSimpleGeom={false} />, document.getElementById("container"));
        button = document.getElementById("fg-draw-feature");
        expect(isVisibleButton(button)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasGeometry isSimpleGeom />, document.getElementById("container"));
        button = document.getElementById("fg-draw-feature");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasGeometry={false} />, document.getElementById("container"));
        button = document.getElementById("fg-draw-feature");
        expect(isVisibleButton(button)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasGeometry={false} isSimpleGeom={false} isDrawing/>, document.getElementById("container"));
        button = document.getElementById("fg-draw-feature");
        expect(isVisibleButton(button)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={2}/>, document.getElementById("container"));
        button = document.getElementById("fg-draw-feature");
        expect(isVisibleButton(button)).toBe(false);
    });
    it('check remove-features button', () => {
        // mode === "EDIT" && selectedCount > 0 && !hasChanges && !hasNewFeatures
        const events = {
            deleteFeatures: () => {}
        };
        spyOn(events, "deleteFeatures");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let button = document.getElementById("fg-remove-features");
        expect(isVisibleButton(button)).toBe(false);
        button.click();
        expect(events.deleteFeatures).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} />, document.getElementById("container"));
        button = document.getElementById("fg-remove-features");
        expect(isVisibleButton(button)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasChanges />, document.getElementById("container"));
        button = document.getElementById("fg-remove-features");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasNewFeatures />, document.getElementById("container"));
        button = document.getElementById("fg-remove-features");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={2}/>, document.getElementById("container"));
        button = document.getElementById("fg-remove-features");
        expect(isVisibleButton(button)).toBe(true);
    });
    it('check cancel-editing button', () => {
        // mode === "EDIT" && hasChanges || hasNewFeatures
        const events = {
            clearFeatureEditing: () => {}
        };
        spyOn(events, "clearFeatureEditing");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let button = document.getElementById("fg-cancel-editing");
        expect(isVisibleButton(button)).toBe(false);
        button.click();
        expect(events.clearFeatureEditing).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} />, document.getElementById("container"));
        button = document.getElementById("fg-cancel-editing");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasChanges />, document.getElementById("container"));
        button = document.getElementById("fg-cancel-editing");
        expect(isVisibleButton(button)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasNewFeatures />, document.getElementById("container"));
        button = document.getElementById("fg-cancel-editing");
        expect(isVisibleButton(button)).toBe(true);
    });
    it('check delete-geometry button', () => {
        // mode === "EDIT" && hasGeometry && selectedCount === 1
        const events = {
            deleteGeometry: () => {}
        };
        spyOn(events, "deleteGeometry");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isEditingAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let button = document.getElementById("fg-delete-geometry");
        expect(isVisibleButton(button)).toBe(false);
        button.click();
        expect(events.deleteGeometry).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} />, document.getElementById("container"));
        button = document.getElementById("fg-delete-geometry");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} hasGeometry />, document.getElementById("container"));
        button = document.getElementById("fg-delete-geometry");
        expect(isVisibleButton(button)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="VIEW" selectedCount={1} hasGeometry />, document.getElementById("container"));
        button = document.getElementById("fg-delete-geometry");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={2} hasGeometry/>, document.getElementById("container"));
        button = document.getElementById("fg-delete-geometry");
        expect(isVisibleButton(button)).toBe(false);
    });
    it('check grid-settings button', () => {
        // selectedCount <= 1 && mode === "VIEW"
        const events = {
            settings: () => {}
        };
        spyOn(events, "settings");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" selectedCount={0} />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let button = document.getElementById("fg-grid-settings");
        expect(isVisibleButton(button)).toBe(true);
        button.click();
        expect(events.settings).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} />, document.getElementById("container"));
        button = document.getElementById("fg-grid-settings");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="EDIT" selectedCount={1} />, document.getElementById("container"));
        button = document.getElementById("fg-grid-settings");
        expect(isVisibleButton(button)).toBe(false);
        ReactDOM.render(<Toolbar events={events} mode="VIEW" selectedCount={1} />, document.getElementById("container"));
        button = document.getElementById("fg-grid-settings");
        expect(isVisibleButton(button)).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="VIEW" selectedCount={2} />, document.getElementById("container"));
        button = document.getElementById("fg-grid-settings");
        expect(isVisibleButton(button)).toBe(false);
    });


});
