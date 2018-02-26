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
        const metadataModalItem = ReactDOM.render(<MetadataModal show={false}/>, document.getElementById("container"));
        expect(metadataModalItem).toExist();

        const metadataModalItemDom = ReactDOM.findDOMNode(metadataModalItem);
        expect(metadataModalItemDom).toNotExist();

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

});
