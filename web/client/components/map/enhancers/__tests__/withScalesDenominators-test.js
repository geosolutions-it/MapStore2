
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
import withScalesDenominators from '../withScalesDenominators';
import { getResolutionsForScales } from '../../../../utils/MapUtils';

function MockApp({ map }) {

    return (
        <div className="MockApp">
            <ul> { map.mapOptions.view.resolutions.map((res) => <li key={res}>{res}</li>) } </ul>
        </div>
    );

}
export default MockApp;

const mapMockConf = { mapOptions: { view: { scales: [ 50000, 25000, 10000 ] } }};
const resolutions = getResolutionsForScales(mapMockConf.mapOptions.view.scales, 'EPSG:3857');
let MockComp = withScalesDenominators(MockApp);

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
        ReactDOM.render(<MockComp map={mapMockConf} />
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.MockApp');
        expect(el).toExist();
    });


    it('Test component props', () => {
        ReactDOM.render(<MockComp map={mapMockConf} />, document.getElementById("container"));
        const el = document.getElementsByClassName('MockApp');
        expect(el).toExist();
        const text = el[0].childNodes[0];
        expect(text).toExist();
        expect(text.childNodes[1].innerHTML).toBe('' + resolutions[0]);
        expect(text.childNodes[2].innerHTML).toBe('' + resolutions[1]);
        expect(text.childNodes[3].innerHTML).toBe('' + resolutions[2]);

    });


});
