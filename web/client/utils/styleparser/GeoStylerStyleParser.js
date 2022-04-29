
class GeoStylerStyleParser {
    readStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                resolve(geoStylerStyle);
            } catch (error) {
                reject(error);
            }
        });
    }

    writeStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                resolve(geoStylerStyle);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default GeoStylerStyleParser;
