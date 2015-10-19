/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var MousePosition = require('../MousePosition');

describe('CRSSelector', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks enabled', () => {
        const cmp = React.render(<MousePosition enabled={true} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.id).toExist();
    });

    it('checks disabled', () => {
        const cmp = React.render(<MousePosition enabled={false} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toNotExist();
    });

    it('checks no position', () => {
        const cmp = React.render(<MousePosition enabled={true}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toNotExist();
    });

    it('checks default templates degrees', () => {
        const cmp = React.render(<MousePosition enabled={true} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('Lat:');
        expect(cmpDom.innerHTML).toContain('Lng:');
    });

    it('checks default templates meters', () => {
        const cmp = React.render(<MousePosition enabled={true} crs="EPSG:3857" mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('Y:');
        expect(cmpDom.innerHTML).toContain('X:');
    });

    it('checks custom template', () => {
        let Template = React.createClass({
            propTypes: {
                position: React.PropTypes.object
            },
            render() {
                return <div>{this.props.position.lng},{this.props.position.lat}</div>;
            }
        });
        const cmp = React.render(<MousePosition degreesTemplate={Template} enabled={true} mousePosition={{x: 11, y: 12, crs: "EPSG:4326"}}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('11');
        expect(cmpDom.innerHTML).toContain('12');
    });
});
