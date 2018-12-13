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
const {changeMapCrs} = require('../actions/map');
const {setInputValue} = require('../actions/crsselector');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const {connect} = require('react-redux');
const CustomMenu = require('../components/mapcontrols/crsselectormenu/crsSelectormenu');
const {projectionDefsSelector, projectionSelector} = require('../selectors/map');
const {crsInputValueSelector} = require('../selectors/crsselector');

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
        setCrs: ()=> {},
        typeInput: () => {}
    };

    render() {

        var list = [];
        let availableCRS = {};
        if (Object.keys(this.props.availableCRS).length) {
            availableCRS = CoordinatesUtils.filterCRSList(this.props.availableCRS, this.props.filterAllowedCRS, this.props.additionalCRS, this.props.projectionDefs );
        }
        for (let crs in availableCRS) {
            if (availableCRS.hasOwnProperty(crs)) {
                list.push({value: crs});
            }
        }
        const currentCRS = CoordinatesUtils.normalizeSRS(this.props.selected, this.props.filterAllowedCRS);
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
        <CustomMenu bsRole="menu" value={this.props.value} selected={currentCRS} projectionDefs={this.props.projectionDefs}
            filterAllowedCRS={this.props.filterAllowedCRS} additionalCRS={this.props.additionalCRS} changeInputValue={v => this.props.typeInput(v)}>
                {list.map(crs =>
                        <ListGroupItem
                        key={crs.value}
                        active={currentCRS === crs.value}
                        onClick= { es => this.props.setCrs(es.target.textContent)}
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
            projectionSelector,
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
/**
  * CRSSelector Plugin is a plugin that shows the coordinate of the mouse position in a selected crs.
  * it gets displayed into the mapFooter plugin
  * @name CRSSelector
  * @memberof plugins
  * @class
  * @prop {object[]} projectionDefs list of additional project definitions
  * @prop {string[]} cfg.filterAllowedCRS list of allowed crs in the combobox list to used as filter for the one of retrieved proj4.defs()
  * @prop {object} cfg.additionalCRS additional crs added to the list. The label param is used after in the combobox.
  * @example
  * // If you want to add some crs you need to provide a definition and adding it in the additionalCRS property
  * // Put the following lines at the first level of the localconfig
  * {
  *   "projectionDefs": [{
  *     "code": "EPSG:3003",
  *     "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
  *     "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
  *     "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
  *   }]
  * }
  * @example
  * // And configure the new projection for the plugin as below:
  * { "name": "CRSSelector",
  *   "cfg": {
  *     "additionalCRS": {
  *       "EPSG:3003": { "label": "EPSG:3003" }
  *     },
  *     "filterAllowedCRS": ["EPSG:4326", "EPSG:3857"]
  *   }
  * }
*/
module.exports = {
    CRSSelectorPlugin: assign(crsSelector, {
        MapFooter: {
            name: "crsSelector",
            position: 10,
            tool: true,
            priority: 1
        }
    }),
    reducers: {crsselector: require('../reducers/crsselector')},
    epics: {}
};
