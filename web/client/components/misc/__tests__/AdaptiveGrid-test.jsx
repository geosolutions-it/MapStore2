/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require("react");
const expect = require('expect');
const ReactDOM = require('react-dom');
const AdaptiveGrid = require('../AdaptiveGrid');

let rows = [];
for (let i = 1; i < 3; i++) {
    rows.push({
        id: i,
        title: 'Title ' + i,
        count: i * 1
    });
}
const defaultProps = {
    columns: [
        { key: 'id', name: 'ID' },
        { key: 'title', name: 'Title' },
        { key: 'count', name: 'Count' } ],
    minHeight: 200,
    rowGetter: i => rows[i],
    rowsCount: 2
};
describe("Test AdaptiveGrid Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div style="width: 200px; height: 200px" id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test AdaptiveGrid rendering', () => {
        ReactDOM.render(
            <AdaptiveGrid
                {...defaultProps}
            />, document.getElementById("container"));

        const domComp = document.getElementsByClassName('react-grid-Container')[0];
        expect(domComp).toExist();
        const rect = domComp.getBoundingClientRect();
        expect(rect).toExist();
        expect(rect.width).toBe(200);
    });
});
