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
import FocusMask from '../FocusMask';


const containerHTML = `<div id="container" style="position: fixed; top:0px; bottom:0px; left:0px; right:0px">
<div id="test_1" style="position: absolute; top: 0px; left: 0px; width: 200px; height: 200px"></div>
<div id="test_2" style="position: absolute; top: 300px; left: 0px; width: 200px; height: 200px"/></div>
<div id="mask"></div>
</div>'`;
describe("FocusMask component", () => {
    beforeEach((done) => {
        document.body.innerHTML = containerHTML;
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a mask without holes ', () => {
        const cmp = ReactDOM.render(<FocusMask/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates a mask with one holes ', () => {
        const cmp = ReactDOM.render(<FocusMask targets={[{selector: "#test_1"}]}/>, document.getElementById("mask"));
        expect(cmp).toExist();
        const div1 = document.elementFromPoint(100, 100);
        expect(div1.id).toBe("test_1");
        const div2 = document.elementFromPoint(100, 400);
        expect(div2.id).toNotBe("test_2");
    });

    it('creates a mask with tow holes one passing event the other not ', () => {
        const cmp = ReactDOM.render(<FocusMask targets={[{selector: "#test_1", stopEventsOnTarget: true}, {selector: "#test_2"}]}/>, document.getElementById("mask"));
        expect(cmp).toExist();
        const div1 = document.elementFromPoint(100, 100);
        expect(div1.id).toNotBe("test_1");
        const div2 = document.elementFromPoint(100, 400);
        expect(div2.id).toBe("test_2");
    });

});
