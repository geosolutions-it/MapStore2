const React = require('react');
const PropTypes = require('prop-types');
const {Cell} = require('react-data-grid');

class CellRenderer extends React.Component {
    static propTypes = {
        value: PropTypes.any,
        rowData: PropTypes.object,
        column: PropTypes.object
    };
    static contextTypes = {
        isModified: PropTypes.func,
        isProperty: PropTypes.func,
        isValid: PropTypes.func
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
        const isProperty = this.context.isProperty(this.props.column.key);
        const isModified = (this.props.rowData._new && isProperty) || this.context.isModified(this.props.rowData.id, this.props.column.key);
        const isValid = isProperty ? this.context.isValid(this.props.rowData.get(this.props.column.key), this.props.column.key) : true;
        const className = (isModified ? ['modified'] : [])
            .concat(isValid ? [] : ['invalid']).join(" ");
        return <Cell {...this.props} ref="cell" className={className}/>;
    }
}

module.exports = CellRenderer;
