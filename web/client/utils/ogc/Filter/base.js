const fidFilter = (fid) =>
    `<ogc:Filter><ogc:FeatureId fid="${fid}"/></ogc:Filter>`;

module.exports = {
    fidFilter
};
