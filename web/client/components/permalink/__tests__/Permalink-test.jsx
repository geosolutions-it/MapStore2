/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import Permalink from '../Permalink';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

describe('Permalink tests', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the component with defaults', () => {
        ReactDOM.render(<Permalink />, document.getElementById("container"));
        expect(document.getElementById('permalink')).toBeTruthy();
    });
    it('test form fields of the component', () => {
        ReactDOM.render(<Permalink />, document.getElementById("container"));
        expect(document.getElementById('permalink')).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(1);
    });
    it('test onSave of Permalink', () => {
        const actions = {
            onSave: () => {}
        };

        const onSaveSpy = expect.spyOn(actions, 'onSave');
        ReactDOM.render(<Permalink onSave={actions.onSave} shareUrl="#/viewer/22" settings={{title: "name"}} />, document.getElementById("container"));
        expect(document.getElementById('permalink')).toBeTruthy();
        const button = document.querySelector('button');
        TestUtils.Simulate.click(button);
        expect(onSaveSpy).toHaveBeenCalled();
        const args = onSaveSpy.calls[0].arguments[0];
        expect(args.permalinkType).toBe('map');
        expect(args.resource.category).toBe('PERMALINK');
        expect(args.resource.attributes).toBeTruthy();
        expect(args.resource.attributes.pathTemplate).toBe("/viewer/${id}");
    });
    it('test onSave of Permalink - context', () => {
        const actions = {
            onSave: () => {}
        };

        const onSaveSpy = expect.spyOn(actions, 'onSave');
        ReactDOM.render(<Permalink onSave={actions.onSave} shareUrl="#/context/22" settings={{title: "name"}} />, document.getElementById("container"));
        expect(document.getElementById('permalink')).toBeTruthy();
        const button = document.querySelector('button');
        TestUtils.Simulate.click(button);
        expect(onSaveSpy).toHaveBeenCalled();
        const args = onSaveSpy.calls[0].arguments[0];
        expect(args.permalinkType).toBe('context');
        expect(args.resource.category).toBe('PERMALINK');
        expect(args.resource.attributes).toBeTruthy();
        expect(args.resource.attributes.pathTemplate).toBe("/context/${name}");
    });
    it('test show permalink link panel', () => {
        ReactDOM.render(<Permalink shareUrl="#/viewer/22" settings={{id: 1}} />, document.getElementById("container"));
        expect(document.getElementById('permalink')).toBeTruthy();
        expect(document.getElementsByClassName('qr-code')[0]).toBeTruthy();
    });
});
