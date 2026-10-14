import os

content = open(r'd:\Documents\WEBSITES\LS\index.html', encoding='utf-8').read()
content_gallery = open(r'd:\Documents\WEBSITES\LS\gallery.html', encoding='utf-8').read()
robots = open(r'd:\Documents\WEBSITES\LS\robots.txt', encoding='utf-8').read()
sitemap = open(r'd:\Documents\WEBSITES\LS\sitemap.xml', encoding='utf-8').read()

checks = {
    # Domain & Canonical Checks
    'index_canonical_lsnails_lk': 'href="https://lsnails.lk/"' in content,
    'gallery_canonical_lsnails_lk': 'href="https://lsnails.lk/gallery.html"' in content_gallery,
    'robots_sitemap_lsnails_lk': 'https://lsnails.lk/sitemap.xml' in robots,
    'sitemap_home_lsnails_lk': '<loc>https://lsnails.lk/</loc>' in sitemap,
    'sitemap_gallery_lsnails_lk': '<loc>https://lsnails.lk/gallery.html</loc>' in sitemap,
    
    # No rogue/pages.dev domains
    'no_pages_dev_in_index': 'pages.dev' not in content,
    'no_pages_dev_in_gallery': 'pages.dev' not in content_gallery,
    'no_pages_dev_in_robots': 'pages.dev' not in robots,
    'no_pages_dev_in_sitemap': 'pages.dev' not in sitemap,
    'no_london_in_index': 'London' not in content,
    'no_co_uk_in_index': 'lsnails.co.uk' not in content,

    # SEO metadata
    'index_title_negombo': 'Negombo' in content,
    'index_og_title': 'og:title' in content,
    'index_og_url_lk': 'property="og:url" content="https://lsnails.lk/"' in content,
    'index_og_image_lk': 'property="og:image" content="https://lsnails.lk/images/1_web.jpg"' in content,
    'index_twitter_card': 'twitter:card' in content,
    'index_geo_tags': 'name="geo.placename" content="Negombo"' in content,
    'index_json_ld': 'application/ld+json' in content,
    'index_beauty_salon_schema': 'BeautySalon' in content,
    'index_schema_email_correct': 'pleesha59@gmail.com' in content,
    'index_robots_meta': 'index, follow' in content,

    # Gallery SEO
    'gallery_og_title': 'og:title' in content_gallery,
    'gallery_og_url_lk': 'property="og:url" content="https://lsnails.lk/gallery.html"' in content_gallery,
    'gallery_twitter_card': 'twitter:card' in content_gallery,
    'gallery_json_ld': 'application/ld+json' in content_gallery,
    'gallery_breadcrumb_schema': 'BreadcrumbList' in content_gallery,

    # Footer Robustness Checks
    'index_footer_present': '<footer' in content,
    'index_footer_style_tag_css': '.site-footer {' in content and 'linear-gradient' in content,
    'index_footer_inline_fallback': 'style="background: linear-gradient(135deg, #2C1F10 0%, #1A1208 100%)' in content,
    'index_footer_logo_constrained': 'max-width: 120px' in content,
    'gallery_footer_present': '<footer' in content_gallery,
    'gallery_footer_style_tag_css': '.site-footer {' in content_gallery and 'linear-gradient' in content_gallery,
    'gallery_footer_inline_fallback': 'style="background: linear-gradient(135deg, #2C1F10 0%, #1A1208 100%)' in content_gallery,
    'gallery_footer_logo_constrained': 'max-width: 120px' in content_gallery,

    # Google Search Favicon & Icon Compliance Checks
    'favicon_ico_exists': os.path.exists(r'd:\Documents\WEBSITES\LS\favicon.ico'),
    'favicon_48_exists': os.path.exists(r'd:\Documents\WEBSITES\LS\favicon-48x48.png'),
    'favicon_96_exists': os.path.exists(r'd:\Documents\WEBSITES\LS\favicon-96x96.png'),
    'favicon_192_exists': os.path.exists(r'd:\Documents\WEBSITES\LS\favicon-192x192.png'),
    'apple_touch_icon_exists': os.path.exists(r'd:\Documents\WEBSITES\LS\apple-touch-icon.png'),
    'manifest_exists': os.path.exists(r'd:\Documents\WEBSITES\LS\site.webmanifest'),
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
