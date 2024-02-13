# It is for mkdocs-with-pdf plugin 
# this file is resplosible for rendering the export pdf icon in case ENABLE_EXPORT_PDF = 1 in build environment

import logging

from bs4 import BeautifulSoup
from mkdocs.structure.pages import Page


def inject_link(html: str, href: str,
                page: Page, logger: logging) -> str:
    """Adding PDF View button on navigation bar(using material theme)"""

    def _pdf_icon():
        _ICON = '''
<svg
   version="1.1"
   id="svg1"
   width="204"
   height="250"
   viewBox="0 0 204 250"
   sodipodi:docname="download-pdf-icon4.svg"
   xml:space="preserve"
   inkscape:version="1.3.2 (091e20e, 2023-11-25, custom)"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg" style="position: relative; top: -3px; margin-right: 4px; width: 20px; height: 25px;"><defs
     id="defs1" /><sodipodi:namedview
     id="namedview1"
     pagecolor="#ffffff"
     bordercolor="#666666"
     borderopacity="1.0"
     inkscape:showpageshadow="2"
     inkscape:pageopacity="0.0"
     inkscape:pagecheckerboard="0"
     inkscape:deskcolor="#d1d1d1"
     inkscape:zoom="2.036"
     inkscape:cx="101.91552"
     inkscape:cy="125"
     inkscape:window-width="1366"
     inkscape:window-height="705"
     inkscape:window-x="-8"
     inkscape:window-y="-8"
     inkscape:window-maximized="1"
     inkscape:current-layer="svg1" /><image
     width="204"
     height="250"
     preserveAspectRatio="none"
     xlink:href="data:image/png;base64,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&#10;bAAAAABJRU5ErkJggg==&#10;"
     id="image1"
     x="0.40667978"
     y="1.9646351"
     style="fill:none"
     inkscape:label="image1"/></svg>
'''  # noqa: E501
        return BeautifulSoup(_ICON, 'html.parser')

    logger.info(f'(hook on inject_link: {page.title})')
    soup = BeautifulSoup(html, 'html.parser')
	# you can change the icon location by specify the class name of the dom element that you want to append to
    # Find the DOM element with class "export-pdf-li"
    export_pdf = soup.find(class_='export-pdf-li')
    nav = soup.find(class_='md-header-nav')
    if export_pdf:
        a = soup.new_tag('a', href=href, title='PDF', target="_blank",
                         **{'class': 'md-tabs__link'})
        a.append(_pdf_icon())
        a.append("Export PDF")
        export_pdf.append(a)
        return str(soup)
    else:
          if not nav:
            # after 7.x
                nav = soup.find('nav', class_='md-header__inner')
          if nav:
                a = soup.new_tag('a', href=href, title='PDF', target="_blank",
						**{'class': 'md-header__button md-header-nav__button md-icon'})
                a.append(_pdf_icon())
                a.append("Export PDF")
                nav.append(a)
                return str(soup)

    return html