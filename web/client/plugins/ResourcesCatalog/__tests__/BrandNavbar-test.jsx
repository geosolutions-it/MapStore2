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
import BrandNavbarPlugin from '../BrandNavbar';
import { getPluginForTest } from '../../__tests__/pluginsTestUtils';

const leftMenuItems = [
    {
        type: 'link',
        href: '/always-visible',
        labelId: 'alwaysVisible'
    },
    {
        type: 'link',
        href: '/disabled-item',
        labelId: 'disabledItem',
        enabled: false
    },
    {
        type: 'link',
        href: '/editors-only',
        labelId: 'editorsOnly',
        enabled: "{includes(state('usergroups'), 'editor')}"
    }
];

describe('BrandNavbar plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('shows items without an enabled property', () => {
        const { Plugin } = getPluginForTest(BrandNavbarPlugin, {});
        ReactDOM.render(<Plugin cfg={{ leftMenuItems }} leftMenuItems={leftMenuItems} />, document.getElementById('container'));
        expect(document.querySelector('a[href="/always-visible"]')).toBeTruthy();
    });
    it('hides items with enabled: false', () => {
        const { Plugin } = getPluginForTest(BrandNavbarPlugin, {});
        ReactDOM.render(<Plugin leftMenuItems={leftMenuItems} />, document.getElementById('container'));
        expect(document.querySelector('a[href="/disabled-item"]')).toBeFalsy();
    });
    it('hides items whose enabled expression resolves to false', () => {
        const { Plugin } = getPluginForTest(BrandNavbarPlugin, {});
        ReactDOM.render(<Plugin leftMenuItems={leftMenuItems} />, document.getElementById('container'));
        expect(document.querySelector('a[href="/editors-only"]')).toBeFalsy();
    });
    it('shows items whose enabled expression resolves to true against usergroups state', () => {
        const storeState = {
            security: {
                user: {
                    groups: {
                        group: [{ groupName: 'editor', enabled: true }]
                    }
                }
            }
        };
        const { Plugin } = getPluginForTest(BrandNavbarPlugin, storeState);
        ReactDOM.render(<Plugin leftMenuItems={leftMenuItems} />, document.getElementById('container'));
        expect(document.querySelector('a[href="/editors-only"]')).toBeTruthy();
    });
});
