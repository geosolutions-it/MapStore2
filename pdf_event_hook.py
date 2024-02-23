# It is for mkdocs-with-pdf plugin 
# this file is resplosible for rendering the export pdf icon in case ENABLE_EXPORT_PDF = 1 in build environment

import logging

from bs4 import BeautifulSoup
from mkdocs.structure.pages import Page


def inject_link(html: str, href: str,
                page: Page, logger: logging) -> str:
    """Adding PDF View button on navigation bar(using material theme)"""
    def _img_tag(src):
        _IMG = f'''<img src="{src}" alt="Export PDF" style="position: relative; top: -3px; margin-right: 4px; width: 20px; height: 25px;">'''
        return BeautifulSoup(_IMG, 'html.parser')

    def _get_relative_pah():
        # get the relative path from root folder using the pdf href
        parts = href.split('pdf/')
        return parts[0]

    logger.info(f'(hook on inject_link: {page.title})')
    soup = BeautifulSoup(html, 'html.parser')
    # you can change the icon location by specify the class name of the dom element that you want to append to
    # Find the DOM element with class "export-pdf-li"
    export_pdf = soup.find(class_='export-pdf-li')
    nav = soup.find(class_='md-header-nav')
    if export_pdf:
        a = soup.new_tag('a', href=href, title='PDF', target="_blank", **{'class': 'md-tabs__link'})
        # Append an img tag with a local image source
        img_src = f'{_get_relative_pah()}theme/img/download-pdf-icon.png'
        a.append(_img_tag(img_src))
        a.append("Export PDF")
        export_pdf.append(a)
        return str(soup)
    else:
          if not nav:
            # after 7.x
                nav = soup.find('nav', class_='md-header__inner')
          if nav:
                a = soup.new_tag('a', href=href, title='PDF', target="_blank", **{'class': 'md-header__button md-header-nav__button md-icon'})
                a.append(_img_tag(img_src))
                a.append("Export PDF")
                nav.append(a)
                return str(soup)

    return html