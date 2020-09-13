/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import {Provider} from 'react-redux';
import MediaModal from '../MediaModal';

describe('MediaModal component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div><div id="myContainer"></div></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("myContainer"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MediaModal rendering with defaults', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({mediaEditor: {open: true}})}}>
                <MediaModal open/>
            </Provider>, document.getElementById("myContainer")
        );
        const myContainer = document.getElementById("myContainer");
        expect(myContainer.querySelector('.modal-fixed')).toNotExist();
        expect(document.querySelector('.modal-fixed')).toExist();

    });
    describe('tests disabled state of apply button', () => {
        it('when no item is selected', () => {
            ReactDOM.render(
                <Provider store={{subscribe: () => {}, getState: () => ({mediaEditor: {open: true}})}}>
                    <MediaModal open selectedItem={null}/>
                </Provider>, document.getElementById("myContainer"));
            const buttons = document.querySelectorAll("button");
            expect(buttons.length).toBe(4);
            const applyBtn = buttons[3];
            expect(applyBtn.disabled).toBe(false);
        });
        it('when is adding a new resource', () => {
            ReactDOM.render(
                <Provider store={{subscribe: () => {}, getState: () => ({mediaEditor: {open: true}})}}>
                    <MediaModal open adding/>
                </Provider>, document.getElementById("myContainer"));
            const buttons = document.querySelectorAll("button");
            expect(buttons.length).toBe(4);
            const applyBtn = buttons[3];
            expect(applyBtn.disabled).toBe(true);
        });
        it('when is editing a resource', () => {
            ReactDOM.render(
                <Provider store={{subscribe: () => {}, getState: () => ({mediaEditor: {open: true}})}}>
                    <MediaModal open editing/>
                </Provider>, document.getElementById("myContainer"));
            const buttons = document.querySelectorAll("button");
            expect(buttons.length).toBe(4);
            const applyBtn = buttons[3];
            expect(applyBtn.disabled).toBe(true);
        });
    });
});

