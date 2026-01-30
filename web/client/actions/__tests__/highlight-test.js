/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    HIGHLIGHT_STATUS,
    highlightStatus,
    UPDATE_HIGHLIGHTED,
    updateHighlighted,
    SET_HIGHLIGHT_FEATURES_PATH,
    setHighlightFeaturesPath
} from '../highlight';

describe('Test correctness of the highlight actions', () => {

    it('highlightStatus', () => {
        let status = "enabled";

        let retval = highlightStatus(status);

        expect(retval).toExist();
        expect(retval.type).toBe(HIGHLIGHT_STATUS);
        expect(retval.status).toBe("enabled");
    });
    it('setHighlightFeaturesPath', () => {
        let path = "my.path";

        let retval = setHighlightFeaturesPath(path);

        expect(retval).toExist();
        expect(retval.type).toBe(SET_HIGHLIGHT_FEATURES_PATH);
        expect(retval.featuresPath).toBe(path);
        expect(retval.highlightStyle).toEqual({});
    });

    it('setHighlightFeaturesPath with customized highlight style', () => {
        let path = "my.path";
        let style = {color: 'yellow'};

        let retval = setHighlightFeaturesPath(path, style);

        expect(retval).toExist();
        expect(retval.type).toBe(SET_HIGHLIGHT_FEATURES_PATH);
        expect(retval.featuresPath).toBe(path);
        expect(retval.highlightStyle).toBe(style);
    });

    it('updateHighlighted', () => {
        let features = ["One", "Two"];

        let retval = updateHighlighted(features, 'update');

        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_HIGHLIGHTED);
        expect(retval.features).toBe(features);
        expect(retval.status).toBe('update');

    });
});
