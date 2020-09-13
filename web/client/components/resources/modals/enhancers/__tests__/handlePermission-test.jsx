/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const { createSink, setObservableConfig } = require('recompose');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);
const expect = require('expect');
const { Promise } = require('es6-promise');


const handlePermission = require('../handlePermission');

describe('handlePermission enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handlePermission rendering with defaults', (done) => {
        const DUMMY_API = {
            getAvailableGroups: () => {
                return new Promise(resolve => resolve([]));
            }
        };
        const Sink = handlePermission(DUMMY_API)(createSink( props => {
            if (props.availableGroups) {
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('Test Sink callback', (done) => {
        const DUMMY_API = {
            getAvailableGroups: () => {
                return new Promise(resolve => resolve([]));
            },
            getResourcePermissions: () => {
                const result = [
                    {
                        "canRead": true,
                        "canWrite": true,
                        "user": {
                            "id": 534,
                            "name": "testuser"
                        }

                    }];

                return new Promise(resolve => resolve(result));
            }
        };

        const Sink = handlePermission(DUMMY_API)(createSink(props => {
            expect(props.onUpdateRules).toBeTruthy(); // check that the handler is present
            if (props.rules && props.rules.length > 0) {
                expect(props.rules.length).toBe(1);
                done();
            }
        }));
        ReactDOM.render(<Sink resource={{id: 1}} />, document.getElementById("container"));
    });
    it('test disablePermission', (done) => {
        const Sink = handlePermission()(createSink( props => {
            expect(props).toExist();
            expect(props.onUpdateRules).toBeFalsy(); // check that the enhancer is not applied at all (verifying one of the properties added by it)
            done();
        }));
        ReactDOM.render(<Sink disablePermission />, document.getElementById("container"));
    });
});
