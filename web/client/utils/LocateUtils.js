const STROKE_WIDTH = 8;

export function getNavigationArrowSVG({color = '#2A93EE', svgAttributes, strokeWidth = STROKE_WIDTH}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" ${svgAttributes} viewBox="0 0 100 100" xml:space="preserve">
		<g transform="matrix(0.2 0 0 0.2 49.8 50.19)">
            <linearGradient gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 1 -65 -65)" x1="65" y1="130" x2="65" y2="0">
                <stop offset="100%" style="stop-color:rgba(0, 132, 202, 1);"/>
                <stop offset="100%" style="stop-color:rgba(0, 0, 255, 1);"/>
            </linearGradient>
            <circle style="stroke: rgb(255,255,255); stroke-width: ${strokeWidth}; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: ${color}; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke" cx="0" cy="0" r="65"/>
        </g>
        <g transform="matrix(-0.12 -0.22 0.22 -0.12 47.11 20.53)">
            <polygon style="stroke: rgb(255,255,255); stroke-width: ${strokeWidth}; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: ${color}; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke" points="0,-42.5 50,42.5 -50,42.5 "/>
        </g>
    </svg>`;

}


export function getNavigationCircleSVG({color = '#2A93EE', svgAttributes, strokeWidth = STROKE_WIDTH}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" ${svgAttributes} viewBox="0 0 100 100" xml:space="preserve">
		<g transform="matrix(0.2 0 0 0.2 49.8 50.19)">
            <linearGradient gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 1 -65 -65)" x1="65" y1="130" x2="65" y2="0">
                <stop offset="100%" style="stop-color:rgba(0, 132, 202, 1);"/>
                <stop offset="100%" style="stop-color:rgba(0, 0, 255, 1);"/>
            </linearGradient>
            <circle style="stroke: rgb(255,255,255); stroke-width: ${strokeWidth}; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: ${color}; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke" cx="0" cy="0" r="65"/>
        </g>
    </svg>`;

}
