/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import MapViewSettings from '../MapViewSettings';
import expect from 'expect';
import { ViewSettingsTypes } from '../../../utils/MapViewsUtils';

describe('MapViewSettings component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<MapViewSettings />, document.getElementById("container"));
        const settingsNode = document.querySelector('.ms-map-views-settings');
        expect(settingsNode).toBeTruthy();
    });
    it('should list sections based on configuration', () => {
        ReactDOM.render(<MapViewSettings
            api={{
                options: {
                    settings: [
                        ViewSettingsTypes.DESCRIPTION,
                        ViewSettingsTypes.POSITION,
                        ViewSettingsTypes.ANIMATION,
                        ViewSettingsTypes.MASK,
                        ViewSettingsTypes.GLOBE_TRANSLUCENCY,
                        ViewSettingsTypes.LAYERS_OPTIONS
                    ]
                }
            }}
        />, document.getElementById("container"));
        const settingsNode = document.querySelector('.ms-map-views-settings');
        expect(settingsNode).toBeTruthy();
        const sectionNodes = document.querySelectorAll('.ms-map-views-section');
        expect(sectionNodes.length).toBe(6);
    });
});
