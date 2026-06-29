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

import mapLayerSelector from '../mapLayerSelector';
import { EDITOR_CHANGE } from '../../../../actions/widgets';

describe('mapLayerSelector enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('injects onLayerChoice that dispatches an editor change and sets the display name', () => {
        const dispatched = [];
        const store = {
            subscribe: () => () => {},
            getState: () => ({}),
            dispatch: (a) => dispatched.push(a)
        };
        const Sink = ({ onLayerChoice }) => {
            onLayerChoice('filter-add', [{ id: 'l1' }]);
            return <div className="ms-sink" />;
        };
        const Enhanced = mapLayerSelector(Sink);
        expect(Enhanced.displayName).toBe('MapCatalogLayerSelector');
        ReactDOM.render(
            <Provider store={store}><Enhanced /></Provider>,
            document.getElementById('container')
        );
        expect(dispatched.length).toBe(1);
        expect(dispatched[0].type).toBe(EDITOR_CHANGE);
        expect(dispatched[0].key).toBe('filter-add');
    });
});
