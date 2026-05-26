/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import WMSDomainAliases from '../WMSDomainAliases';

// Internal debounce in the component is 300ms; tests wait a bit longer.
const DEBOUNCE_WAIT = 350;

describe('WMSDomainAliases component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('emits an array (not an object) when no aliases exist initially', (done) => {
        const onChangeServiceProperty = expect.createSpy();
        ReactDOM.render(
            <WMSDomainAliases service={{ type: 'wms', url: '' }} onChangeServiceProperty={onChangeServiceProperty} />,
            document.getElementById('container')
        );
        setTimeout(() => {
            try {
                expect(onChangeServiceProperty.calls.length).toBeGreaterThan(0);
                const [property, value] = onChangeServiceProperty.calls[0].arguments;
                expect(property).toBe('domainAliases');
                expect(Array.isArray(value)).toBe(true);
                expect(value).toEqual([]);
                done();
            } catch (e) { done(e); }
        }, DEBOUNCE_WAIT);
    });

    it('emits an array of typed values after the user edits the first row', (done) => {
        const onChangeServiceProperty = expect.createSpy();
        ReactDOM.render(
            <WMSDomainAliases service={{ type: 'wms', url: '' }} onChangeServiceProperty={onChangeServiceProperty} />,
            document.getElementById('container')
        );
        const input = document.querySelector('#alias-0');
        expect(input).toExist();
        TestUtils.Simulate.change(input, { target: { value: 'http://alias-a' } });
        setTimeout(() => {
            try {
                const lastCall = onChangeServiceProperty.calls[onChangeServiceProperty.calls.length - 1];
                expect(lastCall.arguments[0]).toBe('domainAliases');
                expect(Array.isArray(lastCall.arguments[1])).toBe(true);
                expect(lastCall.arguments[1]).toEqual(['http://alias-a']);
                done();
            } catch (e) { done(e); }
        }, DEBOUNCE_WAIT);
    });

    it('starts from a pre-existing array of aliases and emits an array after edits', (done) => {
        const onChangeServiceProperty = expect.createSpy();
        ReactDOM.render(
            <WMSDomainAliases
                service={{ type: 'wms', url: '', domainAliases: ['http://existing'] }}
                onChangeServiceProperty={onChangeServiceProperty}
            />,
            document.getElementById('container')
        );
        const input = document.querySelector('#alias-0');
        expect(input).toExist();
        expect(input.value).toBe('http://existing');
        TestUtils.Simulate.change(input, { target: { value: 'http://updated' } });
        setTimeout(() => {
            try {
                const lastCall = onChangeServiceProperty.calls[onChangeServiceProperty.calls.length - 1];
                expect(Array.isArray(lastCall.arguments[1])).toBe(true);
                expect(lastCall.arguments[1]).toEqual(['http://updated']);
                done();
            } catch (e) { done(e); }
        }, DEBOUNCE_WAIT);
    });
});
