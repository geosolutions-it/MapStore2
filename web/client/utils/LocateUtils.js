export function getNavigationArrowSVG({color = '#2A93EE', svgAttributes}) {
    return `<svg xmlns="http://www.w3.org/2000/svg"
    ${svgAttributes} viewBox="-100 0 100 100" xml:space="preserve">
    <path style="fill: ${color}" transform="rotate(90)" d="M 0,50 L 100,0 L 70,50 L 100,100"/>
</svg>`;

}
