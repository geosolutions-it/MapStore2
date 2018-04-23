/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {Row, Col, Button} = require('react-bootstrap');
const Loader = require('./Loader');
const Message = require("../I18N/Message");

/**
 * A component to display a show more button with counting of results
 *
 * @class ShowMore
 * @memberof components.misc
 * @param  {array} [items] array of current items
 * @param  {number} [total] total of items
 * @param  {boolean} [loading] loading state
 * @param  {number} [skip] items to skip
 * @param  {number} [pageSize] size of page
 * @param  {function} [onLoadMore] return next page
 */
module.exports = ({items = [], total = 0, loading, skip = 0, pageSize = 4, onLoadMore = () => {}}) => (
    <Row className="ms-show-more">
        <Col
            xs={12}
            className="text-center">
            {loading ? <Loader size={26} style={{margin: '8px auto'}}/> : <div style={{height: 26, width: 26, margin: '8px auto'}}/>}
            {total > 0 && items.length < total && <Button
                bsSize="sm"
                bsStyle="primary"
                disabled={loading}
                onClick={() => onLoadMore(Math.ceil((items.length - skip) / pageSize))}>
                {loading ? <Message msgId="loading"/> : <Message msgId="showMore"/>}
            </Button>}
        </Col>
        <Col xs={12}>
            <h5>
                {loading ? <Message msgId="loading"/> : <Message msgId="pageInfoShowMore" msgParams={{count: items.length + '', total: total + ''}} />}
            </h5>
        </Col>
    </Row>
);
