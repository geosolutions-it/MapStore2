/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';

import Dialog from '../Dialog';

describe('Dialog component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders with defaults', () => {
        ReactDOM.render(<Dialog id="dialog-test" />, document.getElementById('container'));
        const dialog = document.getElementById('dialog-test');
        expect(dialog).toExist();

        const container = document.querySelector('.modal-dialog-container');
        expect(container).toExist();
        expect(container.className).toInclude('modal-dialog modal-content');
        expect(container.className).toInclude('modal-dialog-draggable');
    });

    it('renders with modal', () => {
        ReactDOM.render(<Dialog id="dialog-test" modal />, document.getElementById('container'));
        const modal = document.querySelector('.modal');
        expect(modal).toExist();
        expect(modal.className).toInclude('fade in modal');

        const dialog = document.getElementById('dialog-test');
        expect(dialog).toExist();
    });

    it('renders roles (header, body, footer)', () => {
        ReactDOM.render(
            <Dialog id="dialog-test">
                <div role="header"><span className="test-header">Header</span></div>
                <div role="body"><span className="test-body">Body</span></div>
                <div role="footer"><span className="test-footer">Footer</span></div>
            </Dialog>,
            document.getElementById('container')
        );

        const header = document.querySelector('.modal-header .test-header');
        expect(header).toExist();

        const body = document.querySelector('.modal-body .test-body');
        expect(body).toExist();

        const footer = document.querySelector('.modal-footer .test-footer');
        expect(footer).toExist();
    });

    it('renders without draggable', () => {
        ReactDOM.render(<Dialog id="dialog-test" draggable={false} />, document.getElementById('container'));
        const dialog = document.getElementById('dialog-test');
        expect(dialog).toExist();
        expect(dialog.className.indexOf('modal-dialog-draggable')).toBe(-1);
    });

    it('renders with maskLoading', () => {
        ReactDOM.render(
            <Dialog id="dialog-test" maskLoading>
                <div role="body">Body</div>
            </Dialog>,
            document.getElementById('container')
        );

        const spinner = document.querySelector('.spinner');
        expect(spinner).toExist();
    });

    it('triggers onClickOut when clicking on the mask', () => {
        const actions = {
            onClickOut: () => {}
        };
        const spy = expect.spyOn(actions, 'onClickOut');

        ReactDOM.render(
            <Dialog id="dialog-test" modal onClickOut={actions.onClickOut} />,
            document.getElementById('container')
        );

        const modal = document.querySelector('.modal');
        expect(modal).toExist();

        ReactTestUtils.Simulate.click(modal);

        expect(spy).toHaveBeenCalled();
    });

    it('does not trigger onClickOut when clicking inside the dialog', () => {
        const actions = {
            onClickOut: () => {}
        };
        const spy = expect.spyOn(actions, 'onClickOut');

        ReactDOM.render(
            <Dialog id="dialog-test" modal onClickOut={actions.onClickOut}>
                <div role="body"><button id="inner-button">Click</button></div>
            </Dialog>,
            document.getElementById('container')
        );

        const modal = document.querySelector('.modal');
        expect(modal).toExist();

        const innerButton = document.getElementById('inner-button');
        expect(innerButton).toExist();

        ReactTestUtils.Simulate.click(innerButton);

        expect(spy).toNotHaveBeenCalled();
    });
});
