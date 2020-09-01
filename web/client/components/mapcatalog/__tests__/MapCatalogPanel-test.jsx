/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ReactTestUtils from 'react-dom/test-utils';
import { compose, withContext } from 'recompose';
import PropTypes from 'prop-types';
import MapCatalogPanel from '../MapCatalogPanel';

describe('MapCatalogPanel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('MapCatalogPanel with defaults', () => {
        ReactDOM.render(<MapCatalogPanel/>, document.getElementById('container'));
        const rootDiv = document.getElementsByClassName('map-catalog-panel')[0];
        expect(rootDiv).toExist();
    });

    it('MapCatalogPanel with items reload', () => {
        const items = [{
            "canDelete": true,
            "canEdit": true,
            "canCopy": true,
            "creation": "2017-07-12 10:32:04.96",
            "lastUpdate": "2017-11-22 12:37:25.102",
            "description": "This data is derived from OSM, and used in OGC Testbed 13 for experimental purposes only",
            "id": 2698,
            "name": "OGC Testbed 13 - Daraa", "owner": "Gnafu",
            "thumbnail": "rest/geostore/data/22582/raw?decode=datauri",
            "contextName": null},
        {
            "canDelete": true,
            "canEdit": true,
            "canCopy": true,
            "creation": "2020-06-29 17:47:18.654",
            "description": "",
            "id": 26658,
            "name": "test_positioning",
            "owner": "admin",
            "context": "26466",
            "contextName": "plui_advanced"
        }];
        const routerMock = {
            "history": {
                "length": 17,
                "action": "POP",
                "location": {
                    "pathname": "/context/plui_advanced/26658",
                    "search": "",
                    "hash": ""
                }
            }
        };
        const actions = {
            reloadFunction: () => {
            }
        };
        const spyonReload = expect.spyOn(actions, 'reloadFunction');

        const Provider = compose(
            withContext({ router: PropTypes.object }, () => ({ router: routerMock }))
        )(MapCatalogPanel);

        ReactDOM.render(<Provider items={items} reloadFunction={actions.reloadFunction}/>, document.getElementById('container'));
        const renderedItems = document.querySelectorAll('.mapstore-side-card');
        ReactTestUtils.Simulate.click(renderedItems[1]);
        expect(spyonReload).toHaveBeenCalled();
    });
});
