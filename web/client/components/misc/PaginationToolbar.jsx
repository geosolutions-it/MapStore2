const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Pagination} = require('react-bootstrap');
const Message = require("../I18N/Message");
const Spinner = require('react-spinkit');
require('./style/pagination-toolbar.css');

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
        bsSize: PropTypes.string
    };

    static defaultProps = {
        page: 0,
        pageSize: 20,
        msgId: "pageInfo",
        items: [],
        onSelect: () => {}

    };

    onSelect = (eventKey) => {
        this.props.onSelect(eventKey && eventKey - 1);
    };

    renderLoading = () => {
        return <div>Loading...<Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/></div>;
    };

    render() {
        let {pageSize, page, total, items} = this.props;
        let msg = <Message msgId={this.props.msgId} msgParams={{start: page * pageSize + 1, end: page * pageSize + (items && items.length), total}} />;
        if (this.props.loading && this.props.items.length === 0) {
            return null; // no pagination
        }
        return (<div className="pagination-toolbar"><Pagination
          prev next first last ellipsis boundaryLinks
          bsSize={this.props.bsSize}
          items={Math.ceil(total / pageSize)}
          maxButtons={5}
          activePage={page + 1}
          onSelect={this.onSelect} />
      <div style={{"float": "right", fontWeight: "bold", marginRight: "20px", marginTop: "5px"}}>
            {this.props.loading ? this.renderLoading() : msg}
        </div>
    </div>);
    }
}

module.exports = PaginationToolbar;
