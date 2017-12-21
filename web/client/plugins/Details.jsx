/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {mapFromIdSelector} = require('../selectors/maps');
const {mapIdSelector, mapInfoDetailsUriFromIdSelector} = require('../selectors/map');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const {currentMapDetailsTextSelector} = require('../selectors/currentmap');
const {openDetailsPanel, closeDetailsPanel} = require("../actions/maps");
const {get} = require("lodash");

/**
 * Details plugin used for fetching details of the map
 * @class
 * @memberof plugins
 */

module.exports = {
    DetailsPlugin: connect((state) => ({
        active: get(state, "controls.details.enabled"),
        map: mapFromIdSelector(state, mapIdSelector(state)),
        dockStyle: mapLayoutValuesSelector(state, {height: true}),
        detailsText: currentMapDetailsTextSelector(state)
    }), {
        onClose: closeDetailsPanel
    })(assign(require('../components/details/DetailsPanel'), {
        BurgerMenu: {
            name: 'details',
            position: 1000,
            text: <Message msgId="details.title"/>,
            icon: <Glyphicon glyph="sheet"/>,
            action: openDetailsPanel,
            selector: (state) => {
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                if (detailsUri) {
                    return {};
                }
                return { style: {display: "none"} };
            }
        }
    }))

};
