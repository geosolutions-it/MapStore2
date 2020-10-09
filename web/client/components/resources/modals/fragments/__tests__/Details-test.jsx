/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';

import Details from '../Details';
import { htmlToDraftJSEditorState } from '../../../../../utils/EditorUtils';

describe('Details component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Details with defaults', () => {
        ReactDOM.render(<Details/>, document.getElementById('container'));
        const detailsSheet = document.getElementsByClassName('ms-details-sheet')[0];
        expect(detailsSheet).toExist();
        const buttons = detailsSheet.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(1);
    });
    it('Details with savedDetailsText', () => {
        ReactDOM.render(<Details savedDetailsText="text"/>, document.getElementById('container'));
        const detailsSheet = document.getElementsByClassName('ms-details-sheet')[0];
        expect(detailsSheet).toExist();
        const buttons = detailsSheet.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(5);
    });
    it('Details undo sets linkedResource to detailsBackup', () => {
        const handlers = {
            onUpdateLinkedResource: () => {},
            setDetailsBackup: () => {}
        };

        const updLinkedResourceSpy = expect.spyOn(handlers, 'onUpdateLinkedResource');
        const setDetailsBackupSpy = expect.spyOn(handlers, 'setDetailsBackup');

        ReactDOM.render(<Details detailsBackup="text" onUpdateLinkedResource={handlers.onUpdateLinkedResource} setDetailsBackup={handlers.setDetailsBackup}/>, document.getElementById('container'));
        const detailsSheet = document.getElementsByClassName('ms-details-sheet')[0];
        expect(detailsSheet).toExist();
        const buttons = detailsSheet.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(2);
        const undoButton = [buttons[0], buttons[1]].filter(but => but.childNodes[0]?.className?.indexOf('glyphicon-undo') > -1)[0];
        expect(undoButton).toExist();

        TestUtils.Simulate.click(undoButton);

        expect(updLinkedResourceSpy).toHaveBeenCalled();
        expect(setDetailsBackupSpy).toHaveBeenCalled();
        expect(updLinkedResourceSpy).toHaveBeenCalledWith('details', 'text', 'DETAILS');
    });
    it('hideDetailsSheet is called on close and save of the Details sheet', () => {
        const handlers = {
            onHideDetailsSheet: () => {}
        };
        const onHideDetailsSheetSpy = expect.spyOn(handlers, 'onHideDetailsSheet');

        ReactDOM.render(<Details showDetailsSheet editorState={htmlToDraftJSEditorState('')} onHideDetailsSheet={handlers.onHideDetailsSheet}/>, document.getElementById('container'));
        const detailsSheet = document.getElementsByClassName('ms-details-sheet')[0];
        expect(detailsSheet).toExist();
        const sheetModal = document.getElementsByClassName('modal-fixed')[0];
        expect(sheetModal).toExist();
        const sheetModalFooter = sheetModal.getElementsByClassName('modal-footer')[0];
        expect(sheetModalFooter).toExist();
        const buttons = sheetModalFooter.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(2);

        TestUtils.Simulate.click(buttons[0]);

        expect(onHideDetailsSheetSpy).toHaveBeenCalled();
        expect(onHideDetailsSheetSpy.calls.length).toBe(1);

        TestUtils.Simulate.click(buttons[1]);

        expect(onHideDetailsSheetSpy.calls.length).toBe(2);
    });
    it('saved text changes on save', () => {
        const handlers = {
            onUpdateLinkedResource: () => {}
        };
        const onUpdateLinkedResourceSpy = expect.spyOn(handlers, 'onUpdateLinkedResource');

        ReactDOM.render(<Details showDetailsSheet savedDetailsText="text" editorState={htmlToDraftJSEditorState('<p>newtext</p>')} onUpdateLinkedResource={handlers.onUpdateLinkedResource}/>, document.getElementById('container'));
        const detailsSheet = document.getElementsByClassName('ms-details-sheet')[0];
        expect(detailsSheet).toExist();
        const sheetModal = document.getElementsByClassName('modal-fixed')[0];
        expect(sheetModal).toExist();
        const sheetModalFooter = sheetModal.getElementsByClassName('modal-footer')[0];
        expect(sheetModalFooter).toExist();
        const buttons = sheetModalFooter.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(2);

        TestUtils.Simulate.click(buttons[1]);

        expect(onUpdateLinkedResourceSpy).toHaveBeenCalled();
        expect(onUpdateLinkedResourceSpy.calls[0].arguments).toEqual(['details', '<p>newtext</p>\n', 'DETAILS']);
    });
    it('saved text does not change if onSave saves with empty string', () => {
        const handlers = {
            onUpdateLinkedResource: () => {}
        };
        const onUpdateLinkedResourceSpy = expect.spyOn(handlers, 'onUpdateLinkedResource');

        ReactDOM.render(<Details showDetailsSheet savedDetailsText="text" editorState={htmlToDraftJSEditorState('')} onUpdateLinkedResource={handlers.onUpdateLinkedResource}/>, document.getElementById('container'));
        const detailsSheet = document.getElementsByClassName('ms-details-sheet')[0];
        expect(detailsSheet).toExist();
        const sheetModal = document.getElementsByClassName('modal-fixed')[0];
        expect(sheetModal).toExist();
        const sheetModalFooter = sheetModal.getElementsByClassName('modal-footer')[0];
        expect(sheetModalFooter).toExist();
        const buttons = sheetModalFooter.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(2);

        TestUtils.Simulate.click(buttons[1]);

        expect(onUpdateLinkedResourceSpy).toHaveBeenCalled();
        expect(onUpdateLinkedResourceSpy.calls[0].arguments).toEqual(['details', 'text', 'DETAILS']);
    });
    it('saved text is NODATA if onSave saves with empty string and there is no savedDetailsText', () => {
        const handlers = {
            onUpdateLinkedResource: () => {}
        };
        const onUpdateLinkedResourceSpy = expect.spyOn(handlers, 'onUpdateLinkedResource');

        ReactDOM.render(<Details showDetailsSheet editorState={htmlToDraftJSEditorState('')} onUpdateLinkedResource={handlers.onUpdateLinkedResource}/>, document.getElementById('container'));
        const detailsSheet = document.getElementsByClassName('ms-details-sheet')[0];
        expect(detailsSheet).toExist();
        const sheetModal = document.getElementsByClassName('modal-fixed')[0];
        expect(sheetModal).toExist();
        const sheetModalFooter = sheetModal.getElementsByClassName('modal-footer')[0];
        expect(sheetModalFooter).toExist();
        const buttons = sheetModalFooter.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(2);

        TestUtils.Simulate.click(buttons[1]);

        expect(onUpdateLinkedResourceSpy).toHaveBeenCalled();
        expect(onUpdateLinkedResourceSpy.calls[0].arguments).toEqual(['details', 'NODATA', 'DETAILS']);
    });
});
