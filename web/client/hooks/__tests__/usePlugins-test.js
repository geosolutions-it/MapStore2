/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import usePlugins from '../usePlugins';

describe('usePlugins hook', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should configure plugins with Component key', (done) => {

        const TestPluginContainer = (props, context) => {
            const plugins = usePlugins(props, context, []);
            return (
                <div className="test-plugin-container">
                    {plugins.map(({ Component }, idx) => <Component key={idx}/>)}
                </div>
            );
        };

        TestPluginContainer.contextTypes = {
            loadedPlugins: PropTypes.object
        };

        const ITEM_CLASS = 'test-item';
        const ITEMS = [
            {
                name: 'Item',
                cfg: {},
                plugin: () => () => <div className={ITEM_CLASS} />,
                items: []
            }
        ];

        ReactDOM.render(<TestPluginContainer items={ITEMS}/>, document.getElementById('container'));

        setTimeout(() => {
            const testPluginContainerNode = document.querySelector('.test-plugin-container');
            expect(testPluginContainerNode).toExist();
            const itemNode = testPluginContainerNode.querySelector(`.${ITEM_CLASS}`);
            expect(itemNode).toExist();
            done();
        }, 50);

    });

});
