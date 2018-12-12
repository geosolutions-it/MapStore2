/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {createSelector} = require('reselect');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const { Glyphicon, Dropdown, Button: ButtonRB, ListGroupItem } = require('react-bootstrap');
const tooltip = require('../components/misc/enhancers/tooltip');
const Button = tooltip(ButtonRB);
const {compose} = require('recompose');
const {changeMapCrs} = require('../actions/map');
const {setInputValue} = require('../actions/crsselector');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const {connect} = require('react-redux');
const CustomMenu = require('../components/mapcontrols/crsselectormenu/crsSelectormenu');
const {projectionDefsSelector} = require('../selectors/map');
const {crsInputValueSelector, selectedProjectionSelector, projectionsList} = require('../selectors/crsselector');

class Selector extends React.Component {
    static propTypes = {
        selected: PropTypes.string,
        value: PropTypes.string,
        projections: PropTypes.array,
        availableCRS: PropTypes.object,
        filterAllowedCRS: PropTypes.array,
        projectionDefs: PropTypes.array,
        additionalCRS: PropTypes.object,
        setCrs: PropTypes.func,
        typeInput: PropTypes.func
    };
    static defaultProps = {
        availableCRS: CoordinatesUtils.getAvailableCRS(),
        selected: 'EPSG:3857',
        setCrs: ()=> {},
        typeInput: () => {},
        value: '',
        filterAllowedCRS: [],
        additionalCRS: {}
    };

    render() {
        var label;
        var list = [];
        let availableCRS = {};
        if (Object.keys(this.props.availableCRS).length) {
            availableCRS = CoordinatesUtils.filterCRSList(this.props.availableCRS, this.props.filterAllowedCRS, this.props.additionalCRS, this.props.projectionDefs );
        }
        for (let crs in availableCRS) {
            if (availableCRS.hasOwnProperty(crs)) {

                label = availableCRS[crs].label;
                list.push({value: label});
            }
        }
        return (<Dropdown
        dropup
        className="ms-prj-selector">
        <Button
            bsRole="toggle"
            bsStyle="primary"
            className="map-footer-btn"
            tooltip="Select projection"
            tooltipPosition="top">
            <Glyphicon glyph="crs" />
        </Button>
        <CustomMenu bsRole="menu" value={this.props.value} selected={this.props.selected} projectionDefs={this.props.projectionDefs}
            filterAllowedCRS={this.props.filterAllowedCRS} additionalCRS={this.props.additionalCRS} changeInputValue={v => this.props.typeInput(v)}>
                {list.map(crs =>
                        <ListGroupItem
                        key={crs.value}
                        active={this.props.selected === crs.value}
                        onClick= { es => es.target.textContent === 'WGS 84' ? this.props.setCrs("EPSG:4326") : this.props.setCrs(es.target.textContent)}
                        eventKey={crs.value}
                        >
                            {crs.value}
                        </ListGroupItem>)}
        </CustomMenu>
    </Dropdown>);
    }
}

const crsSelector = connect(
        createSelector(
            selectedProjectionSelector,
            projectionDefsSelector,
            crsInputValueSelector,
                ( selected, projectionDefs, value) => ({

                    selected,
                    projectionDefs,
                    value
                })
            ), {
                typeInput: setInputValue,
                setCrs: changeMapCrs
            }
        )(Selector);

module.exports = {
    CRSSelectorPlugin: assign(crsSelector, {
        MapFooter: {
            position: 10,
            tool: true
        }
    }),
    reducers: {crsselector: require('../reducers/crsselector')},
    epics: {}
};
