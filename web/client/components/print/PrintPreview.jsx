/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Button, Glyphicon} = require('react-bootstrap');
const PDF = require('react-pdf');

const PrintPreview = React.createClass({
    propTypes: {
        url: React.PropTypes.string,
        scale: React.PropTypes.number,
        currentPage: React.PropTypes.number,
        pages: React.PropTypes.number,
        zoomFactor: React.PropTypes.number,
        minScale: React.PropTypes.number,
        maxScale: React.PropTypes.number,
        back: React.PropTypes.func,
        setScale: React.PropTypes.func,
        setPage: React.PropTypes.func,
        setPages: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            url: null,
            scale: 1.0,
            minScale: 0.25,
            maxScale: 8.0,
            currentPage: 1,
            pages: 1,
            zoomFactor: 2.0,
            back: () => {},
            setScale: () => {},
            setPage: () => {},
            setPages: () => {}
        };
    },
    onDocumentComplete(pages) {
        this.props.setPage(1);
        this.props.setPages(pages);
    },
    render() {
        return (
            <div>
                <div style={{height: "700px", width: "800px", overflow: "auto", backgroundColor: "#888", padding: "10px"}}>
                    <PDF file={this.props.url} scale={this.props.scale} page={this.props.currentPage} onDocumentComplete={this.onDocumentComplete}/>
                </div>
                <div style={{marginTop: "10px"}}>
                    <Button style={{marginRight: "10px"}} onClick={this.props.back}><Glyphicon glyph="arrow-left"/></Button>
                    <Button disabled={this.props.scale >= this.props.maxScale} onClick={this.zoomIn}><Glyphicon glyph="zoom-in"/></Button>
                    <Button disabled={this.props.scale <= this.props.minScale} onClick={this.zoomOut}><Glyphicon glyph="zoom-out"/></Button>
                    <label style={{marginLeft: "10px", marginRight: "10px"}}>{this.props.scale}x</label>
                    <Button style={{marginRight: "10px"}}><a href={this.props.url} target="_blank"><Glyphicon glyph="save"/></a></Button>
                    <Button disabled={this.props.currentPage === 1} onClick={this.prevPage}><Glyphicon glyph="chevron-left"/></Button>
                    <label style={{marginLeft: "10px", marginRight: "10px"}}>{this.props.currentPage} / {this.props.pages}</label>
                    <Button disabled={this.props.currentPage === this.props.pages} onClick={this.nextPage}><Glyphicon glyph="chevron-right"/></Button>
                </div>
            </div>
        );
    },
    prevPage() {
        if (this.props.currentPage > 1) {
            this.props.setPage(this.props.currentPage - 1);
        }
    },
    nextPage() {
        if (this.props.currentPage < this.props.pages) {
            this.props.setPage(this.props.currentPage + 1);
        }
    },
    zoomIn() {
        this.props.setScale(this.props.scale * this.props.zoomFactor);
    },
    zoomOut() {
        this.props.setScale(this.props.scale / this.props.zoomFactor);
    }
});

module.exports = PrintPreview;
