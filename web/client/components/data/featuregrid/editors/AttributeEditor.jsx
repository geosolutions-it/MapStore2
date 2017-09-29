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
        if (this.props.onTemporaryChanges) {
            this.props.onTemporaryChanges(true);
        }
    }
    componentWillUnmount() {
        // needs to be detouched.
        // Otherwise this will trigger before other events out of the editors
        // and so the tempChanges seems to be not present.
        if (this.props.onTemporaryChanges) {
            setTimeout( () => this.props.onTemporaryChanges(false), 500);
        }
    }
}
module.exports = AttributeEditor;
