/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { set, compose } from '../utils/ImmutableUtils';
import { SHOW, HIDE, SELECTED } from '../actions/mediaEditor';

const DEFAULT_STATE = {
    open: true,
    settings: {
        sources: {
            // for each media type
            image: {
                // list the services to use (remote services like geostore, and others like Imgur)
                services: [ // TODO, this have to be configurable, with some default service
                    {
                    id: "ID", // must have an Id to identify the source
                    title: "local resources",
                    type: "local",
                    stateLocation: "geostory.resources"
                }]
            }/*,
            video: {

            }
            map: {
                service
            }
            */
        }
    }
};

export default (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case SHOW:
            return compose(
                    set('open', true),
                    set('owner', action.owner),
                    set('settings', action.settings || state.settings), // TODO: allow fine customization
                    set('stashedSettings', state.settings)
                )(state);
        case HIDE:
        case SELECTED:
            return compose(
                set('open', false),
                set('owner', undefined),
                set('settings', state.stashedSettings || state.settings ), // restore defaults
                set('stashedSettings', undefined)
            );

        default:
            return state;
    }
};
