import AttributeFilter from './AttributeFilter';
import { compose, withHandlers, defaultProps } from 'recompose';
import { trim } from 'lodash';

export default compose(
    defaultProps({
        onValueChange: () => {},
        placeholderMsgId: "featuregrid.filter.placeholders.string"
    }),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            props.onChange({
                rawValue: value,
                value: trim(value) ? trim(value) : undefined,
                operator: "ilike",
                type: 'string',
                attribute
            });
        }
    })
)(AttributeFilter);
