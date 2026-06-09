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

import WidgetsPlugin from '../Widgets';
import { getPluginForTest } from './pluginsTestUtils';

const customWidget = {
    id: 'custom-widget-test',
    title: 'Custom Widget From Items',
    widgetType: 'custom',
    type: 'custom-type-from-items'
};

describe('Widgets plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders custom widget providers resolved from plugin items', () => {
        const ItemsCustomComponent = ({ title }) => (
            <div className="custom-widget-from-items">{title}</div>
        );
        const { Plugin } = getPluginForTest(
            WidgetsPlugin,
            {
                widgets: {
                    containers: {
                        floating: {
                            widgets: [customWidget]
                        }
                    },
                    builder: {
                        settings: {
                            step: 0
                        }
                    }
                }
            },
            undefined,
            [],
            undefined,
            [],
            {},
            [{
                name: 'ItemsCustomWidget',
                target: 'widget',
                type: 'custom-type-from-items',
                position: 1,
                Component: ItemsCustomComponent
            }]
        );

        ReactDOM.render(<Plugin />, document.getElementById('container'));

        const container = document.getElementById('container');
        expect(container.querySelector('.custom-widget-from-items')).toExist();
        expect(container.querySelector('.custom-widget-from-items').textContent).toBe('Custom Widget From Items');
    });
});
