/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const RulesGrid = require('../RulesGrid');


describe('Test RulesGrid component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div style="width: 100px; height: 100px" id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<RulesGrid rowGetter={() => {}} rowsCount={0} width={100} height={100}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
        const grid = container.querySelector(".react-grid-Container");
        expect(grid).toExist();
    });
});
