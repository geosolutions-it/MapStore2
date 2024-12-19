
let fontAwesomeLoaded = false;

export const isFontAwesomeReady = () => fontAwesomeLoaded;

export const loadFontAwesome = () => {
    if (fontAwesomeLoaded) {
        return Promise.resolve();
    }
    // async load of font awesome
    return import('font-awesome/css/font-awesome.min.css')
        .then(() => {
            // ensure the font is loaded
            return document.fonts.load('1rem FontAwesome')
                .then(() => {
                    fontAwesomeLoaded = true;
                    return fontAwesomeLoaded;
                });
        });
};
