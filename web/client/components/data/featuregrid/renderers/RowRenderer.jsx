const React = require('react');
const PropTypes = require('prop-types');
const {Row} = require('react-data-grid');
const cellRenderer = require('./CellRenderer');

class RowRenderer extends React.Component {
    static propTypes = {
        columns: PropTypes.array,
        row: PropTypes.object
    };
    constructor(props) {
        super(props);
        this.setScrollLeft = (scrollBy) => this.refs.row.setScrollLeft(scrollBy);
    }
    render() {

        return <Row extraClasses={this.props.row.id === "empty_row" && 'empty-row' || ''} cellRenderer={cellRenderer} ref="row" {...this.props} />;
    }

}

module.exports = RowRenderer;
