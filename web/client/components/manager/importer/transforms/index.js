export default {
    GdalAddoTransform: require("./GdalAddoTransform").default,
    GdalTranslateTransform: require('./GdalTranslateTransform').default,
    GdalWarpTransform: require('./GdalWarpTransform').default,
    help: {
        GdalAddoTransform: "http://www.gdal.org/gdaladdo.html",
        GdalTranslateTransform: "http://www.gdal.org/gdal_translate.html",
        GdalWarpTransform: "http://www.gdal.org/gdalwarp.html"
    }
};
