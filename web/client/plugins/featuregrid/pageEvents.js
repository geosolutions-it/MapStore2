import { changePage, moreFeatures } from '../../actions/featuregrid';

export default {
    onPageChange: (page, size) => changePage(page, size),
    moreFeatures
};
