import PropTypes from 'prop-types';
import { editors } from 'react-data-grid';

/**
 * Base Class of attribute editor for FeatureGrid
 *
 * @name AttributeEditor
 * @memberof components.data.featuregrid.editors
 * @type {Object}
 */
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
export default AttributeEditor;
