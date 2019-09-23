

import MediaList from './MediaList';
import ImageForm from './image/ImageForm';

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
        onSave: ({ type, source, saveMedia = () => { } }) => (data) => saveMedia({ type, source, data })
    }),
    branch(
        ({addingMedia}) => addingMedia,
        renderComponent(ImageForm)
    )
)(MediaList);
