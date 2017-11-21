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
module.exports = ({items=[], colProps={xs: 12}, onItemClick = () => {}} = {}) =>
    (<div className="msSideGrid">
        <Row>
            {items.map((item, i) =>
                (<Col key={item.id || i} {...colProps}>
                    <SideCard
                        onClick={() => onItemClick(item)}
                        {...item}
                    />
                </Col>)
            )}
        </Row>
    </div>);
