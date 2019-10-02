/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const wfsChartOptions = require('../wfsChartOptions');
const featureTypeProperties = [
    {
        "name": "Integer",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:int",
        "localType": "int"
    },
    {
        "name": "Long",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:int",
        "localType": "int"
    },
    {
        "name": "Float",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:number",
        "localType": "number"
    },
    {
        "name": "Double_Precision",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:number",
        "localType": "number"
    },
    {
        "name": "Date",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:date",
        "localType": "date"
    },
    {
        "name": "Time",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:time",
        "localType": "time"
    },
    {
        "name": "DateTime",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:date-time",
        "localType": "date-time"
    },
    {
        "name": "String",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "xsd:string",
        "localType": "string"
    },
    {
        "name": "Point",
        "maxOccurs": 1,
        "minOccurs": 0,
        "nillable": true,
        "type": "gml:Point",
        "localType": "Point"
    }
];


describe('wfsChartOptions enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('wfsChartOptions rendering with defaults', (done) => {
        const Sink = wfsChartOptions(createSink( props => {
            expect(props).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    describe('Check data types', () => {
        const checkOptions = (options, check = () => {}, done) => {
            const data = {
                options
            };

            const Sink = wfsChartOptions(createSink(props => {
                check(props);
                done();
            }));
            ReactDOM.render(<Sink data={data} featureTypeProperties={featureTypeProperties} />, document.getElementById("container"));
        };
        it('Integer', (done) => {
            checkOptions({ aggregationAttribute: "Integer" }, props => expect(props.aggregationOptions.length).toBeGreaterThan(1), done);
        });
        it('Long', (done) => {
            checkOptions({ aggregationAttribute: "Long" }, props => expect(props.aggregationOptions.length).toBeGreaterThan(1), done);
        });
        it('Float', (done) => {
            checkOptions({ aggregationAttribute: "Float" }, props => expect(props.aggregationOptions.length).toBeGreaterThan(1), done);
        });
        it('Double Precision', (done) => {
            checkOptions({ aggregationAttribute: "Double_Precision" }, props => expect(props.aggregationOptions.length).toBeGreaterThan(1), done);
        });
        it('String', (done) => {
            checkOptions({ aggregationAttribute: "String" }, props => expect(props.aggregationOptions.length).toBe(1), done);
        });
        it('Time', (done) => {
            checkOptions({ aggregationAttribute: "Time" }, props => expect(props.aggregationOptions.length).toBe(1), done);
        });

        it('Date', (done) => {
            checkOptions({ aggregationAttribute: "Date" }, props => expect(props.aggregationOptions.length).toBe(1), done);
        });

        it('DateTime', (done) => {
            checkOptions({ aggregationAttribute: "DateTime" }, props => expect(props.aggregationOptions.length).toBe(1), done);
        });
    });
});
