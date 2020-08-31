/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const assign = require('object-assign');
const expect = require('expect');
const {loadPage, updateItemsLifecycle} = require('../featuredMaps');

const GeoStoreDAO = require('../../../../api/GeoStoreDAO');
const oldAddBaseUri = GeoStoreDAO.addBaseUrl;

describe('featuredMaps enhancher', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        GeoStoreDAO.addBaseUrl = oldAddBaseUri;
        setTimeout(done);
    });
    it('loadPage fails ', done => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return assign(options, {baseURL: 'wrong/geostore/'});
        };
        const props = loadPage();
        props.subscribe(res => {
            expect(res).toEqual({ items: [], total: 0, loading: false });
            done();
        });
    });

    it('loadPage success', done => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return assign(options, {baseURL: 'base/web/client/test-resources/geostore/'});
        };
        const props = loadPage({permission: true});
        props.subscribe(res => {
            expect(res).toEqual({
                items: [{
                    id: 2,
                    name: 'Map',
                    category: {
                        id: 1,
                        name: "MAP"
                    },
                    icon: "1-map",
                    canCopy: true,
                    canDelete: true,
                    canEdit: true,
                    creation: '2017-11-10T14:26:34.167+01:00',
                    description: 'Map',
                    details: 'somedetailspath',
                    lastUpdate: '2018-02-12T11:42:31.676+01:00',
                    contextName: null,
                    thumbnail: "pathtothumbnail",
                    owner: 'admin',
                    featured: 'added',
                    featuredEnabled: true
                },
                {
                    id: 3,
                    name: 'a context',
                    category: {
                        id: 2,
                        name: "CONTEXT"
                    },
                    icon: null,
                    canCopy: true,
                    canDelete: true,
                    canEdit: true,
                    creation: '2017-11-10T14:26:34.167+01:00',
                    description: 'a context',
                    lastUpdate: '2018-02-12T11:42:31.676+01:00',
                    context: "context_id",
                    contextName: null,
                    thumbnail: "pathtothumbnail",
                    owner: 'admin',
                    featured: 'added',
                    featuredEnabled: true
                }],
                total: 2,
                loading: false
            });
            done();
        });
    });

    it('updateItemsLifecycle verify previews items and view size changes', () => {

        const CMP = updateItemsLifecycle(({items, previousItems, viewSize = 4}) =>
            <div id="CMP">
                <span className="previous-items-count">{previousItems.length}</span>
                <span className="items-count">{items.length}</span>
                <span className="view-size">{viewSize}</span>
            </div>
        );

        const handlers = {
            enableFeaturedMaps: () => {}
        };

        const spy = expect.spyOn(handlers, 'enableFeaturedMaps');

        ReactDOM.render(<CMP items={[]} enableFeaturedMaps={handlers.enableFeaturedMaps} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toExist();

        let previousItemsCount = el.querySelector('.previous-items-count');
        expect(previousItemsCount.innerHTML).toBe('0');
        let itemsCount = el.querySelector('.items-count');
        expect(itemsCount.innerHTML).toBe('0');
        let viewSize = el.querySelector('.view-size');
        expect(viewSize.innerHTML).toBe('4');


        ReactDOM.render(<CMP items={[0, 1, 2, 3, 4, 5]} enableFeaturedMaps={handlers.enableFeaturedMaps} />, document.getElementById("container"));
        previousItemsCount = el.querySelector('.previous-items-count');
        expect(previousItemsCount.innerHTML).toBe('0');
        itemsCount = el.querySelector('.items-count');
        expect(itemsCount.innerHTML).toBe('6');
        viewSize = el.querySelector('.view-size');
        expect(viewSize.innerHTML).toBe('8');

        ReactDOM.render(<CMP items={[0]} enableFeaturedMaps={handlers.enableFeaturedMaps} />, document.getElementById("container"));
        previousItemsCount = el.querySelector('.previous-items-count');
        expect(previousItemsCount.innerHTML).toBe('6');
        itemsCount = el.querySelector('.items-count');
        expect(itemsCount.innerHTML).toBe('1');
        viewSize = el.querySelector('.view-size');
        expect(viewSize.innerHTML).toBe('4');

        expect(spy.calls.length).toEqual(0);
    });

});
