/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetContainer = require('./WidgetContainer');
const emptyTextState = require('../enhancers/emptyTextState');
const TextView = emptyTextState(({ text } = {}) => <div className="mapstore-widget-default-content ql-editor" dangerouslySetInnerHTML={{__html: text}}></div>);

module.exports = ({
    toggleDeleteConfirm = () => {},
    icons,
    topLeftItems,
    id, title, text,
    headerStyle,
    topRightItems,
    confirmDelete = false,
    onDelete = () => {}
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
        icons={icons}
        topLeftItems={topLeftItems}
        topRightItems={topRightItems}
    >
        <TextView text={text} />
    </WidgetContainer>

    );
