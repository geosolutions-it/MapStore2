/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import FlexibleLayoutPlugin from '../FlexibleLayout';
import { getPluginForTest } from './pluginsTestUtils';
import { SET_CONTROL_PROPERTY } from '../../actions/controls';

// styles needed for layout structure
import './flexiblelayout-test-style.less';

describe('FlexibleLayout Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should create plugin with default configuration', () => {
        const { Plugin } = getPluginForTest(FlexibleLayoutPlugin);
        ReactDOM.render(<Plugin />, document.getElementById('container'));
        const loaderPanelNode = document.querySelector('.ms-flexible-layout-loader-panel');
        expect(loaderPanelNode).toExist();
    });

    it('render large layout with default config', () => {
        const { Plugin } = getPluginForTest(FlexibleLayoutPlugin, {
            controls: {
                flexibleLayout: {
                    type: 'lg'
                }
            },
            map: {}
        });
        ReactDOM.render(<Plugin />, document.getElementById('container'));
        const largeLayout = document.querySelector('.ms-flexible-layout.ms-lg');
        expect(largeLayout).toExist();
    });
    it('render medium layout with default config', () => {
        const { Plugin } = getPluginForTest(FlexibleLayoutPlugin, {
            controls: {
                flexibleLayout: {
                    type: 'md'
                }
            },
            map: {}
        });
        ReactDOM.render(<Plugin />, document.getElementById('container'));
        const mediumLayout = document.querySelector('.ms-flexible-layout.ms-md');
        expect(mediumLayout).toExist();
    });
    it('render small layout with default config', () => {
        const { Plugin } = getPluginForTest(FlexibleLayoutPlugin, {
            controls: {
                flexibleLayout: {
                    type: 'sm'
                }
            },
            map: {}
        });
        ReactDOM.render(<Plugin />, document.getElementById('container'));
        const smallLayout = document.querySelector('.ms-flexible-layout.ms-sm');
        expect(smallLayout).toExist();
    });
    it('render item inside layout sections', (done) => {

        const HEADER_ITEM_CLASS = 'test-header';
        const BACKGROUND_ITEM_CLASS = 'test-background';
        const COLUMN_ITEM_CLASS = 'test-column';
        const BODY_ITEM_CLASS = 'test-body';
        const BOTTOM_ITEM_CLASS = 'test-bottom';
        const CENTER_ITEM_CLASS = 'test-center';
        const FOOTER_ITEM_CLASS = 'test-footer';

        const LEFT_MENU_ITEM_CLASS = 'test-left-menu';
        const RIGHT_MENU_ITEM_CLASS = 'test-right-menu';

        const items = [
            {
                name: 'Header',
                container: 'header',
                cfg: {},
                plugin: () => () => <div className={HEADER_ITEM_CLASS} />,
                items: []
            },
            {
                name: 'Background',
                container: 'background',
                cfg: {},
                plugin: () => () => <div className={BACKGROUND_ITEM_CLASS} />,
                items: []
            },
            {
                name: 'Column',
                container: 'column',
                cfg: {},
                plugin: () => () => <div className={COLUMN_ITEM_CLASS} />,
                items: []
            },
            {
                name: 'Body',
                container: 'body',
                cfg: {},
                plugin: () => () => <div className={BODY_ITEM_CLASS}/>,
                items: []
            },
            {
                name: 'Bottom',
                container: 'bottom',
                cfg: {},
                plugin: () => () => <div className={BOTTOM_ITEM_CLASS} />,
                items: []
            },
            {
                name: 'Center',
                container: 'center',
                cfg: {},
                plugin: () => () => <div className={CENTER_ITEM_CLASS} />,
                items: []
            },
            {
                name: 'Footer',
                container: 'footer',
                cfg: {},
                plugin: () => () => <div className={FOOTER_ITEM_CLASS} />,
                items: []
            },

            {
                name: 'LeftMenu',
                container: 'left-menu',
                glyph: 'left-menu',
                position: 1,
                size: 300,
                tooltipId: 'leftMenuTooltip',
                cfg: {},
                plugin: () => () => <div className={LEFT_MENU_ITEM_CLASS} />,
                items: []
            },
            {
                name: 'RightMenu',
                container: 'right-menu',
                glyph: 'right-menu',
                position: 1,
                size: 'auto',
                tooltipId: 'rightMenuTooltip',
                alwaysRendered: true,
                cfg: {},
                plugin: () => () => <div className={RIGHT_MENU_ITEM_CLASS} />,
                items: []
            }
        ];
        const { Plugin, actions } = getPluginForTest(FlexibleLayoutPlugin, {
            controls: {
                flexibleLayout: {
                    type: 'lg'
                }
            },
            map: {}
        });
        ReactDOM.render(<div style={{ position: 'absolute', width: 1920, height: 1080 }}><Plugin items={items}/></div>, document.getElementById('container'));
        const largeLayout = document.querySelector('.ms-flexible-layout.ms-lg');
        expect(largeLayout).toExist();
        setTimeout(() => {
            try {
                const headerItemNode = largeLayout.querySelector(`.${HEADER_ITEM_CLASS}`);
                expect(headerItemNode).toExist();

                const backgroundItemNode = largeLayout.querySelector(`.${BACKGROUND_ITEM_CLASS}`);
                expect(backgroundItemNode).toExist();

                const columnItemNode = largeLayout.querySelector(`.${COLUMN_ITEM_CLASS}`);
                expect(columnItemNode).toExist();

                const bodyItemNode = largeLayout.querySelector(`.${BODY_ITEM_CLASS}`);
                expect(bodyItemNode).toExist();

                const bottomItemNode = largeLayout.querySelector(`.${BOTTOM_ITEM_CLASS}`);
                expect(bottomItemNode).toExist();

                const centerItemNode = largeLayout.querySelector(`.${CENTER_ITEM_CLASS}`);
                expect(centerItemNode).toExist();

                const footerItemNode = largeLayout.querySelector(`.${FOOTER_ITEM_CLASS}`);
                expect(footerItemNode).toExist();

                const leftMenuItemNode = largeLayout.querySelector(`.${LEFT_MENU_ITEM_CLASS}`);
                expect(leftMenuItemNode).toBe(null);

                const rightMenuItemNode = largeLayout.querySelector(`.${RIGHT_MENU_ITEM_CLASS}`);
                expect(rightMenuItemNode).toExist();

                const menuButtons = largeLayout.querySelectorAll('.ms-menu-btn');
                expect(menuButtons.length).toBe(2);

                const [
                    leftMenuButton,
                    rightMenuButton
                ] = menuButtons;
                expect(leftMenuButton.querySelector('.glyphicon-left-menu')).toExist();
                expect(rightMenuButton.querySelector('.glyphicon-right-menu')).toExist();

                const [
                    initLayoutStructureAction
                ] = actions;
                expect(initLayoutStructureAction.type).toBe(SET_CONTROL_PROPERTY);
                expect(initLayoutStructureAction.control).toBe('flexibleLayout');
                expect(initLayoutStructureAction.property).toBe('structure');
            } catch (e) {
                done(e);
            }
            done();
        }, 100);
    });

});
