/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Grid, Row, Col, Glyphicon} = require('react-bootstrap');
const Filter = require('../misc/Filter');
class Header extends React.Component {

    static propTypes = {
        title: PropTypes.string,
        filterText: PropTypes.string,
        filterPlaceholder: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        showTitle: PropTypes.bool,
        showFilter: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
        showTools: PropTypes.bool,
        toolbar: PropTypes.object,
        onFilter: PropTypes.func,
        onClear: PropTypes.func,
        filterTooltipClear: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        title: '',
        filterText: '',
        filterPlaceholder: 'Filter',
        showTitle: true,
        showFilter: true,
        showTools: true,
        toolbar: null,
        onFilter: () => {},
        onClear: () => {},
        filterTooltipClear: 'Clear'
    };

    renderTitle = () => {
        return (
            <Row>
                <Col xs={12} className="mapstore-toc-head-title-container text-center no-border">
                    <div className="mapstore-toc-head-title" title={this.props.title}><Glyphicon glyph="1-map"/>&nbsp;&nbsp;{this.props.title}</div>
                </Col>
            </Row>
        );
    }

    renderFilter = () => {
        return (
            <Row>
                <Col xs={12} className="text-center">
                    <Filter
                        onFocus={this.props.onClear}
                        filterPlaceholder={this.props.filterPlaceholder}
                        tooltipClear={this.props.filterTooltipClear}
                        filterText={this.props.filterText}
                        onFilter={this.props.onFilter}/>
                </Col>
            </Row>
        );
    }

    renderTools = () => {
        return (
            <Row>
                <Col xs={12} className="text-center">
                    {this.props.toolbar}
                </Col>
            </Row>
        );
    }

    render() {

        const sections = [this.props.showTools, this.props.showFilter, this.props.showTitle].filter(s => s);
        const headClass = sections.length > 0 ? ' toc-head-sections-' + sections.length : ' toc-head-sections';

        return (
            <div className={'mapstore-toc-head' + headClass}>
                <Grid fluid>
                    {this.props.showTitle ? this.renderTitle() : null}
                    {this.props.showFilter ? this.renderFilter() : null}
                    {this.props.showTools ? this.renderTools() : null}
                </Grid>
            </div>
        );
    }
}

module.exports = Header;
