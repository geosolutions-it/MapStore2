/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {compose, branch} = require('recompose');
const withVirtualScroll = require('./infiniteScroll/withInfiniteScroll');
const loadMore = require('./infiniteScroll/loadMore');
const ShowMore = require('../ShowMore');
const Message = require("../../I18N/Message");
const {Row, Col} = require('react-bootstrap');
/**
 * Add pagination functionality to a component.
 *
 * To do that you must provide the following parameter (1 key-value object):
 * @param {function} [loadPage] A function that returns an observable that emits props with at least `{items: [items of the page], total: 100}`
 * @param {number} [pageSize]  size of page
 * @param {object} [scrollSpyOptions]  Options for the `withScrollSpy` enhancer
 * @return {HOC} The HOC to apply
 */
module.exports = ({loadPage, pageSize, scrollSpyOptions = {querySelector: ".ms-grid"}}) => compose(
    branch(
        ({pagination} = {}) => pagination === 'show-more',
        Component => loadMore(loadPage)(props => <Component {...props} bottom={<ShowMore {...props}/>}/>)
    ),
    branch(
        ({pagination} = {}) => pagination === 'virtual-scroll-horizontal',
        Component => withVirtualScroll({
            loadPage,
            scrollSpyOptions: {...scrollSpyOptions, pageSize},
            isScrolled: ({div, offset}) => div.scrollLeft + div.clientWidth >= div.scrollWidth - offset,
            hasMore: ({total, items}) => items.length < total
        })(props => <Component
            {...props}
            className={(props.className || '') + ' ms-grid-horizontal'}
            bottom={
                <Row>
                    <Col xs={12}>
                        <h5>
                            {props.loading ? <Message msgId="loading"/> : <Message msgId="pageInfoShowMore" msgParams={{count: props.items && props.items.length, total: props.total}} />}
                        </h5>
                    </Col>
                </Row>
            }/>)
    )
);
