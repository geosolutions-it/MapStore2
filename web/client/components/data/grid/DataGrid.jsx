/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';

import Grid from 'react-data-grid';
import ReactDOM from 'react-dom';

class DataGrid extends Grid {
    static propTypes = {
        displayFilters: PropTypes.bool
    }
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.setCanvasListener();
        if (this.props.displayFilters) {
            this.onToggleFilter();
        }
    }
    componentWillUnmount() {
        if (this.canvas) {
            this.canvas.removeEventListener('scroll', this.scrollListener);
            this.canvas = null;
        }
        if (this.props.displayFilters) {
            this.onToggleFilter();
        }
    }
    componentDidUpdate(oldProps) {
        const { virtualScroll, displayFilters, scrollToTopCounter} = this.props;
        if (oldProps.displayFilters !== displayFilters) {
            this.onToggleFilter();
        }
        if (virtualScroll) {
            // Check if canvas is always valid
            if (this.canvas && this.canvas !== ReactDOM.findDOMNode(this).querySelector('.react-grid-Canvas')) {
                this.canvas.removeEventListener('scroll', this.scrollListener);
                this.setCanvasListener();
            }
            // Check if canvas exist
            if (!this.canvas) {
                this.setCanvasListener();
            }
            // When exiting feature editing we reset previous scroll
            if (this.canvas && oldProps.isFocused && !this.props.isFocused ) {
                this.canvas.scrollTop = this.scroll;
            } else if (this.canvas && this.props.minHeight !== oldProps.minHeight) {
                this.scrollListener(); // Emit scroll on  grid resize
            }
            if (!this.props.isFocused && this.canvas) {
                this.scroll = this.canvas.scrollTop;
            }
            // force scroll top
            if (scrollToTopCounter !== oldProps.scrollToTopCounter && this.canvas) {
                this.canvas.scrollTop = 0;
            } else if (this.canvas && this.header) {
                this.canvas.scrollLeft = this.header.scrollLeft; // makes sure header x-scroll matches canvas x-scroll
            }
        }
    }
    scrollListener = () => {
        if (this.props.rowsCount === 0) return;
        if (!this.props.isFocused && this.canvas) {
            this.scroll = this?.canvas?.scrollTop || 0;
        }
        const visibleRows = Math.ceil(this.canvas.clientHeight / this.props.rowHeight);
        const firstRowIdx = Math.floor(this.canvas.scrollTop / this.props.rowHeight);
        const lastRowIdx = firstRowIdx + visibleRows;
        if (this.props.onGridScroll) {
            this.props.onGridScroll({ firstRowIdx, lastRowIdx });
        }
    }
    setCanvasListener = () => {
        this.canvas = ReactDOM.findDOMNode(this).querySelector('.react-grid-Canvas');
        this.header = ReactDOM.findDOMNode(this).querySelector('.react-grid-HeaderRow');
        if (this.canvas) {
            this.canvas.addEventListener('scroll', this.scrollListener);
        }
    }
}

export default DataGrid;
