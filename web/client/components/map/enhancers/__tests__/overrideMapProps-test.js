
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
import overrideMapProps from '../withScalesDenominators';
import mockData from '../../../../test-resources/testConfig.json';
import PropTypes from 'prop-types';

class MockApp extends React.Component {

    static propTypes = {
        zoom: PropTypes.number
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="MockApp">
                <p>{this.props.zoom}</p>
            </div>
        );
    }
}

export default MockApp;

let MockComp = overrideMapProps(MockApp);

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

    it('Test componet is rendered', () => {
        ReactDOM.render(<MockComp />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.MockApp');
        expect(el).toExist();
    });

    it('Test component props', () => {
        ReactDOM.render(<MockComp {...mockData.map} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.MockApp');
        expect(el).toExist();
        const text = document.getElementsByClassName('MockApp')[0].childNodes[0].innerHTML;
        expect(text).toBe('' + mockData.map.zoom);

    });

});
