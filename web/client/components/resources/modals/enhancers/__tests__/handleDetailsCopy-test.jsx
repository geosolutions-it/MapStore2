/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import { createSink, setObservableConfig } from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';

import handleDetailsCopy from '../handleDetailsCopy';

setObservableConfig(rxjsConfig);

describe('handleDetailsCopy enhancer', () => {
    let mockAxios;

    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('details are loaded', done => {
        const res = {
            id: 10,
            name: 'test resource'
        };
        const Sink = handleDetailsCopy(createSink(props => {
            if (!props.loading) {
                try {
                    expect(props.linkedResources).toExist();
                    expect(props.linkedResources.details).toExist();
                    expect(props.linkedResources.details.category).toBe('DETAILS');
                    expect(props.linkedResources.details.data).toBe('details data');
                } catch (e) {
                    done(e);
                }
                done();
            }
        }));

        mockAxios.onGet('/rest/geostore/data/1000').reply(200, 'details data');

        ReactDOM.render(<Sink loading resource={res} detailsData="rest/geostore/data/1000"/>, document.getElementById('container'));
    });

    it('detailsData doesnt exist', done => {
        const res = {
            id: 10,
            name: 'test resource'
        };
        const Sink = handleDetailsCopy(createSink(props => {
            expect(props.linkedResources).toNotExist();
            done();
        }));

        ReactDOM.render(<Sink loading resource={res}/>, document.getElementById('container'));
    });
});
