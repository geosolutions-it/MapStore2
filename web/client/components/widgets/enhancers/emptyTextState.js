import emptyState from '../../misc/enhancers/emptyState';
import WidgetEmptyMessage from '../widget/WidgetEmptyMessage';

export default emptyState(
    ({text} = {}) => !text,
    () => ({
        glyph: 'sheet',
        messageId: 'widgets.errors.notext'
    }),
    WidgetEmptyMessage
);
