export const viewerMapRegex = /(\/viewer\/)(\w+)(\/\w+)/;
export const contextMapRegex = /(\/viewer\/)(\w+)(\/\w+\/context\/\w+)/;

export function findMapType(path = "") {
    return [viewerMapRegex, contextMapRegex].reduce((previous, regex) => {
        if (previous) return previous;
        const match = path.match(regex);
        return match && match[0] && match[2];
    }, null);
}


export function replaceMapType(path, newMapType) {
    // check context new regex  first
    const contextMatch = path.match(contextMapRegex);
    if (contextMatch) {
        const [, prefix, , suffix] = contextMatch;
        return `${prefix}${newMapType}${suffix}`;
    }
    // check normal viewer regex after
    const viewerMapMatch = path.match(viewerMapRegex);
    if (viewerMapMatch) {
        const [, prefix, , suffix] = viewerMapMatch;
        return `${prefix}${newMapType}${suffix}`;
    }
    return path;
}
