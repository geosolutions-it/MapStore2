const PropTypes = require('prop-types');
const { editors } = require('react-data-grid');

class AttributeEditor extends editors.SimpleTextEditor {
    static propTypes = {
        onTemporaryChanges: PropTypes.func
    };
    static defaultProps = {
        onTemporaryChanges: () => {}
    };
    componentDidMount() {
        this.props.onTemporaryChanges?.(true);
    }
    componentWillUnmount() {
        this.props.onTemporaryChanges?.(false);
    }
}
module.exports = AttributeEditor;
