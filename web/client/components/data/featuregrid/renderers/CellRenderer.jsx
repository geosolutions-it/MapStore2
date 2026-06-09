import React from 'react';
import PropTypes from 'prop-types';
import { Cell } from 'react-data-grid';
import CellValidationErrorMessage from './CellValidationErrorMessage';

class CellRenderer extends React.Component {
    static propTypes = {
        value: PropTypes.any,
        rowData: PropTypes.object,
        column: PropTypes.object
    };
    static contextTypes = {
        isModified: PropTypes.func,
        isProperty: PropTypes.func,
        isValid: PropTypes.func,
        cellControls: PropTypes.any
    };
    static defaultProps = {
        value: null,
        rowData: {},
        column: {}
    }
    constructor(props) {
        super(props);
        this.setScrollLeft = (scrollBy) => this.refs.cell.setScrollLeft(scrollBy);
    }
    render() {
        const value = this.props.rowData.get(this.props.column.key);
        const isProperty = this.context.isProperty(this.props.column.key);
        const isModified = (this.props.rowData._new && isProperty) || this.context.isModified(this.props.rowData.id, this.props.column.key);
        const { valid, message, changed } = isProperty
            ? this.context.isValid(value, this.props.column.key, this.props.rowData.id)
            : { valid: true };
        const isPrimaryKey = this.props.column?.isPrimaryKey;
        const className = [
            ...(isModified ? ['modified'] : []),
            ...(valid ? [] : ['invalid']),
            ...(isPrimaryKey ? ['primary-key'] : [])
        ].join(" ");
        return (
            <Cell
                {...this.props}
                ref="cell"
                className={className}
                cellControls={<>
                    {this.props.cellControls}
                    <CellValidationErrorMessage
                        rowid={this.props.rowData.id}
                        value={value}
                        valid={valid}
                        changed={changed}
                        message={message}
                        column={this.props.column}
                    />
                </>}
            />
        );
    }
}

export default CellRenderer;
