const React = require('react');
const PropTypes = require('prop-types');
const cellRenderer = require('./CellRenderer');

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

module.exports = RowRenderer;
