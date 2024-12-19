/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import usePluginItems from "../usePluginItems";
import { act } from 'react-dom/test-utils';

describe('usePluginItems', () => {
    const Component = ({ items = [] }) => {
        const configuredItems = usePluginItems({
            items,
            loadedPlugins: {}
        });
        return <div id="component">{configuredItems.map(({ name }) => name).join(',')}</div>;
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should reload the list of confiugred items if they change', () => {
        const plugin01 = {
            name: 'Plugin01',
            Component: () => null,
            position: 1
        };
        const plugin02 = {
            name: 'Plugin02',
            Component: () => null,
            position: 2
        };
        act(() => {
            ReactDOM.render(<Component items={[plugin01, plugin02]}/>, document.getElementById('container'));
        });

        expect(document.querySelector('#component').innerText).toBe('Plugin01,Plugin02');

        act(() => {
            ReactDOM.render(<Component items={[plugin01]}/>, document.getElementById('container'));
        });

        expect(document.querySelector('#component').innerText).toBe('Plugin01');
    });
});
