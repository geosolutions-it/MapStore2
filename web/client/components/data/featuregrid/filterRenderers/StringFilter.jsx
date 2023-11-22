import AttributeFilter from './AttributeFilter';
import { compose, withHandlers, defaultProps } from 'recompose';
import { trim } from 'lodash';

export default compose(
    defaultProps({
        onValueChange: () => {},
        placeholderMsgId: "featuregrid.filter.placeholders.string"
    }),
    withHandlers({
        onChange: props => ({value, attribute, inputOperator} = {}) => {
            props.onValueChange(value);
            props.onChange({
                rawValue: value,
                value: trim(value) ? trim(value) : undefined,
                operator: inputOperator || "ilike",      // need to read operator from redux beased on operator selected option
                type: 'string',
                attribute
            });
        }
    })
)(AttributeFilter);
