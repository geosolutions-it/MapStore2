
import { compose } from 'recompose';
import { withSearchTextState, withVirtualScroll, searchOnTextChange } from './enhancers';

export default compose(
    withSearchTextState,
    withVirtualScroll,
    searchOnTextChange
);
