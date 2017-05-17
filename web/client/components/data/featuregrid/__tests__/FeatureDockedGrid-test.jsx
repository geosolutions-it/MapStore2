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
const FeatureDockedGrid = require('../FeatureDockedGrid');

const state = {
    columns: [
    {
        key: 'id',
        name: 'id',
        resizable: true
    }, {
        key: 'name',
        name: 'nome livello',
        resizable: true
    }],
    features: [{
        id: "1",
        name: "Edifici"
    }, {
        id: "2",
        name: "Aiuola"
    }, {
        id: "3",
        name: "Edifici"
    }, {
        id: "4",
        name: "Aiuola"
    }, {
        id: "5",
        name: "Edifici"
    }, {
        id: "6",
        name: "Aiuola"
    }, {
        id: "7",
        name: "Edifici"
    }, {
        id: "8",
        name: "Aiuola"
    }, {
        id: "9",
        name: "Edifici"
    }, {
        id: "10",
        name: "Aiuola"
    }, {
        id: "11",
        name: "Edifici"
    }, {
        id: "12",
        name: "Aiuola"
    }, {
        id: "13",
        name: "Edifici"
    }, {
        id: "14",
        name: "Aiuola"
    }, {
        id: "15",
        name: "extra 15"
    }, {
        id: "16",
        name: "extra 16"
    }],
    open: true,
    selectBy: {
        keys: {
            rowKey: '',
            values: []
        }
    }
    };

const defaultProps = {
    rowsCount: state.features.length,
    minHeight: 250,
    minWidth: 600,
    size: 0.3,
    position: "bottom",
    columns: state.columns,
    selectBy: state.selectBy,
    rows: state.features
};
describe("Test FeatureDockedGrid Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test FeatureDockedGrid rendering without tools', () => {
        let comp = ReactDOM.render(
            <FeatureDockedGrid
                {...defaultProps}
                />, document.getElementById("container"));
        expect(comp).toExist();
        let btns = document.getElementsByTagName("button");
        expect(btns.length).toBe(2);
    });
    it('Test FeatureDockedGrid rendering with 1 added tool', () => {
        let comp = ReactDOM.render(
            <FeatureDockedGrid
                {...defaultProps}
                toolbar={{zoom: true}}
                />, document.getElementById("container"));
        expect(comp).toExist();
        let btns = document.getElementsByTagName("button");
        expect(btns.length).toBe(3);
    });
    it('Test FeatureDockedGrid re-rendering for entering in the componentWillReceiveProps', () => {
        let comp = ReactDOM.render(
            <FeatureDockedGrid
                {...defaultProps}
                />, document.getElementById("container"));
        expect(comp).toExist();
        let comp2 = ReactDOM.render(
            <FeatureDockedGrid
                {...defaultProps}
                position="right"
                size={0.1}
                />, document.getElementById("container"));
        expect(comp2).toExist();

        let btns = document.getElementsByTagName("button");
        expect(btns.length).toBe(2);
    });

});
