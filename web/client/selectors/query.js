module.exports = {
    wfsURL: state => state && state.query && state.query.searchUrl,
    wfsFilter: state => state && state.query && state.query.filterObj
};
