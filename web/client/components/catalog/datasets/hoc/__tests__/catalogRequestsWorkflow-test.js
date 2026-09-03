/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import withCatalogRequests from '../catalogRequestsWorkflow';
import API from '../../../../../api/catalog';

describe('catalogRequestsWorkflow HOC', () => {
    let originalGeonode;
    let capturedArgs;

    const mockGeoNode = () => {
        originalGeonode = API.geonode;
        capturedArgs = null;
        API.geonode = {
            ...originalGeonode,
            textSearch: (...args) => {
                capturedArgs = args;
                return Promise.resolve({ records: [] });
            }
        };
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        if (originalGeonode) {
            API.geonode = originalGeonode;
            originalGeonode = null;
        }
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('constrains the search to the provided resourceTypes', (done) => {
        mockGeoNode();
        let receivedServices;
        const Probe = (props) => {
            receivedServices = props.services;
            return <div />;
        };
        const Wrapped = withCatalogRequests(Probe);
        ReactDOM.render(
            <Wrapped
                services={{ gn: { type: 'geonode', url: 'http://gn', resourceTypes: ['dataset', 'document'] } }}
                selectedService="gn"
                resourceTypes={['dataset']}
            />,
            document.getElementById('container')
        );
        setTimeout(() => {
            try {
                expect(capturedArgs).toExist();
                // 5th textSearch arg is { options: { service } }
                expect(capturedArgs[4].options.service.resourceTypes).toEqual(['dataset']);
                // the child receives the constrained services as well (used by getCapabilities / search)
                expect(receivedServices.gn.resourceTypes).toEqual(['dataset']);
                done();
            } catch (e) {
                done(e);
            }
        }, 0);
    });

    it('does not constrain the service when resourceTypes is not provided', (done) => {
        mockGeoNode();
        const Wrapped = withCatalogRequests(() => <div />);
        ReactDOM.render(
            <Wrapped
                services={{ gn: { type: 'geonode', url: 'http://gn', resourceTypes: ['dataset', 'document'] } }}
                selectedService="gn"
            />,
            document.getElementById('container')
        );
        setTimeout(() => {
            try {
                expect(capturedArgs).toExist();
                expect(capturedArgs[4].options.service.resourceTypes).toEqual(['dataset', 'document']);
                done();
            } catch (e) {
                done(e);
            }
        }, 0);
    });
});
