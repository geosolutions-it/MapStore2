/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { act } from 'react-dom/test-utils';

import ResourceAbout from '../ResourceAbout';
import { DETAILS_DATA_KEY } from '../../../../utils/GeostoreUtils';

const makeStore = (resource) => createStore(combineReducers({
    resourcesselected: () => ({ initialSelectedResource: resource })
}));

describe('ResourceAbout — DOMPurify sanitization (SM-09 / X-04)', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('strips <script> in resource about HTML', () => {
        window.__xss_about = undefined;
        const resource = { attributes: { [DETAILS_DATA_KEY]: '<p>ok</p><script>window.__xss_about=true</script>' } };
        ReactDOM.render(
            <Provider store={makeStore(resource)}>
                <ResourceAbout resource={resource} />
            </Provider>,
            document.getElementById('container')
        );
        expect(window.__xss_about).toBe(undefined);
        expect(document.body.innerHTML.indexOf('<script')).toBe(-1);
    });

    it('preserves safe formatting HTML', () => {
        const resource = { attributes: { [DETAILS_DATA_KEY]: '<p><b>about text</b></p>' } };
        act(() => {
            ReactDOM.render(
                <Provider store={makeStore(resource)}>
                    <ResourceAbout resource={resource} />
                </Provider>,
                document.getElementById('container')
            );
        });
        expect(document.querySelector('b')).toBeTruthy();
    });
});
