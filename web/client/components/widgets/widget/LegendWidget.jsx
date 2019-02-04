/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetContainer = require('./WidgetContainer');
const emptyLegendState = require('../enhancers/emptyLegendState');
const InfoPopover = require('./InfoPopover');

const LegendView = emptyLegendState()(require('./LegendView'));
const renderHeaderLeftTopItem = ({ title, description } = {}) => {
    return description ? <InfoPopover placement="top" title={title} text={description} /> : null;
};

module.exports = ({
    toggleDeleteConfirm = () => {},
    id, title,
    headerStyle,
    confirmDelete= false,
    topRightItems,
    onDelete=() => {},
    loading,
    description,
    ...props
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
    topLeftItems={renderHeaderLeftTopItem({ loading, title, description })}
    topRightItems={topRightItems}
        >
        <LegendView {...props} />
    </WidgetContainer>

);
