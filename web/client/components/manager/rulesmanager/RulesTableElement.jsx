const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const dragSource = require('react-dnd').DragSource;
const dropTarget = require('react-dnd').DropTarget;

const Types = {
    ROW: 'row'
};

const rowSource = {
    beginDrag: function(props) {
        return {
            rule: props.rule
        };
    }
};

const rowTarget = {
    drop: function(props, monitor) {
        const rule = monitor.getItem().rule;
        if (rule.id !== props.rule.id) {
            if (rule.priority < props.rule.priority) {
                props.moveRules(props.rule.priority + 1, [rule]);
            } else {
                props.moveRules(props.rule.priority, [rule]);
            }
        }
    }
};

var sourceCollect = function(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
};

var targetCollect = function(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
};

class Component extends React.Component {
    static propTypes = {
        moveRules: PropTypes.func,
        onSelect: PropTypes.func,
        rule: PropTypes.object,
        checked: PropTypes.bool,
        connectDragSource: PropTypes.func,
        connectDropTarget: PropTypes.func,
        isOver: PropTypes.bool
    };

    static defaultProps = {
        moveRules: () => {},
        onSelect: () => {},
        rule: () => {},
        checked: false
    };

    render() {
        const connectDragSource = this.props.connectDragSource;
        const connectDropTarget = this.props.connectDropTarget;
        // const  = this.props.isOver ? {borderStyle: "solid"} : undefined;
        let className = this.props.checked ? "rule-selected" : "rule";
        className += this.props.isOver ? " rule-over" : "";
        return connectDragSource(connectDropTarget(
            <tr className={className}>
                <td>
                    <input
                        type="checkbox"
                        checked={this.props.checked}
                        onChange={this.getOnlickHandler()}/>
                </td>
                <td>{this.props.rule.roleName}</td>
                <td>{this.props.rule.userName}</td>
                <td>{this.props.rule.service}</td>
                <td>{this.props.rule.request}</td>
                <td>{this.props.rule.workspace}</td>
                <td>{this.props.rule.layer}</td>
                <td>{this.props.rule.access}</td>
            </tr>
        ));
    }

    getOnlickHandler = () => {
        return () => this.props.onSelect(this.props.rule, true, this.props.checked);
    };
}

const RulesTableElementTarget = dropTarget(Types.ROW, rowTarget, targetCollect)(Component);
const RulesTableElement = dragSource(Types.ROW, rowSource, sourceCollect)(RulesTableElementTarget);

module.exports = RulesTableElement;
