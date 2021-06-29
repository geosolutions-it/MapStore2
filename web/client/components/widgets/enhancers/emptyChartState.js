import emptyState from '../../misc/enhancers/emptyState';
import WidgetEmptyMessage from '../widget/WidgetEmptyMessage';

export default emptyState(
    ({data = []}) => !data || data.length === 0,
    ({mapSync, iconFit} = {}) => ({
        iconFit,
        messageId: mapSync ? "widgets.errors.nodatainviewport" : "widgets.errors.nodata",
        glyph: 'stats'
    }),
    WidgetEmptyMessage
);
