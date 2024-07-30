import AttributeFilter from './AttributeFilter';
import { compose, withHandlers, defaultProps } from 'recompose';
import { trim } from 'lodash';

export default compose(
    defaultProps({
        onValueChange: () => {},
        placeholderMsgId: "featuregrid.filter.placeholders.string",
        defaultOperator: 'ilike'
    }),
    withHandlers({
        onChange: props => ({value, attribute, inputOperator} = {}) => {
            props.onValueChange(value);
            props.onChange({
                rawValue: value,
                value: trim(value) ? trim(value) : undefined,
                operator: inputOperator || "ilike",
                type: 'string',
                attribute
            });
        }
    })
)(AttributeFilter);
