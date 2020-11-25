import React from 'react';
import PropTypes from 'prop-types';
import cellRenderer from './CellRenderer';

class RowRenderer extends React.Component {
    static propTypes = {
        columns: PropTypes.array,
        row: PropTypes.object,
        renderBaseRow: PropTypes.func.isRequired
    };
    constructor(props) {
        super(props);
        this.setScrollLeft = (scrollBy) => this.refs.row.setScrollLeft(scrollBy);
    }
    render() {
        return this.props.renderBaseRow({extraClasses: this.props.row.id === "empty_row" && 'empty-row' || '',
            cellRenderer: cellRenderer,
            ...this.props
        });
    }

}

export default RowRenderer;
