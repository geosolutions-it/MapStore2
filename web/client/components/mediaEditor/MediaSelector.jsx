

import MediaList from './MediaList';
import MediaFrom from './MediaForm';

import {
    branch,
    compose,
    renderComponent,
    withHandlers
} from 'recompose';


/**
 * Tool to select a media or add it.
 * TODO: support other types (now only image)
 */
export default compose(
    withHandlers({
        // add source and type to the onSave handler
        onSave: ({mediaType, source, saveMedia = () => { } }) =>
            (data) => saveMedia({ type: mediaType, source, data })
    }),
    branch(
        ({addingMedia}) => addingMedia,
        renderComponent(MediaFrom)
    )
)(MediaList);
