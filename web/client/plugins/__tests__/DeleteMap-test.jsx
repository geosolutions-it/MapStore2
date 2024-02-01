/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import { getPluginForTest } from './pluginsTestUtils';

import DeleteMap from '../DeleteMap';

describe('DeleteMap plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('DeleteMap with defaults', () => {
        const { Plugin } = getPluginForTest(DeleteMap, {
            controls: {
                mapDelete: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById('container'));
        const rootDiv = document.getElementById('confirm-dialog');
        expect(rootDiv).toExist();
    });
    it('DeleteMap plugin outside of context', () => {
        const { Plugin, containers } = getPluginForTest(DeleteMap, {
            controls: {
                mapDelete: {
                    enabled: true
                }
            },
            map: {
                present: {
                    info: undefined
                }
            }
        });
        // check container for sidebar menu
        expect(Object.keys(containers)).toContain('SidebarMenu');
        // render component
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        //
        const rootDiv = document.getElementById('confirm-dialog');
        expect(rootDiv).toExist();

        expect(document.getElementsByClassName('modal-fixed').length).toBe(0);
        // hide if you view the plugin outside of context
        expect(containers.SidebarMenu.selector().style.display ).toBe("none");
    });
    it('DeleteMap plugin within context view', () => {
        const { Plugin, containers } = getPluginForTest(DeleteMap, {
            controls: {
                mapDelete: {
                    enabled: true
                }
            },
            map: {
                present: {
                    info: 18
                }
            }
        });
        // check container for sidebar menu
        expect(Object.keys(containers)).toContain('SidebarMenu');
        // render component
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        //
        const rootDiv = document.getElementById('confirm-dialog');
        expect(rootDiv).toExist();

        expect(document.getElementsByClassName('modal-fixed').length).toBe(0);
        // show if you view the plugin inside of context
        expect(containers.SidebarMenu.selector({ map: { present: { info: 18 } } }).style?.display ).toNotExist();
    });
});
