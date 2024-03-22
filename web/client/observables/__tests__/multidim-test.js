/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MockAdapter from "axios-mock-adapter";
import axios from "../../libs/ajax";
import {
    multidimOptionsSelectorCreator,
    selectedLayerName,
    selectedLayerSelector,
    selectedLayerUrl,
    snapTypeSelector
} from "../../selectors/timeline";
import {playbackRangeSelector, statusSelector} from "../../selectors/playback";
import {STATUS} from "../../actions/playback";
import DOMAIN_INTERVAL_VALUES_RESPONSE from 'raw-loader!../../test-resources/wmts/DomainIntervalValues.xml';
import {getNearestTimesObservable} from "../multidim";
import {currentTimeSelector} from "../../selectors/dimension";
import expect from "expect";

const ANIMATION_MOCK_STATE = {
    dimension: {
        currentTime: '2016-09-05T00:00:00.000Z'
    },
    layers: {
        flat: [
            {
                id: 'playback:selected_layer',
                name: 'playback_layer',
                dimensions: [
                    {
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'MOCK_DOMAIN_VALUES'
                        }
                    }
                ],
                visibility: true
            }
        ]
    },
    timeline: {
        selectedLayer: 'playback:selected_layer'
    }
};

describe('multidim Observables', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    const domainArgs = (getState, paginationOptions) => {
        const id = selectedLayerSelector(getState());
        const layerName = selectedLayerName(getState());
        const layerUrl = selectedLayerUrl(getState());
        const { startPlaybackTime, endPlaybackTime } = playbackRangeSelector(getState()) || {};
        const shouldFilter = statusSelector(getState()) === STATUS.PLAY || statusSelector(getState()) === STATUS.PAUSE;
        const fromEnd = snapTypeSelector(getState()) === 'end';
        return [layerUrl, layerName, "time", {
            limit: 20, // default, can be overridden by pagination options
            time: startPlaybackTime && endPlaybackTime && shouldFilter ? `${startPlaybackTime}/${endPlaybackTime}` : undefined,
            fromEnd,
            ...paginationOptions
        },
        multidimOptionsSelectorCreator(id)(getState())
        ];
    };


    it('test getNearestTimesObservable', (done) => {
        const time = currentTimeSelector(ANIMATION_MOCK_STATE);
        let ascCount = 0;
        let descCount = 0;
        mock.onGet('MOCK_DOMAIN_VALUES').reply(({params}) => {
            expect(params).toExist();
            expect(params.limit).toBe(1);
            const {sort, fromValue } = params;
            if (sort === 'asc') {
                expect(fromValue < time).toBeTruthy(); // check buffer is applied
                ascCount++;
                return [200, DOMAIN_INTERVAL_VALUES_RESPONSE];
            } else if (sort === 'desc') {
                expect(fromValue > time).toBeTruthy(); // check buffer is applied
                descCount++;
                return [200, DOMAIN_INTERVAL_VALUES_RESPONSE];
            }
            return [200, DOMAIN_INTERVAL_VALUES_RESPONSE];
        });

        const snapType = snapTypeSelector(() => ANIMATION_MOCK_STATE);
        getNearestTimesObservable(domainArgs, true, () => ANIMATION_MOCK_STATE, snapType, time).subscribe(args => {
            expect(args[0]).toBe('2021-09-08T22:00:00.000Z/2021-10-21T22:00:00.000Z');
            expect(args[1]).toBe('2021-09-08T22:00:00.000Z/2021-10-21T22:00:00.000Z');
            expect(ascCount).toBe(1); // asc should be called only once
            expect(descCount).toBe(1); // desc should be called only once
            done();
        });
    });
});
