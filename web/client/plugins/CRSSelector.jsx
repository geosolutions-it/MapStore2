/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
// const PropTypes = require('prop-types');
const assign = require('object-assign');
const { Glyphicon, ListGroupItem, ListGroup, FormControl, Dropdown, Button: ButtonRB } = require('react-bootstrap');
const tooltip = require('../components/misc/enhancers/tooltip');
const Button = tooltip(ButtonRB);
const {withState} = require('recompose');
const {changeMapCrs} = require('../actions/map');
const {connect} = require('react-redux');

// const {mapTypeSelector} = require('../selectors/maptype');


class CRSSelector extends React.Component {
    render() {
        return null;
    }
}

class CustomMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {};

    render() {
        const { children, selected } = this.props;
        const { value = '' } = this.state;

        return (
            <div className="dropdown-menu" style={{
                left: 'auto',
                right: 0
            }}>
                <ListGroupItem
                    className="ms-prj-header"
                    bsSize="sm">
                    <div>Selected:</div>
                    <div>{selected}</div>
                </ListGroupItem>
                <ListGroup style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 0}}>
                    {React.Children.toArray(children).filter(
                        child => !value.trim() || child.props.children.indexOf(value) !== -1
                    )}
                </ListGroup>
                <FormControl
                    ref={c => {
                        this.input = c;
                    }}
                    type="text"
                    placeholder="Filter projection"
                    onChange={this.handleChange}
                    value={value}
                />
            </div>
        );
    }

    handleChange = (e) => {
        this.setState({ value: e.target.value });
    }

    focusNext = () => {
        const input = ReactDOM.findDOMNode(this.input);

        if (input) {
            input.focus();
        }
    }
}

module.exports = {
    CRSSelectorPlugin: assign(CRSSelector, {
        /*BurgerMenu: {
            name: 'crs',
            position: 2,
            tool: () => (
            <DropdownButton noCaret title={<MenuItem><Glyphicon glyph="crs" /> PROJECTION</MenuItem>}>
                <MenuItem active eventKey="2">
                    EPSG:3857</MenuItem>
                <MenuItem eventKey="3"
                    >EPSG:4326</MenuItem>
            </DropdownButton>),
            doNotHide: true
        },
        Settings: {
            position: 0,
            tool: (
                <FormGroup bsSize="small">
                <ControlLabel>Projection</ControlLabel>
                <FormControl
                    value={'3857'}
                    componentClass="select">
                    <option value={'3857'} key={'3857'}>{'EPSG:3857'}</option>
                    <option value={'4326'} key={'4326'}>{'EPSG:4326'}</option>
                </FormControl>
            </FormGroup>)
        },*/
        MapFooter: {
            position: 10,
            tool: withState('state', 'setState', {
                projections: [
                    {
                        value: 'EPSG:3857'
                    },
                    {
                        value: 'EPSG:900913'
                    },
                    {
                        value: 'EPSG:4326'
                    },
                    {
                        value: 'EPSG:3003'
                    },
                    {
                        value: 'EPSG:23003'
                    },
                    {
                        value: 'EPSG:3995'
                    }
                ],
                selected: 'EPSG:3857'
            })(({state, setState}) => (
                <Dropdown
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
                    <CustomMenu bsRole="menu" selected={state.selected}>
                        {state.projections.map(crs =>
                            <ListGroupItem
                            key={crs.value}
                            active={state.selected === crs.value}
                            eventKey={crs.value}
                            onClick={() => {
                                console.log('sdsad')
                                return setState({
                                projections: state.projections.map(prj => ({...prj, active: prj.value === crs.value})),
                                selected: crs.value
                            }); }}>
                                {crs.value}
                            </ListGroupItem>)
                        }
                    </CustomMenu>
                </Dropdown>))
        }
    }),
    reducers: {},
    epics: {}
};
