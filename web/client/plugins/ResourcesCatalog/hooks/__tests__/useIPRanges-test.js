/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useIPRanges from '../useIPRanges';
import expect from 'expect';
import { act, Simulate } from 'react-dom/test-utils';
import GeoStoreDAO from '../../../../api/GeoStoreDAO';

const Component = ({ onLoaded, query = '', page = 1, pageSize = 10 }) => {
    const { request } = useIPRanges();
    return (
        <div>
            <button id="fetch" onClick={() => {
                request({ q: query, page, pageSize }).then(onLoaded);
            }}>Fetch</button>
        </div>
    );
};

describe('useIPRanges', () => {
    let getIPRangesSpy;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        getIPRangesSpy = expect.spyOn(GeoStoreDAO, 'getIPRanges');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        if (getIPRangesSpy) {
            getIPRangesSpy.restore();
        }
        setTimeout(done);
    });

    it('should fetch IP ranges on first request call', (done) => {
        const mockIPRanges = {
            IPRangeList: {
                IPRange: [
                    { cidr: '192.168.1.0/24', description: 'Test Range 1' },
                    { cidr: '10.0.0.0/8', description: 'Test Range 2' }
                ]
            }
        };

        getIPRangesSpy.andReturn(Promise.resolve(mockIPRanges));

        act(() => {
            ReactDOM.render(<Component onLoaded={(result) => {
                expect(result.ips.length).toBe(2);
                expect(result.ips[0].cidr).toBe('192.168.1.0/24');
                expect(getIPRangesSpy.calls.length).toBe(1);
                done();
            }} />, document.getElementById("container"));
        });

        Simulate.click(document.querySelector('#fetch'));
    });

    it('should filter IP ranges by search query', (done) => {
        const mockIPRanges = {
            IPRangeList: {
                IPRange: [
                    { cidr: '192.168.1.0/24', description: 'Office Network' },
                    { cidr: '10.0.0.0/8', description: 'VPN Range' },
                    { cidr: '172.16.0.0/12', description: 'Office Backup' }
                ]
            }
        };

        getIPRangesSpy.andReturn(Promise.resolve(mockIPRanges));

        act(() => {
            ReactDOM.render(<Component
                query="office"
                onLoaded={(result) => {
                    expect(result.ips.length).toBe(2);
                    expect(result.ips[0].cidr).toBe('192.168.1.0/24');
                    expect(result.ips[1].cidr).toBe('172.16.0.0/12');
                    done();
                }}
            />, document.getElementById("container"));
        });

        Simulate.click(document.querySelector('#fetch'));
    });

});
