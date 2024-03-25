/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import ContextMenu from '../ContextMenu';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import { StatusTypes } from '../../utils/TOCUtils';
import { NodeTypes } from '../../../../utils/LayersUtils';

const items = [
    { Component: ({ status }) => <div className="check-status">{status}</div>, name: 'CheckStatus' }
];

describe('ContextMenu', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        act(() => {
            ReactDOM.render(<ContextMenu/>, document.getElementById("container"));
        });
        expect(document.querySelector('.ms-context-menu').style.display).toBe('none');
    });

    it('should show list of items', () => {
        const node = {
            id: 'l001',
            title: 'layer001',
            name: 'layer001name',
            bbox: {
                bounds: {
                    maxx: 10,
                    maxy: 9,
                    minx: -10,
                    miny: -9
                }, crs: 'EPSG:4326'
            },
            search: {
                url: 'l001url'
            }
        };
        act(() => {
            ReactDOM.render(<ContextMenu show items={items} value={{ id: node.id, type: NodeTypes.LAYER, node }}/>, document.getElementById("container"));
        });
        expect(document.querySelector('.ms-context-menu').style.display).toBe('flex');
        expect(document.querySelector('.check-status').innerText).toBe(StatusTypes.LAYER);
    });
});
