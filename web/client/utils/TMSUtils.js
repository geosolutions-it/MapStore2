import {includes} from 'lodash';


export const guessFormat = (url = "") => {
    const parts = url
        .split("?")[0] // remove query string (i.e. if authkey present...)
        .split("@");
    if (parts.length > 1) {
        const format = parts[parts.length - 1];
        if (includes(["png", "png8", "jpeg", "vnd.jpeg-png", "gif"], format)) { // TODO: get formats from a well known list
            return format;
        }
    }
    return null;
};
