/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { getTotalMaxResults, defaultSearchWrapper } from "../SearchBarUtils";

describe('SearchBarUtils', () => {
    it('test the maxFeatures function', () => {
        const services = [
            {
                priority: 5,
                type: "nomination"
            },
            {
                type: "wfs",
                name: "Meteorites",
                displayName: "${properties,name}",
                options: {
                    maxFeatures: 20,
                    srsName: "EPSG:4326"
                },
                launchInfoPanel: "single_layer"
            },
            {
                type: "wfs",
                name: "Meteorites",
                displayName: "${properties,name}",
                options: {
                    maxFeatures: undefined,
                    srsName: "EPSG:4328"
                },
                launchInfoPanel: "single_layer"
            }
        ];

        expect(getTotalMaxResults(services)).toBe(50);
    });
    it('maxFeatures with no services', () => {
        expect(getTotalMaxResults()).toBe(15);
    });
    it('defaultSearchWrapper with text', () => {
        const handlers = {
            onSearchReset: () => {},
            onSearch: () => {}
        };

        const searchResetSpy = expect.spyOn(handlers, 'onSearchReset');
        const searchSpy = expect.spyOn(handlers, 'onSearch');

        const wrapper = defaultSearchWrapper({searchText: 'text', onSearch: handlers.onSearch, onSearchReset: handlers.onSearchReset});
        wrapper();

        expect(searchResetSpy).toNotHaveBeenCalled();
        expect(searchSpy).toHaveBeenCalled();
        expect(searchSpy.calls.length).toBe(1);
        expect(searchSpy.calls[0].arguments[0]).toBe('text');
        expect(searchSpy.calls[0].arguments[1]).toNotExist();
        expect(searchSpy.calls[0].arguments[2]).toBe(15);
    });
});
