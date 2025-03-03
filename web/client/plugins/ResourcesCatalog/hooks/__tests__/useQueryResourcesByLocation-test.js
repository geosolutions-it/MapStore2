/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import useQueryResourcesByLocation from '../useQueryResourcesByLocation';
import expect from 'expect';
import { act, Simulate } from 'react-dom/test-utils';

const Component = ({ searchParams, ...props}) => {
    const {
        search,
        clear
    } = useQueryResourcesByLocation(props);
    return (
        <div>
            <button id="search" onClick={() => search(searchParams)}/>
            <button id="clear" onClick={() => clear()}/>
        </div>
    );
};

describe('useQueryResourcesByLocation', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should request resources on mount', (done) => {
        ReactDOM.render(<Component
            id="catalog"
            pageSize={12}
            request={({ params }) => {
                try {
                    expect(params).toEqual({ customFilters: undefined, pageSize: 12 });
                } catch (e) {
                    done(e);
                }
                return Promise.resolve({
                    resources: []
                });
            }}
            setResources={(resources, id) => {
                expect(resources).toEqual([]);
                expect(id).toBe('catalog');
                done();
            }}
            location={{
                pathname: '/',
                search: '',
                hash: ''
            }}
        />, document.getElementById("container"));
    });

    it('should request resources when location is changing', (done) => {
        let count = 0;
        act(() => {
            ReactDOM.render(<Component
                id="catalog"
                pageSize={12}
                request={() => {
                    return Promise.resolve({
                        resources: []
                    });
                }}
                setResources={() => {
                    count += 1;
                }}
                location={{
                    pathname: '/',
                    search: '',
                    hash: ''
                }}
            />, document.getElementById("container"));
        });

        act(() => {
            ReactDOM.render(<Component
                id="catalog"
                pageSize={12}
                setResources={() => {
                    count += 1;
                }}
                location={{
                    pathname: '/',
                    search: '',
                    hash: ''
                }}
            />, document.getElementById("container"));
        });
        act(() => {
            ReactDOM.render(<Component
                id="catalog"
                pageSize={12}
                request={() => {
                    return Promise.resolve({
                        resources: []
                    });
                }}
                setResources={() => {
                    count += 1;
                    expect(count).toBe(2);
                    done();
                }}
                location={{
                    pathname: '/',
                    search: '?f=map',
                    hash: ''
                }}
            />, document.getElementById("container"));
        });
    });
    it('should request resources when user change', (done) => {
        let count = 0;
        act(() => {
            ReactDOM.render(<Component
                id="catalog"
                pageSize={12}
                request={() => {
                    return Promise.resolve({
                        resources: []
                    });
                }}
                setResources={() => {
                    count += 1;
                }}
                location={{
                    pathname: '/',
                    search: '',
                    hash: ''
                }}
            />, document.getElementById("container"));
        });
        act(() => {
            ReactDOM.render(<Component
                id="catalog"
                pageSize={12}
                user={{ username: 'USER' }}
                request={() => {
                    return Promise.resolve({
                        resources: []
                    });
                }}
                setResources={() => {
                    count += 1;
                    expect(count).toBe(2);
                    done();
                }}
                location={{
                    pathname: '/',
                    search: '',
                    hash: ''
                }}
            />, document.getElementById("container"));
        });
    });
    it('should apply default query', (done) => {
        ReactDOM.render(<Component
            id="catalog"
            pageSize={12}
            defaultQuery={{
                f: 'map'
            }}
            request={({ params }) => {
                try {
                    expect(params).toEqual({ f: ['map', 'dashboard'], customFilters: undefined, pageSize: 12 });
                } catch (e) {
                    done(e);
                }
                return Promise.resolve({
                    resources: []
                });
            }}
            setResources={(resources, id) => {
                expect(resources).toEqual([]);
                expect(id).toBe('catalog');
                done();
            }}
            location={{
                pathname: '/',
                search: '?f=dashboard',
                hash: ''
            }}
        />, document.getElementById("container"));
    });
    it('should use the query params page when queryPage is true', (done) => {
        ReactDOM.render(<Component
            id="catalog"
            pageSize={12}
            queryPage
            request={({ params }) => {
                try {
                    expect(params).toEqual({ page: '2', customFilters: undefined, pageSize: 12 });
                } catch (e) {
                    done(e);
                }
                return Promise.resolve({
                    resources: []
                });
            }}
            setResources={(resources, id) => {
                expect(resources).toEqual([]);
                expect(id).toBe('catalog');
                done();
            }}
            location={{
                pathname: '/',
                search: '?page=2',
                hash: ''
            }}
        />, document.getElementById("container"));
    });

    it('should use search method to update the query', (done) => {
        ReactDOM.render(<Component
            id="catalog"
            pageSize={12}
            searchParams={{
                f: 'dashboard'
            }}
            request={() => {
                return Promise.resolve({
                    resources: []
                });
            }}
            location={{
                pathname: '/',
                search: '',
                hash: ''
            }}
            onPush={({ search }) => {
                expect(search).toBe('?f=dashboard');
                done();
            }}
        />, document.getElementById("container"));

        Simulate.click(document.querySelector('#search'));
    });

    it('should use clear method to update clear all the query parameters', (done) => {
        ReactDOM.render(<Component
            id="catalog"
            pageSize={12}
            request={() => {
                return Promise.resolve({
                    resources: []
                });
            }}
            location={{
                pathname: '/',
                search: '/?f=map&f=dashboard',
                hash: ''
            }}
            onPush={({ search }) => {
                expect(search).toBe('');
                done();
            }}
        />, document.getElementById("container"));
        Simulate.click(document.querySelector('#clear'));
    });

    it('should use stored parameter on initialization', (done) => {
        ReactDOM.render(<Component
            id="catalog"
            pageSize={12}
            storedParams={{ f: ['map'] }}
            request={() => {
                return Promise.resolve({
                    resources: []
                });
            }}
            location={{
                pathname: '/',
                search: '/',
                hash: ''
            }}
            onPush={({ search }) => {
                expect(search).toBe('?f=map');
                done();
            }}
        />, document.getElementById("container"));
    });
});
