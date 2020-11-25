
import { compose, branch, withProps } from 'recompose';
import tooltip from '../../../misc/enhancers/tooltip';
import withPopover from './withPopover';


export default compose(
    withProps(({renderPopover, popoverOptions, ...props}) => {
        return renderPopover ? {renderPopover, popoverOptions, ...props} : {...props};
    }),
    branch(
        ({renderPopover, popoverOptions} = {}) => renderPopover && !!popoverOptions,
        withPopover,
        tooltip
    )
);
