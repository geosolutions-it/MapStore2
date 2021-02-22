
/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import mapResolutionsFromScales from '../mapResolutionsFromScales';

class MockApp extends React.Component {
    render() {
        return (
            <p className="MockApp">
          Hello from your Mock App
            </p>
        );
    }
}

let MockComp = mapResolutionsFromScales({component: MockApp});

describe('Test get resolutions from scales', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('componets is rendered', () => {
        ReactDOM.render(<MockComp />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.MockApp');
        expect(el).toExist();
    });

});
