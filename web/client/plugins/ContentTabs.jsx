/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const { Row, Col, Grid, Nav, NavItem} = require('react-bootstrap');
const ToolsContainer = require('./containers/ToolsContainer');
const Message = require('../components/I18N/Message');

const {withState} = require('recompose');
const assign = require('object-assign');
const DefaultTitle = ({ item = {}, index }) => <span>{ item.title || `Tab ${index}` }</span>;
class ContentTabs extends React.Component {
    static propTypes = {
        selected: PropTypes.number,
        className: PropTypes.string,
        style: PropTypes.object,
        items: PropTypes.array,
        id: PropTypes.string,
        onSelect: PropTypes.func
    };
    static defaultProps = {
        selected: 0,
        items: [],
        className: "content-tabs",
        style: {},
        id: "content-tabs",
        onSelect: () => {}
    };
    render() {
        return (
            <Grid id={this.props.id}>
                <Row>
                <Col>
                <h2><Message msgId="resources.contents.title" /></h2>
                <ToolsContainer
                style={this.props.style}
                className={this.props.className}
                toolCfg={{title: ""}}
                container={(props) => <div {...props}>
                    <div style={{marginTop: "10px"}}>
                        <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.props.onSelect(k)}>
                            {this.props.items.map(
                                ({ TitleComponent = DefaultTitle, ...item }, idx) =>
                                    (<NavItem
                                        active={idx === this.props.selected}
                                        eventKey={item.key || idx} >
                                            <TitleComponent index={idx} item={item} />
                                        </NavItem>))}
                        </Nav>
                        </div>
                    {props.children}
                </div>}
                toolStyle="primary"
                stateSelector="contentTabs"
                activeStyle="default"
                tools={[...this.props.items].sort((a, b) => a.position - b.position).filter( (e, i) => i === this.props.selected)}
                panels={[]}
            /></Col>
            </Row>
            </Grid>
        );
    }
    handleSelect = () => {}
}

module.exports = {
    ContentTabsPlugin: assign(withState('selected', 'onSelect', 0)(ContentTabs), {
        NavMenu: {
            position: 2,
            label: <Message msgId="resources.contents.title" />,
            linkId: '#content-tabs',
            glyph: 'dashboard'
        }
    }),
    reducers: {}
};
