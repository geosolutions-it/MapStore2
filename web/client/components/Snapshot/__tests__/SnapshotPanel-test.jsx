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
var SnapshotPanel = require('../SnapshotPanel');

describe("test the SnapshotPanel", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        const tb = ReactDOM.render(<SnapshotPanel />, document.getElementById("container"));
        expect(tb).toExist();

    });

    it('test component to draw snapshot img', () => {
        // layers={props.layers.flat}
        //             browser={props.browser}
        //             key="snapshotPanel"
        //             snapshot={props.snapshot}
        //             onStatusChange={props.changeSnapshotState}
        //             icon={<SnapshotIcon status={props.snapshot.state}/>}
        //             downloadImg={props.postCanvas}
        const snapstate = {
            state: "READY",
            img: {
                data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAA",
                width: 20,
                height: 20,
                size: 20
            }
        };
        const tb = ReactDOM.render(<SnapshotPanel snapshot={snapstate} />, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        const img = tbNode.getElementsByTagName('img');
        expect(img.length).toBe(1);
        expect(img[0].src === snapstate.img.data).toBe(true);

    });

    it('test component save button', () => {
        // layers={props.layers.flat}
        //             browser={props.browser}
        //             key="snapshotPanel"
        //             snapshot={props.snapshot}
        //             onStatusChange={props.changeSnapshotState}
        //             icon={<SnapshotIcon status={props.snapshot.state}/>}
        //             downloadImg={props.postCanvas}
        const snapstate = {
            state: "READY",
            img: {
                data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAA",
                width: 20,
                height: 20,
                size: 20
            }
        };
        const tb = ReactDOM.render(<SnapshotPanel snapshot={snapstate} browser={{ie: true}}/>, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        const btn = tbNode.getElementsByTagName('button');
        expect(btn.length).toBe(1);
    });
});
