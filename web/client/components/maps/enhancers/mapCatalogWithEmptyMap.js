
import { compose } from 'recompose';
import { withSearchTextState, withEmptyMapVirtualScroll, searchOnTextChange } from './enhancers';

export default compose(
    withSearchTextState,
    withEmptyMapVirtualScroll,
    searchOnTextChange
);
