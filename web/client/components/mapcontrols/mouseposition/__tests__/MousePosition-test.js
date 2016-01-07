/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var ReactDOM = require('react-dom');
var MousePosition = require('../MousePosition');

describe('MousePosition', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks enabled', () => {
        const cmp = ReactDOM.render(<MousePosition enabled={true} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.id).toExist();
    });

    it('checks disabled', () => {
        const cmp = ReactDOM.render(<MousePosition enabled={false} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toNotExist();
    });

    it('checks no position', () => {
        const cmp = ReactDOM.render(<MousePosition enabled={true}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toNotExist();
    });

    it('checks default templates degrees', () => {
        const cmp = ReactDOM.render(<MousePosition enabled={true} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('Lat:');
        expect(cmpDom.innerHTML).toContain('Lng:');
    });

    it('checks default templates meters', () => {
        const cmp = ReactDOM.render(<MousePosition enabled={true} crs="EPSG:3857" mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
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
        const cmp = ReactDOM.render(<MousePosition degreesTemplate={Template} enabled={true} mousePosition={{x: 11, y: 12, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('11');
        expect(cmpDom.innerHTML).toContain('12');
    });
});
