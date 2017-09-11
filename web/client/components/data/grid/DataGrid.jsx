/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const Grid = require('react-data-grid');

class DataGrid extends Grid {
    static propTypes = {
        displayFilters: PropTypes.bool
    }
    componentDidMount() {
        if (this.props.displayFilters) {
            this.onToggleFilter();
        }
    }
    componentWillUnmount() {
        if (this.props.displayFilters) {
            this.onToggleFilter();
        }
    }
    componentDidUpdate(oldProps) {
        if (oldProps.displayFilters !== this.props.displayFilters) {
            this.onToggleFilter();
        }
    }
}
module.exports = DataGrid;
