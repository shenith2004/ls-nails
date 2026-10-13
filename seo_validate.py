content = open(r'd:\Documents\WEBSITES\LS\index.html', encoding='utf-8').read()
content_gallery = open(r'd:\Documents\WEBSITES\LS\gallery.html', encoding='utf-8').read()

checks = {
    'index_title_negombo': 'Negombo' in content,
    'index_title_no_london': 'London' not in content,
    'index_canonical': 'rel="canonical"' in content,
    'index_og_title': 'og:title' in content,
    'index_og_image': 'og:image' in content,
    'index_twitter_card': 'twitter:card' in content,
    'index_preconnect_fonts': 'preconnect' in content and 'fontshare' in content,
    'index_json_ld': 'application/ld+json' in content,
    'index_beauty_salon_schema': 'BeautySalon' in content,
    'index_footer': '<footer' in content,
    'index_form_name_attr': 'name="name"' in content,
    'index_broken_img_fixed': 'IMG-20260913' not in content,
    'index_robots_meta': 'index, follow' in content,
    'gallery_canonical': 'rel="canonical"' in content_gallery,
    'gallery_og_title': 'og:title' in content_gallery,
    'gallery_twitter_card': 'twitter:card' in content_gallery,
    'gallery_json_ld': 'application/ld+json' in content_gallery,
    'gallery_breadcrumb_schema': 'BreadcrumbList' in content_gallery,
    'gallery_footer': '<footer' in content_gallery,
    'gallery_preconnect': 'preconnect' in content_gallery,
}

all_pass = True
for k, v in checks.items():
    status = 'PASS' if v else 'FAIL'
    if not v:
        all_pass = False
    print(f'{status}: {k}')

print()
print('ALL CHECKS PASSED' if all_pass else 'SOME CHECKS FAILED')

# Also print robots.txt and sitemap.xml content
print('\n--- robots.txt ---')
print(open(r'd:\Documents\WEBSITES\LS\robots.txt').read())
print('--- sitemap.xml ---')
print(open(r'd:\Documents\WEBSITES\LS\sitemap.xml').read()[:300])
