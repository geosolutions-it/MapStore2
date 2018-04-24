/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Row, Col, Pagination} = require('react-bootstrap');
const Message = require("../I18N/Message");
const Loader = require('../misc/Loader');

class PaginationToolbar extends React.Component {
    static propTypes = {
        // from zero
        page: PropTypes.number,
        total: PropTypes.number,
        pageSize: PropTypes.number,
        items: PropTypes.array,
        msgId: PropTypes.string,
        loading: PropTypes.bool,
        onSelect: PropTypes.func,
        bsSize: PropTypes.string,
        maxButtons: PropTypes.number
    };

    static defaultProps = {
        page: 0,
        pageSize: 20,
        msgId: "pageInfo",
        items: [],
        onSelect: () => {},
        maxButtons: 5
    };

    onSelect = (eventKey) => {
        this.props.onSelect(eventKey && eventKey - 1);
    };

    renderLoading = () => {
        return this.props.loading ? <Loader size={26} style={{margin: '8px auto'}}/> : <div style={{height: 26, width: 26, margin: '8px auto'}}/>;
    };

    render() {
        let {pageSize, page, total, items} = this.props;
        let msg = <Message msgId={this.props.msgId} msgParams={{start: page * pageSize + 1, end: page * pageSize + (items && items.length), total}} />;
        if (this.props.loading && this.props.items.length === 0) {
            return null; // no pagination
        }
        return (
            <Row className="pagination-toolbar">
                <Col xs={12} className="text-center">
                    {this.renderLoading()}
                </Col>
                <Col xs={12} className="text-center">
                    <Pagination
                        prev next first last ellipsis boundaryLinks
                        bsSize={this.props.bsSize}
                        items={Math.ceil(total / pageSize)}
                        maxButtons={this.props.maxButtons}
                        activePage={page + 1}
                        onSelect={this.onSelect} />
                </Col>
                <Col xs={12}>
                    <h5>{this.props.loading ? <Message msgId="loading"/> : msg}</h5>
                </Col>
            </Row>
        );
    }
}

module.exports = PaginationToolbar;
