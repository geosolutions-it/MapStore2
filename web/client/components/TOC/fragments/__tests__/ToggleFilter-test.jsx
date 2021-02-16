/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ToggleFilter from '../ToggleFilter';
import ReactDOM from 'react-dom';
import expect from 'expect';
import * as TestUtils from 'react-dom/test-utils';

describe('Test Toggle filter', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    let node = {
        "layerFilter": {
            "searchUrl": null,
            "featureTypeConfigUrl": null,
            "showGeneratedFilter": false,
            "attributePanelExpanded": true,
            "spatialPanelExpanded": true,
            "crossLayerExpanded": true,
            "showDetailsPanel": false,
            "groupLevels": 5,
            "useMapProjection": false,
            "toolbarEnabled": true,
            "groupFields": [
                {
                    "id": 1,
                    "logic": "OR",
                    "index": 0
                }
            ],
            "maxFeaturesWPS": 5,
            "filterFields": [
                {
                    "rowId": 1613414722261,
                    "groupId": 1,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Arizona",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "loading": false,
                    "openAutocompleteMenu": false,
                    "options": {
                        "STATE_NAME": []
                    }
                }
            ],
            "spatialField": {
                "method": null,
                "operation": "INTERSECTS",
                "geometry": null,
                "attribute": "the_geom"
            },
            "simpleFilterFields": [],
            "crossLayerFilter": null,
            "autocompleteEnabled": true
        }
    };

    it('render component', () => {
        const tf = ReactDOM.render(
            <ToggleFilter node={node} propertiesChangeHandler={() => {}} />,
            document.getElementById("container"));
        expect(tf).toExist();
        const tfNode = ReactDOM.findDOMNode(tf);
        expect(tfNode.className.indexOf('toc-filter-icon') >= 0).toBe(true);
    });

    it('test click handler', () => {
        const propertiesChangeHandler = {
            callBack: () => {}
        };
        const propertiesChangeHandlerSpy = expect.spyOn(propertiesChangeHandler, 'callBack');
        const tf = ReactDOM.render(
            <ToggleFilter node={node}
                propertiesChangeHandler={propertiesChangeHandler.callBack} />,
            document.getElementById("container"));
        expect(tf).toExist();

        const tfNode = ReactDOM.findDOMNode(tf);
        TestUtils.Simulate.click(tfNode);
        expect(propertiesChangeHandlerSpy).toHaveBeenCalled();

    });

});
