/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react/addons');
var WMSLegend = require('../WMSLegend');

var expect = require('expect');

describe('test WMSLegend module component', () => {

    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests WMSLegend component creation', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = React.render(<WMSLegend node={l} />, document.body);

        const domNode = React.findDOMNode(comp);
        expect(domNode).toExist();

        const image = domNode.getElementsByTagName('img');
        expect(image).toExist();
        expect(image.length).toBe(1);
    });
});
