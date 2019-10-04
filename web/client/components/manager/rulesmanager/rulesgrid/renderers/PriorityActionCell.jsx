const React = require('react');
const PropTypes = require('prop-types');
const { DragSource: dragSource } = require('react-dnd');
const { editors } = require('react-data-grid');
const { CheckboxEditor } = editors;

class PriorityActionsCell extends React.Component {

    renderRowIndex() {
        return (<div className="rdg-row-index">
            { this.props.dependentValues && this.props.dependentValues.priority || "" }
        </div>);
    }

    render() {
        const {connectDragSource, rowSelection} = this.props;
        let rowHandleStyle = rowSelection !== null ? {position: 'absolute', marginTop: "-2px", marginLeft: "3px"} : {};
        let isSelected = this.props.value;
        let editorClass = isSelected ? 'rdg-actions-checkbox selected' : 'rdg-actions-checkbox';

        return connectDragSource(
            <div>
                <div className="rdg-drag-row-handle" style={rowHandleStyle}></div>
                {!isSelected ? this.renderRowIndex() : null}
                {rowSelection !== null && <div className={editorClass}>
                    <CheckboxEditor column={this.props.column} rowIdx={this.props.rowIdx} dependentValues={this.props.dependentValues} value={this.props.value}/>
                </div>}
            </div>);
    }
}

PriorityActionsCell.propTypes = {
    rowIdx: PropTypes.number.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    isRowHovered: PropTypes.bool,
    column: PropTypes.object,
    dependentValues: PropTypes.object,
    value: PropTypes.bool,
    rowSelection: PropTypes.object.isRequired
};

PriorityActionsCell.defaultProps = {
    rowIdx: 0
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
        connectDragPreview: connect.dragPreview()
    };
}

const rowIndexSource = {
    beginDrag(props) {
        return { idx: props.rowIdx, data: props.dependentValues };
    },
    endDrag(props) {
        return { idx: props.rowIdx, data: props.dependentValues };
    }
};

module.exports = dragSource('Row', rowIndexSource, collect)(PriorityActionsCell);
