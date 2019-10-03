/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {FormGroup, FormControl, Glyphicon, InputGroup, OverlayTrigger, Tooltip} = require('react-bootstrap');

require('./style/filter.css');

class Filter extends React.Component {

    static propTypes = {
        loading: PropTypes.bool,
        filterText: PropTypes.string,
        filterPlaceholder: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        onFilter: PropTypes.func,
        onFocus: PropTypes.func,
        tooltipClear: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        loading: false,
        filterText: '',
        filterPlaceholder: '',
        onFilter: () => {},
        onFocus: () => {},
        tooltipClear: 'Clear'
    };

    onFilter = (e) => {
        this.props.onFilter(e.target.value);
    }

    onClear = () => {
        this.props.onFilter('');
    }

    render() {
        const icon = !this.props.filterText ?
            <Glyphicon className="text-primary" glyph="filter"/>
            :
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="mapstore-toc-filter">{this.props.tooltipClear}</Tooltip>}>
                <Glyphicon glyph="1-close" className="text-primary close-filter" onClick={this.onClear}/>
            </OverlayTrigger>;
        return (
            <FormGroup className="mapstore-filter">
                <InputGroup>
                    <FormControl
                        value={this.props.filterText}
                        placeholder={this.props.filterPlaceholder}
                        onChange={this.onFilter}
                        onFocus={this.props.onFocus}
                        type="text"/>
                    <InputGroup.Addon className="square-button-md">
                        {this.props.loading ? <div className="toc-inline-loader"></div> : icon}
                    </InputGroup.Addon>
                </InputGroup>
            </FormGroup>
        );
    }
}

module.exports = Filter;
