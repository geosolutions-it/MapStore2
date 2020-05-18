/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import MapTemplates from '../MapTemplates';
import { getPluginForTest } from './pluginsTestUtils';

describe('MapTemplates Plugins', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('shows MapTemplates not loaded', () => {
        const { Plugin } = getPluginForTest(MapTemplates, {
            controls: {
                mapTemplates: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-side-panel')[0]).toExist();
        expect(document.getElementsByClassName('map-templates-loader')[0]).toExist();
        expect(document.getElementsByClassName('map-templates-panel')[0]).toNotExist();
    });
    it('shows MapTemplates loaded', () => {
        const { Plugin } = getPluginForTest(MapTemplates, {
            controls: {
                mapTemplates: {
                    enabled: true
                }
            },
            maptemplates: {
                mapTemplatesLoaded: true
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-side-panel')[0]).toExist();
        expect(document.getElementsByClassName('map-templates-loader')[0]).toNotExist();
        expect(document.getElementsByClassName('map-templates-panel')[0]).toExist();
    });
    it('MapTemplatesPanel with template with format', () => {
        const template = {
            id: 1,
            format: 'wmc'
        };
        const { Plugin } = getPluginForTest(MapTemplates, {
            controls: {
                mapTemplates: {
                    enabled: true
                }
            },
            maptemplates: {
                mapTemplatesLoaded: true,
                templates: [template]
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        const sideCards = document.getElementsByClassName('mapstore-side-card');
        expect(sideCards.length).toBe(1);
        const formatIcon = document.getElementsByClassName('glyphicon-ext-wmc')[0];
        expect(formatIcon).toExist();
    });
    it('MapTemplatesPanel with favourite template with format', () => {
        const template = {
            id: 1,
            format: 'wmc',
            favourite: true,
            name: 'Map Template',
            description: 'This is a map template.'
        };
        const { Plugin } = getPluginForTest(MapTemplates, {
            controls: {
                mapTemplates: {
                    enabled: true
                }
            },
            maptemplates: {
                mapTemplatesLoaded: true,
                templates: [template]
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        const sideCards = document.getElementsByClassName('mapstore-side-card');
        expect(sideCards.length).toBe(2);
        const formatIcons = document.getElementsByClassName('glyphicon-ext-wmc');
        expect(formatIcons.length).toBe(2);
        const favouriteIcon = document.getElementsByClassName('glyphicon-star');
        expect(favouriteIcon).toExist();
        const favouriteIconEmpty = document.getElementsByClassName('glyphicon-star-empty');
        expect(favouriteIconEmpty).toExist();
        const favouriteCard = document.querySelector('.mapstore-side-card.ms-sm');
        expect(favouriteCard).toExist();
        const leftContainer = favouriteCard.getElementsByClassName('mapstore-side-card-left-container')[0];
        expect(leftContainer).toExist();
        const leftContainerStyle = getComputedStyle(leftContainer);
        expect(leftContainerStyle).toExist();
        expect(leftContainerStyle["flex-direction"]).toBe('row');
    });
});
