/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import colors from './ExtendColorBrewer';
import Message from '../../I18N/Message';

/**
 * @name ColorRampItem
 * @description Simple component to display color label
 */
const ColorRampItem = ({ item }) => {
    let ramp = item && (item.ramp || colors[item.name] && colors[item.name][5]) || [];
    return (
        <div className="color-ramp-item">
            {ramp.map(cell => <div className="color-cell" key={item && item.name + "-" + cell} style={{ backgroundColor: cell }} />)}
            <div className="colorname-cell">
                {item && ( item.label || item.name )
                    ? <Message msgId={ item.label || item.name} msgParams={{ number: ramp.length }} />
                    : item}
            </div>
        </div>
    );
};

ColorRampItem.propTypes = {
    item: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default ColorRampItem;
