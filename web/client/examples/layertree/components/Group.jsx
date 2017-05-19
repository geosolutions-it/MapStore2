var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Node = require('../../../components/TOC/Node');
var GroupTitle = require('../../../components/TOC/fragments/GroupTitle');
var GroupChildren = require('../../../components/TOC/fragments/GroupChildren');
var VisibilityCheck = require('../../../components/TOC/fragments/VisibilityCheck');
var {Glyphicon} = require('react-bootstrap');

class Group extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        expanded: PropTypes.bool,
        style: PropTypes.object,
        onToggle: PropTypes.func,
        onSort: PropTypes.func,
        onRemove: PropTypes.func,
        onSettings: PropTypes.func,
        propertiesChangeHandler: PropTypes.func
    };

    static defaultProps = {
        node: {},
        onToggle: () => {},
        onRemove: () => {},
        onSettings: () => {},
        propertiesChangeHandler: () => {},
        expanded: true,
        style: {
            marginBottom: "16px",
            cursor: "pointer"
        }
    };

    render() {
        let {children, onToggle, ...other } = this.props;
        let visibilityStyle = {
            visibility: this.props.node.name === 'background' ? 'hidden' : 'visible',
            marginLeft: "5px",
            marginRight: "5px", "float": "left",
            marginTop: "7px"
        };
        return (
            <Node type="group" {...other}>
                {this.props.node.name !== 'background' ?
                [<Glyphicon key="remove" style={{"float": "left", marginTop: "5px", marginLeft: "5px"}} glyph="remove-sign"
                        onClick={() => this.props.onRemove(this.props.node)}/>,
                    <VisibilityCheck key="visibility" propertiesChangeHandler={this.props.propertiesChangeHandler} style={visibilityStyle}/>] : []}
                <GroupTitle onClick={this.props.onToggle}/>
                <GroupChildren onSort={this.props.onSort} position="collapsible">
                    {this.props.children}
                </GroupChildren>
            </Node>
        );
    }
}

module.exports = Group;
