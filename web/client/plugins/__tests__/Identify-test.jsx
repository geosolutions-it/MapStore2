/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import { getPluginForTest } from './pluginsTestUtils';
import Identify from "../Identify";

describe('Identify Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });
    it('Expect Identify side panel to not exist if Identify is absent', () => {
        const identifyContainer = document.getElementById('identify-container');
        expect(identifyContainer).toNotExist();
    });
    it('Expect Identify side panel to exist', () => {
        const { Plugin } = getPluginForTest(Identify, {
            controls: {
                info: {
                    available: true
                }
            }
        });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const identifyContainer = document.getElementById('identify-container');
        expect(identifyContainer).toExist();
    });

});
