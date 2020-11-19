

/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

// dependencies
import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';
import ReactTestUtils from 'react-dom/test-utils';
import handleMapRemoveLayer from '../handleMapRemoveLayer';
const CMP = handleMapRemoveLayer((props) => <button id="CMP" onClick={() => props.onRemoveSelected()} />);

describe('handleMapRemoveLayer enhancer', function() {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('layer remove must also unselect the layers by triggering onNodeSelect', () => {
        const lib = {
            onNodeSelect() { }
        };
        const spyReset = expect.spyOn(lib, 'onNodeSelect');
        ReactDOM.render(<CMP selectedLayers={['layer 1']} onNodeSelect={lib.onNodeSelect} />, document.getElementById("container"));
        const el = document.querySelector('#CMP');
        ReactTestUtils.Simulate.click(el);
        expect(spyReset).toHaveBeenCalled();
    });
});
