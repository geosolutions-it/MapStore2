/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const SideCard = require('./SideCard');
const {Row, Col} = require('react-bootstrap');
/**
 * Component for rendering a list of SideCard.
 * @memberof components.misc.cardgrids
 * @name SideGrid
 * @class
 * @prop {array} items array of list item
 * @prop {function} onItemClick callback on item click
 * @prop {string} size size of cards, 'sm' for small
 * @prop {element} cardComponent custom component for card in list
 * @prop {object} colProps props for react-bootstrap col component
 */
module.exports = ({cardComponent, items = [], colProps = {xs: 12}, onItemClick = () => {}, size = ''} = {}) => {
    const Card = cardComponent || SideCard;
    return (<div className="msSideGrid">
        <Row className="items-list">
            {items.map((item, i) =>
                (<Col key={item.id || i} {...colProps}>
                    <Card
                        onClick={() => onItemClick(item)}
                        size={size}
                        {...item}
                    />
                </Col>)
            )}
        </Row>
    </div>);
};
