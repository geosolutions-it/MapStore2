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
const {filter} = require('lodash');
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
        expect(isVisibleButton(downloadBtn)).toBe(false);
        expect(isVisibleButton(editButton)).toBe(false);
    });
    it('check showAdvancedFilterButton false', () => {
        ReactDOM.render(<Toolbar showAdvancedFilterButton={false} />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        const advFilterButton = document.getElementById("fg-search");
        expect(isVisibleButton(advFilterButton)).toBe(false);
    });
    it('check showAdvancedFilterButton default', () => {
        ReactDOM.render(<Toolbar />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        const advFilterButton = document.getElementById("fg-search");
        expect(isVisibleButton(advFilterButton)).toBe(true);
    });
    it('check showSyncOnMapButton false', () => {
        ReactDOM.render(<Toolbar showSyncOnMapButton={false} />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        const advFilterButton = document.getElementById("fg-grid-map-filter");
        expect(isVisibleButton(advFilterButton)).toBe(false);
    });
    it('check showSyncOnMapButton default', () => {
        ReactDOM.render(<Toolbar />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        const advFilterButton = document.getElementById("fg-grid-map-filter");
        expect(isVisibleButton(advFilterButton)).toBe(true);
    });
    it('check download displayDownload', () => {
        ReactDOM.render(<Toolbar displayDownload />, document.getElementById("container"));
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
    it('check search button', () => {
        const events = {
            showQueryPanel: () => {}
        };
        spyOn(events, "showQueryPanel");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" isSearchAllowed/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let editButton = document.getElementById("fg-search");
        expect(isVisibleButton(editButton)).toBe(true);
        editButton.click();
        expect(events.showQueryPanel).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" isEditingAllowed/>, document.getElementById("container"));
        editButton = document.getElementById("fg-search");
        expect(isVisibleButton(editButton)).toBe(false);
    });
    it('check zoom-all button', () => {
        const events = {
            zoomAll: () => {}
        };
        spyOn(events, "zoomAll");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let editButton = document.getElementById("fg-zoom-all");
        expect(isVisibleButton(editButton)).toBe(true);
        editButton.click();
        expect(events.zoomAll).toHaveBeenCalled();
        ReactDOM.render(<Toolbar events={events} mode="EDIT" isEditingAllowed/>, document.getElementById("container"));
        editButton = document.getElementById("fg-zoom-all");
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
        ReactDOM.render(<Toolbar events={events} mode="VIEW" selectedCount={0} isColumnsOpen/>, document.getElementById("container"));
        button = document.getElementById("fg-grid-settings");
        expect(isVisibleButton(button)).toBe(true);
        expect(button.className).toExist();
        expect(button.className.indexOf("success") >= 0).toBe(true);
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
    it('check not supported geometry in EDIT mode', () => {

        ReactDOM.render(<Toolbar mode="EDIT" selectedCount={0} hasSupportedGeometry={false} />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        expect(filter(document.getElementsByClassName("square-button"), function(b) { return isVisibleButton(b); }).length).toBe(2);
        expect(isVisibleButton(document.getElementById("fg-add-feature"))).toBe(false);
        expect(isVisibleButton(document.getElementById("fg-back-view"))).toBe(true);
        expect(isVisibleButton(document.getElementById("fg-grid-map-filter"))).toBe(true);

        ReactDOM.render(<Toolbar mode="EDIT" selectedCount={1} hasSupportedGeometry={false} />, document.getElementById("container"));
        expect(filter(document.getElementsByClassName("square-button"), function(b) { return isVisibleButton(b); }).length).toBe(3);
        expect(isVisibleButton(document.getElementById("fg-add-feature"))).toBe(false);
        expect(isVisibleButton(document.getElementById("fg-draw-feature"))).toBe(false);
        expect(isVisibleButton(document.getElementById("fg-delete-geometry"))).toBe(false);
        expect(isVisibleButton(document.getElementById("fg-remove-features"))).toBe(true);
        expect(isVisibleButton(document.getElementById("fg-back-view"))).toBe(true);
        expect(isVisibleButton(document.getElementById("fg-grid-map-filter"))).toBe(true);
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));

        ReactDOM.render(<Toolbar mode="EDIT" selectedCount={1} hasSupportedGeometry={false} hasChanges/>, document.getElementById("container"));
        expect(filter(document.getElementsByClassName("square-button"), function(b) { return isVisibleButton(b); }).length).toBe(3);
        expect(isVisibleButton(document.getElementById("fg-draw-feature"))).toBe(false);
        expect(isVisibleButton(document.getElementById("fg-delete-geometry"))).toBe(false);
        expect(isVisibleButton(document.getElementById("fg-save-feature"))).toBe(true);
        expect(isVisibleButton(document.getElementById("fg-cancel-editing"))).toBe(true);
        expect(isVisibleButton(document.getElementById("fg-grid-map-filter"))).toBe(true);
    });

    it('check zoom-all button if all features has no geom', () => {
        const events = {
            switchEditMode: () => {}
        };
        spyOn(events, "switchEditMode");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" disableZoomAll/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let zoomAllButton = document.getElementById("fg-zoom-all");
        expect(isVisibleButton(zoomAllButton)).toBe(true);
        expect(el.children[2].disabled).toBe(true);
        ReactDOM.render(<Toolbar events={events} mode="VIEW" disableZoomAll={false}/>, document.getElementById("container"));
        zoomAllButton = document.getElementById("fg-zoom-all");
        expect(el.children[2].disabled).toBe(false);
    });
    describe('time sync button', () => {
        it('visibility', () => {
            ReactDOM.render(<Toolbar mode="VIEW" disableZoomAll />, document.getElementById("container"));
            expect(isVisibleButton(document.getElementById("fg-timeSync-button"))).toBe(false);
            ReactDOM.render(<Toolbar showTimeSyncButton show mode="VIEW" disableZoomAll />, document.getElementById("container"));
            expect(isVisibleButton(document.getElementById("fg-timeSync-button"))).toBe(true);
        });
        it('enabled/disabled state', () => {
            ReactDOM.render(<Toolbar showTimeSyncButton timeSync mode="VIEW" disableZoomAll />, document.getElementById("container"));
            expect(document.getElementById("fg-timeSync-button").className.split(' ')).toInclude('btn-success');
            ReactDOM.render(<Toolbar showTimeSyncButton mode="VIEW" disableZoomAll />, document.getElementById("container"));
            expect(document.getElementById("fg-timeSync-button").className.split(' ')).toNotInclude('btn-success');
        });
        it('handler', () => {
            const events = {
                setTimeSync: () => { }
            };
            const spy = spyOn(events, "setTimeSync");
            ReactDOM.render(<Toolbar showTimeSyncButton timeSync events={events} mode="VIEW" disableZoomAll />, document.getElementById("container"));
            document.getElementById("fg-timeSync-button").click();
            expect(spy.calls[0].arguments[0]).toBe(false);
            ReactDOM.render(<Toolbar showTimeSyncButton events={events} mode="VIEW" disableZoomAll />, document.getElementById("container"));
            document.getElementById("fg-timeSync-button").click();
            expect(spy.calls[1].arguments[0]).toBe(true);
        });
    });
    it('check chart button', () => {
        const events = {
            chart: () => {}
        };
        spyOn(events, "chart");
        ReactDOM.render(<Toolbar events={events} mode="VIEW" showChartButton />, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-toolbar")[0];
        expect(el).toExist();
        let chart = document.getElementById("fg-grid-map-chart");
        expect(isVisibleButton(chart)).toBe(true);

    });
});
