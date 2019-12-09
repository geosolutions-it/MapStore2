/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var MetadataModal = require('../MetadataModal.jsx');
const ReactTestUtils = require('react-dom/test-utils');
var expect = require('expect');

describe('This test for MetadataModal', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults, show=false', () => {
        const metadataModalItem = ReactDOM.render(<MetadataModal map={{}} show={false}/>, document.getElementById("container"));
        expect(metadataModalItem).toExist();

        const metadataModalItemDom = ReactDOM.findDOMNode(metadataModalItem);
        expect(metadataModalItemDom).toExist();
        const modalDivList = document.getElementsByClassName("modal-content");
        expect(modalDivList.length).toBe(0);

        const getModals = function() {
            return document.getElementsByTagName("body")[0].getElementsByClassName('modal-dialog');
        };
        expect(getModals().length).toBe(0);

    });

    it('creates the component with defaults, show=true', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["FORMAT"];
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: errors
        };

        const metadataModalItem = ReactDOM.render(<MetadataModal show useModal map={map} id="MetadataModal"/>, document.getElementById("container"));
        expect(metadataModalItem).toExist();

        const modalDivList = document.getElementsByClassName("modal-content");
        const closeBtnList = modalDivList.item(0).getElementsByTagName('button');
        expect(closeBtnList.length).toBe(2);
    });
    /*
     * This checks if you can close the modal even if the function (confirm) is not defined.
     * see https://github.com/geosolutions-it/MapStore2/issues/2576
     */
    it('Test MetadataModal onToggleUnsavedChangesModal only if present', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["FORMAT"];
        let map = {
            unsavedChanges: true,
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: errors
        };
        const actions = {
            onToggleUnsavedChangesModal: () => {},
            onDisplayMetadataEdit: () => {}
        };
        const spyonToggleUnsavedChangesModal = expect.spyOn(actions, 'onToggleUnsavedChangesModal');
        const spyonDisplayMetadataEdit = expect.spyOn(actions, 'onDisplayMetadataEdit');
        const cmp = ReactDOM.render(<MetadataModal
            show useModal map={map} id="MetadataModal"
            detailsSheetActions={{onToggleUnsavedChangesModal: actions.onToggleUnsavedChangesModal}} onDisplayMetadataEdit={actions.spyonDisplayMetadataEdit} />, document.getElementById("container"));
        expect(cmp).toExist();
        let el = document.querySelector('#ms-resizable-modal .btn-group button');
        expect(el).toExist();
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonToggleUnsavedChangesModal).toHaveBeenCalled();
        expect(spyonDisplayMetadataEdit).toNotHaveBeenCalled();
        ReactDOM.render(<MetadataModal
            show useModal map={map} id="MetadataModal"
            onDisplayMetadataEdit={actions.onDisplayMetadataEdit} />, document.getElementById("container"));
        el = document.querySelector('#ms-resizable-modal .btn-group button');
        ReactTestUtils.Simulate.click(el);
        expect(spyonDisplayMetadataEdit).toHaveBeenCalled();
    });

    it('creates the component with a format error', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["FORMAT"];
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: errors
        };

        const metadataModalItem = ReactDOM.render(<MetadataModal show map={map} useModal id="MetadataModal"/>, document.getElementById("container"));
        expect(metadataModalItem).toExist();

        const getModals = function() {
            return document.getElementsByTagName("body")[0].getElementsByClassName('modal-dialog');
        };

        expect(getModals().length).toBe(1);

        const modalDivList = document.getElementsByClassName("modal-content");
        const closeBtnList = modalDivList.item(0).getElementsByTagName('button');
        expect(closeBtnList.length).toBe(2);

        const errorFORMAT = modalDivList.item(0).getElementsByTagName('errorFORMAT');
        expect(errorFORMAT).toExist();
    });

    it('creates the component with a size error', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["SIZE"];
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: errors
        };

        const metadataModalItem = ReactDOM.render(<MetadataModal show map={map} useModal id="MetadataModal"/>, document.getElementById("container"));
        expect(metadataModalItem).toExist();

        const getModals = function() {
            return document.getElementsByTagName("body")[0].getElementsByClassName('modal-dialog');
        };

        expect(getModals().length).toBe(1);

        const modalDivList = document.getElementsByClassName("modal-content");
        const closeBtnList = modalDivList.item(0).getElementsByTagName('button');
        expect(closeBtnList.length).toBe(2);

        const errorFORMAT = modalDivList.item(0).getElementsByTagName('errorSIZE');
        expect(errorFORMAT).toExist();
    });

    it('details row is shown for maps', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["FORMAT"];
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            category: {
                name: "MAP"
            },
            errors: errors
        };

        const metadataModalItem = ReactDOM.render(<MetadataModal show useModal map={map} id="MetadataModal"/>, document.getElementById("container"));
        expect(metadataModalItem).toExist();
        const detailsSheetArray = document.getElementsByClassName('ms-details-sheet');
        expect(detailsSheetArray.length).toBe(1);
    });

    it('details row is hidden for dashboards', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["FORMAT"];
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            category: {
                name: "DASHBOARD"
            },
            errors: errors
        };

        const metadataModalItem = ReactDOM.render(<MetadataModal show useModal map={map} id="MetadataModal"/>, document.getElementById("container"));
        expect(metadataModalItem).toExist();
        const detailsSheetArray = document.getElementsByClassName('ms-details-sheet');
        expect(detailsSheetArray.length).toBe(0);
    });

    it('save button is disabled when name is empty and user is unable to save', () => {
        const thumbnail = "myThumnbnailUrl";
        const errors = [];
        const map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            category: {
                name: "MAP"
            },
            metadata: {
                name: '',
                description: ''
            },
            errors: errors
        };
        const actions = {
            onSave: () => { }
        };

        const spyonOnSave = expect.spyOn(actions, 'onSave');
        const metadataModalItem = ReactDOM.render(<MetadataModal show useModal map={map} id="MetadataModal" onSave={actions.onSave} />, document.getElementById("container"));
        expect(metadataModalItem).toExist();
        const modalDivList = document.getElementsByClassName("modal-content");
        const modalButtons = modalDivList.item(0).getElementsByTagName('button');
        const saveButton = modalButtons[1];
        expect(saveButton.disabled).toBeTruthy();
        ReactTestUtils.Simulate.click(saveButton);
        expect(spyonOnSave).toNotHaveBeenCalled();
    });

    it('save button is enabled when name is filled and user is able to save', () => {
        const thumbnail = "myThumnbnailUrl";
        const errors = [];
        const map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            category: {
                name: "MAP"
            },
            metadata: {
                name: 'some name',
                description: ''
            },
            errors: errors
        };
        const actions = {
            onSave: () => { }
        };

        const spyonOnSave = expect.spyOn(actions, 'onSave');
        const metadataModalItem = ReactDOM.render(<MetadataModal show useModal map={map} id="MetadataModal" onSave={actions.onSave} />, document.getElementById("container"));
        expect(metadataModalItem).toExist();
        const modalDivList = document.getElementsByClassName("modal-content");
        const modalButtons = modalDivList.item(0).getElementsByTagName('button');
        const saveButton = modalButtons[1];
        expect(saveButton.disabled).toBeFalsy();
        ReactTestUtils.Simulate.click(saveButton);
        expect(spyonOnSave).toHaveBeenCalled();
    });
    it('showing unsaved changes modal and closing the modal', () => {
        const actions = {
            onToggleUnsavedChangesModal: () => {},
            onDisplayMetadataEdit: () => {},
            onResetCurrentMap: () => {}
        };
        const onDisplayMetadataEditSpy = expect.spyOn(actions, 'onDisplayMetadataEdit');
        const onToggleUnsavedChangesModalSpy = expect.spyOn(actions, 'onToggleUnsavedChangesModal');
        const onResetCurrentMapSpy = expect.spyOn(actions, 'onResetCurrentMap');

        const metadataModal = ReactDOM.render(
            <MetadataModal
                show
                useModal
                map={{showUnsavedChanges: true}}
                id="MetadataModal"
                onDisplayMetadataEdit={actions.onDisplayMetadataEdit}
                onResetCurrentMap={actions.onResetCurrentMap}
                detailsSheetActions={{onToggleUnsavedChangesModal: actions.onToggleUnsavedChangesModal}}
            />, document.getElementById("container"));
        expect(metadataModal).toExist();
        const unsavedChangesDialog = document.querySelector('.modal-dialog');
        const unsavedChangesDialogBody = document.querySelector('.modal-dialog .modal-body');
        let buttons = document.querySelectorAll('button');
        expect(unsavedChangesDialog).toExist();
        expect(unsavedChangesDialogBody).toExist();
        expect(unsavedChangesDialogBody.children[0].innerText).toBe("map.details.fieldsChanged");
        expect(unsavedChangesDialogBody.children[2].innerText).toBe("map.details.sureToClose");
        expect(buttons.length).toBe(3);
        let closeBtn = buttons[1];
        let cancelBtn = buttons[2];
        expect(closeBtn.innerText).toBe("saveDialog.close");
        expect(cancelBtn.innerText).toBe("saveDialog.cancel");
        ReactTestUtils.Simulate.click(closeBtn);

        expect(onResetCurrentMapSpy).toHaveBeenCalled();
        expect(onDisplayMetadataEditSpy).toNotHaveBeenCalled();
        expect(onToggleUnsavedChangesModalSpy).toNotHaveBeenCalled();
    });

    it('showing unsaved changes modal and without closing the modal', () => {
        const actions = {
            onToggleUnsavedChangesModal: () => {},
            onDisplayMetadataEdit: () => {},
            onResetCurrentMap: () => {}
        };
        const onDisplayMetadataEditSpy = expect.spyOn(actions, 'onDisplayMetadataEdit');
        const onToggleUnsavedChangesModalSpy = expect.spyOn(actions, 'onToggleUnsavedChangesModal');
        const onResetCurrentMapSpy = expect.spyOn(actions, 'onResetCurrentMap');

        const metadataModal = ReactDOM.render(
            <MetadataModal
                show
                useModal
                map={{showUnsavedChanges: true}}
                id="MetadataModal"
                onDisplayMetadataEdit={actions.onDisplayMetadataEdit}
                onResetCurrentMap={actions.onResetCurrentMap}
                detailsSheetActions={{onToggleUnsavedChangesModal: actions.onToggleUnsavedChangesModal}}
            />, document.getElementById("container"));
        expect(metadataModal).toExist();
        const unsavedChangesDialog = document.querySelector('.modal-dialog');
        const unsavedChangesDialogBody = document.querySelector('.modal-dialog .modal-body');
        let buttons = document.querySelectorAll('button');
        expect(unsavedChangesDialog).toExist();
        expect(unsavedChangesDialogBody).toExist();
        expect(unsavedChangesDialogBody.children[0].innerText).toBe("map.details.fieldsChanged");
        expect(unsavedChangesDialogBody.children[2].innerText).toBe("map.details.sureToClose");
        expect(buttons.length).toBe(3);
        let closeBtn = buttons[1];
        let cancelBtn = buttons[2];
        expect(closeBtn.innerText).toBe("saveDialog.close");
        expect(cancelBtn.innerText).toBe("saveDialog.cancel");
        ReactTestUtils.Simulate.click(cancelBtn);

        expect(onResetCurrentMapSpy).toNotHaveBeenCalled();
        expect(onDisplayMetadataEditSpy).toHaveBeenCalled();
        expect(onToggleUnsavedChangesModalSpy).toHaveBeenCalled();
    });
});
