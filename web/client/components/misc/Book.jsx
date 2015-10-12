/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Pager, PageItem} = require('react-bootstrap');

var Book = React.createClass({
    propTypes: {
        currentPage: React.PropTypes.number,
        pageTitles: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            currentPage: 0,
            pageTitles: []
        };
    },
    getInitialState() {
        return {
            currentPage: this.props.currentPage
        };
    },
    getPageNumber() {
        return this.props.children ? ((this.state.currentPage + 1) + "/" + this.props.children.length) : null;
    },
    renderTitle() {
        let title;
        if (this.props.pageTitles.length > 0 && this.state.currentPage < this.props.pageTitles.length) {
            title = this.props.pageTitles[this.state.currentPage];
        } else {
            title = null;
        }
        return title;
    },
    renderBody() {
        let body;
        if (this.props.children && this.props.children.length > 0 && this.state.currentPage < this.props.children.length) {
            body = React.cloneElement(this.props.children[this.state.currentPage]);
        } else {
            body = null;
        }
        return body;
    },
    render() {
        return (
            <div>
                <div style={{textAlign: "center", marginBottom: "12px"}}>
                    {this.renderTitle()}
                </div>
                <div>
                    {this.renderBody()}
                </div>
                <Pager>
                    <PageItem previous
                        disabled={!this.previousIsEnabled()}
                        onSelect={this.showPreviousPage}>
                        &larr;
                    </PageItem>
                    <PageItem next
                        disabled={!this.nextIsEnabled()}
                        onSelect={this.showNextPage}>
                        &rarr;
                    </PageItem>
                </Pager>
                <div style={{
                    position: "absolute",
                    width: "100%",
                    textAlign: "center",
                    bottom: "40px",
                    left: "0px",
                    pointerEvents: "none",
                    color: "#B4B4B4"
                    }}>
                {this.getPageNumber()}</div>
            </div>
        );
    },
    showPreviousPage() {
        this.setState({
            currentPage: (this.state.currentPage > 0 ? this.state.currentPage - 1 : this.state.currentPage)
        });
    },
    showNextPage() {
        let maxPage = React.Children.count(this.props.children) - 1;
        this.setState({
            currentPage: (this.state.currentPage < maxPage ? this.state.currentPage + 1 : this.state.currentPage)
        });
    },
    nextIsEnabled() {
        let maxPage = React.Children.count(this.props.children) - 1;
        return this.state.currentPage < maxPage;
    },
    previousIsEnabled() {
        return this.state.currentPage > 0;
    }
});

module.exports = Book;
