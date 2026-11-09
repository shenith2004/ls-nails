import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))


def read(name):
    with open(os.path.join(BASE, name), encoding='utf-8') as f:
        return f.read()


def exists(*parts):
    return os.path.exists(os.path.join(BASE, *parts))


def json_ld(html):
    """Parse every JSON-LD block; returns None if any block is invalid."""
    try:
        return [json.loads(b) for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)]
    except json.JSONDecodeError:
        return None


def title(html):
    m = re.search(r'<title>(.*?)</title>', html, re.S)
    return m.group(1).replace('&amp;', '&') if m else ''


def description(html):
    m = re.search(r'<meta name="description"\s+content="([^"]*)"', html)
    return m.group(1).replace('&amp;', '&') if m else ''


def local_images_exist(html):
    srcs = re.findall(r'(?:src|srcset)="([^"]+)"', html)
    paths = []
    for s in srcs:
        for part in s.split(','):
            p = part.strip().split(' ')[0]
            if p.startswith('images/'):
                paths.append(p)
    return all(exists(*p.split('/')) for p in paths)


content = read('index.html')
content_gallery = read('gallery.html')
robots = read('robots.txt')
sitemap = read('sitemap.xml')
index_ld = json_ld(content)
gallery_ld = json_ld(content_gallery)

checks = {
    # Domain & Canonical Checks
    'index_canonical_lsnails_lk': 'href="https://lsnails.lk/"' in content,
    'gallery_canonical_lsnails_lk': 'href="https://lsnails.lk/gallery.html"' in content_gallery,
    'robots_sitemap_lsnails_lk': 'https://lsnails.lk/sitemap.xml' in robots,
    'sitemap_home_lsnails_lk': '<loc>https://lsnails.lk/</loc>' in sitemap,
    'sitemap_gallery_lsnails_lk': '<loc>https://lsnails.lk/gallery.html</loc>' in sitemap,
    'sitemap_has_images': 'xmlns:image=' in sitemap and sitemap.count('<image:loc>') >= 60,

    # No rogue/pages.dev domains
    'no_pages_dev_in_index': 'pages.dev' not in content,
    'no_pages_dev_in_gallery': 'pages.dev' not in content_gallery,
    'no_pages_dev_in_robots': 'pages.dev' not in robots,
    'no_pages_dev_in_sitemap': 'pages.dev' not in sitemap,
    'no_london_in_index': 'London' not in content,
    'no_co_uk_in_index': 'lsnails.co.uk' not in content,

    # Titles & descriptions (length Google shows without truncating)
    'index_title_negombo': 'Negombo' in title(content),
    'index_title_length_ok': 0 < len(title(content)) <= 60,
    'index_description_length_ok': 70 <= len(description(content)) <= 160,
    'gallery_title_length_ok': 0 < len(title(content_gallery)) <= 60,
    'gallery_description_length_ok': 70 <= len(description(content_gallery)) <= 160,
    'index_one_h1': content.count('<h1') == 1,
    'gallery_one_h1': content_gallery.count('<h1') == 1,

    # Social / Open Graph
    'index_og_title': 'og:title' in content,
    'index_og_url_lk': 'property="og:url" content="https://lsnails.lk/"' in content,
    'index_og_image_1200x630': 'content="https://lsnails.lk/images/og-cover.jpg"' in content and 'og:image:width" content="1200"' in content,
    'og_cover_exists': exists('images', 'og-cover.jpg'),
    'index_twitter_card': 'twitter:card' in content,
    'gallery_og_title': 'og:title' in content_gallery,
    'gallery_og_url_lk': 'property="og:url" content="https://lsnails.lk/gallery.html"' in content_gallery,
    'gallery_og_image_1200x630': 'content="https://lsnails.lk/images/og-gallery.jpg"' in content_gallery,
    'og_gallery_exists': exists('images', 'og-gallery.jpg'),
    'gallery_twitter_card': 'twitter:card' in content_gallery,

    # Local SEO & structured data
    'index_robots_meta': 'index, follow' in content and 'max-image-preview:large' in content,
    'index_geo_tags': 'name="geo.placename" content="Negombo"' in content,
    'index_json_ld_valid': bool(index_ld),
    'index_nail_salon_schema': 'NailSalon' in content and 'BeautySalon' in content,
    'index_schema_real_address': '"streetAddress": "121/4 A, Thaladuwa Road"' in content and 'Sweet Home' not in content,
    'index_schema_opening_hours': 'OpeningHoursSpecification' in content,
    'index_schema_services': 'OfferCatalog' in content,
    'index_schema_email_correct': 'pleesha59@gmail.com' in content,
    'gallery_json_ld_valid': bool(gallery_ld),
    'gallery_breadcrumb_schema': 'BreadcrumbList' in content_gallery,

    # Images: optimised, described, sized
    'index_images_webp': 'images/web/1_web-1400.webp' in content and 'src="images/3.jpeg"' not in content,
    'gallery_images_webp': 'src="images/classic_' not in content_gallery and content_gallery.count('images/web/') >= 60,
    'index_local_images_exist': local_images_exist(content),
    'gallery_local_images_exist': local_images_exist(content_gallery),
    'gallery_alt_texts_unique': len(set(re.findall(r'<img src="images/web/[^"]+" alt="([^"]+)"', content_gallery))) >= 60,
    'no_empty_alt_on_content_images': not re.search(r'<img(?![^>]*aria-hidden)[^>]*alt=""', content + content_gallery),

    # Speed: nothing render-blocking from JS
    'index_scripts_deferred': not re.search(r'<script src=', content),
    'gallery_scripts_deferred': not re.search(r'<script src=', content_gallery),
    'icons_single_stylesheet': 'phosphor-icons/web@2.1.1/src/regular/style.css' in content and 'src/index.js' not in content,

    # Footer
    'index_footer_present': '<footer class="lux-footer"' in content,
    'gallery_footer_present': '<footer class="lux-footer"' in content_gallery,
    'index_footer_css': '.lux-footer {' in content,
    'gallery_footer_css': '.lux-footer {' in content_gallery,

    # Google Search Favicon & Icon Compliance Checks
    'favicon_ico_exists': exists('favicon.ico'),
    'favicon_48_exists': exists('favicon-48x48.png'),
    'favicon_96_exists': exists('favicon-96x96.png'),
    'favicon_192_exists': exists('favicon-192x192.png'),
    'apple_touch_icon_exists': exists('apple-touch-icon.png'),
    'manifest_exists': exists('site.webmanifest'),
    'index_has_favicon_ico': 'href="/favicon.ico"' in content,
    'index_has_favicon_48': 'href="/favicon-48x48.png"' in content and 'sizes="48x48"' in content,
    'index_has_apple_touch_icon': 'rel="apple-touch-icon"' in content,
    'gallery_has_favicon_ico': 'href="/favicon.ico"' in content_gallery,
    'gallery_has_favicon_48': 'href="/favicon-48x48.png"' in content_gallery and 'sizes="48x48"' in content_gallery,
    'gallery_has_apple_touch_icon': 'rel="apple-touch-icon"' in content_gallery,
}

all_pass = True
for k, v in checks.items():
    status = 'PASS' if v else 'FAIL'
    if not v:
        all_pass = False
    print(f'{status}: {k}')

print()
print('ALL CHECKS PASSED' if all_pass else 'SOME CHECKS FAILED')
