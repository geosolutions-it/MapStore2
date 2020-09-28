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

import DetailsSheet from '../DetailsSheet';

describe('DetailsSheet component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DetailsSheet with show and buttons test', () => {
        const handlers = {
            onClose: () => {},
            onSave: () => {}
        };

        const onCloseSpy = expect.spyOn(handlers, 'onClose');
        const onSaveSpy = expect.spyOn(handlers, 'onSave');

        ReactDOM.render(<DetailsSheet show onClose={handlers.onClose} onSave={handlers.onSave}><div id="ms-details-editor"/></DetailsSheet>, document.getElementById('container'));

        const detailsEditor = document.getElementById('ms-details-editor');
        expect(detailsEditor).toExist();
        const buttons = document.querySelectorAll('.modal-footer .btn-group button');
        expect(buttons.length).toBe(2);
        TestUtils.Simulate.click(buttons[0]);
        expect(onCloseSpy).toHaveBeenCalled();
        TestUtils.Simulate.click(buttons[1]);
        expect(onSaveSpy).toHaveBeenCalled();
    });
    it('DetailsSheet readOnly', () => {
        ReactDOM.render(<DetailsSheet show readOnly/>, document.getElementById('container'));
        const buttons = document.querySelectorAll('.modal-footer .btn-group button');
        expect(buttons.length).toBe(0);
    });
});
