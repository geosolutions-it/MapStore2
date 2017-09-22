const React = require('react');
const PropTypes = require('prop-types');
const AttributeEditor = require('./AttributeEditor');
const PagedCombobox = require('../../../misc/PagedCombobox');
const nanToNull = v => isNaN(v) ? null : v;
const processValue = (obj, func) => Object.keys(obj).reduce((acc, curr) => ({
    ...acc,
    [curr]: nanToNull(func(obj[curr]))}),
{});
const parsers = {
    "int": v => valueOf(v),
    "number": v => valueOf(v),
    "string": v => v
};
class AutocompleteEditor extends AttributeEditor {
    static propTypes = {
      value: PropTypes.string,
      onBlur: PropTypes.func,
      inputProps: PropTypes.object,
      dataType: PropTypes.string,
      isValid: PropTypes.func,
      column: PropTypes.object
    };
    static defaultProps = {
        isValid: () => true,
        dataType: "string"
    };
    constructor(props) {
        super(props);
        this.validate = (value) => {
            try {
                if (parsers[this.props.dataType] || parsers.string) {
                    return this.props.isValid(value[this.props.column && this.props.column.key]);
                }
            } catch (e) {
                return false;
            }
        };
        this.getValue = () => {
            const updated = super.getValue();
            try {
                return processValue(updated, parsers[this.props.dataType] || parsers.string);
            } catch (e) {
                return updated;
            }
        };
    }
// hoc per passare valore da render a get value???????????
/* TODO use stream to populate props and use set state instead of props
return addWPSAutocomplete(<PagedCombobox
*/
    render() {
        return (<PagedCombobox
            ref={(node) => this.input = node}
         />);
    }
}

module.exports = AutocompleteEditor;
