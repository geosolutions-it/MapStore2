/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { waitFor } from '@testing-library/react';
import { createStore, combineReducers } from 'redux';

import ResourceAbout from '../ResourceAbout';
import { DETAILS_DATA_KEY } from '../../../../utils/GeostoreUtils';

const getStore = (resource) => createStore(combineReducers({
    resourcesselected: () => ({ initialSelectedResource: resource })
}));

const renderResourceAbout = (resource) => ReactDOM.render(
    <Provider store={getStore(resource)}>
        <ResourceAbout resource={resource} />
    </Provider>,
    document.getElementById('container')
);

describe('ResourceAbout container', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    describe('sanitization', () => {
        it('removes script tags from the about content', () => {
            window.__resourceAboutScript = undefined;
            renderResourceAbout({ attributes: { [DETAILS_DATA_KEY]: '<p>content</p><script>window.__resourceAboutScript = true</script>' } });
            expect(window.__resourceAboutScript).toBe(undefined);
            expect(document.getElementById('container').innerHTML.indexOf('<script')).toBe(-1);
        });
        it('keeps the formatting tags of the about content', (done) => {
            renderResourceAbout({ attributes: { [DETAILS_DATA_KEY]: '<p><b>bold</b></p>' } });
            waitFor(() => expect(document.querySelector('b')).toBeTruthy())
                .then(() => done())
                .catch(done);
        });
    });
});
