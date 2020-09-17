/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Media from '../index';
import {MediaTypes} from '../../../../utils/GeoStoryUtils';

describe('Media component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render IMAGE media viewer', () => {
        ReactDOM.render(<Media type={MediaTypes.IMAGE} />, document.getElementById("container"));
        let container = document.getElementById('container');
        expect(container.querySelector('.ms-media-image')).toBeTruthy();
    });
    it('should render MAP media viewer', () => {
        ReactDOM.render(<Media type={MediaTypes.MAP} />, document.getElementById("container"));
        let container = document.getElementById('container');
        expect(container.querySelector('.ms-media-map')).toBeTruthy();
    });
    it('should render VIDEO media viewer', () => {
        ReactDOM.render(<Media type={MediaTypes.VIDEO} />, document.getElementById("container"));
        let container = document.getElementById('container');
        expect(container.querySelector('.ms-media-video')).toBeTruthy();
    });
});
