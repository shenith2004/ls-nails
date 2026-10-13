import re

content = open(r'd:\Documents\WEBSITES\LS\gallery.html', encoding='utf-8').read()

# Fix title
content = content.replace(
    '<title>Gallery \u2014 LS Nails Studio | Classic, Graphic & Maximalist</title>',
    '<title>Nail Art Gallery \u2014 LS Nails Studio | Classic, Graphic & Maximalist Designs</title>'
)

# Add canonical + robots after charset/viewport
old_viewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
new_viewport = '''<meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="https://ls-nails.pages.dev/gallery.html" />
  <meta name="robots" content="index, follow">
  <meta name="author" content="LS Nails Studio">'''
content = content.replace(old_viewport, new_viewport)

# Fix meta description
content = re.sub(
    r'<meta name="description"\s*\n\s*content="Browse the full portfolio[^"]*">',
    '<meta name="description" content="Browse the full LS Nails Studio portfolio \u2014 Classic, Graphic, and Maximalist nail art collections from our Negombo studio. Over 60 photos of precision nail work.">',
    content
)

# Add OG + Twitter + preconnect before fontshare link
og_block = '''  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="LS Nails Studio">
  <meta property="og:title" content="Nail Art Gallery \u2014 LS Nails Studio">
  <meta property="og:description" content="Browse Classic, Graphic, and Maximalist nail art collections from LS Nails Studio in Negombo. Over 60 portfolio photos.">
  <meta property="og:url" content="https://ls-nails.pages.dev/gallery.html">
  <meta property="og:image" content="https://ls-nails.pages.dev/images/classic_09.png">
  <meta property="og:image:alt" content="Classic nail art close-up from LS Nails Studio">
  <meta property="og:locale" content="en_LK">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Nail Art Gallery \u2014 LS Nails Studio">
  <meta name="twitter:description" content="Browse Classic, Graphic, and Maximalist nail art from our Negombo studio.">
  <meta name="twitter:image" content="https://ls-nails.pages.dev/images/classic_09.png">
  <meta name="twitter:image:alt" content="Classic nail art close-up from LS Nails Studio">

  <!-- Preconnect for external resources -->
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "LS Nails Studio \u2014 Portfolio Gallery",
    "description": "Classic, Graphic, and Maximalist nail art portfolio from LS Nails Studio in Negombo, Sri Lanka.",
    "url": "https://ls-nails.pages.dev/gallery.html",
    "author": {
      "@type": "BeautySalon",
      "name": "LS Nails Studio",
      "url": "https://ls-nails.pages.dev/",
      "@id": "https://ls-nails.pages.dev/#business"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "LS Nails Studio",
      "url": "https://ls-nails.pages.dev/"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://ls-nails.pages.dev/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Gallery",
          "item": "https://ls-nails.pages.dev/gallery.html"
        }
      ]
    }
  }
  </script>

  '''
content = content.replace('  <link href="https://api.fontshare.com', og_block + '<link href="https://api.fontshare.com')

# Fix Phosphor icons to versioned URL
content = content.replace(
    '<script src="https://unpkg.com/@phosphor-icons/web"></script>',
    '<script src="https://unpkg.com/@phosphor-icons/web@2.1.1/src/index.js" type="module"></script>'
)

open(r'd:\Documents\WEBSITES\LS\gallery.html', 'w', encoding='utf-8').write(content)
print('SUCCESS')
print('Title:', content[content.find('<title>'):content.find('</title>')+8])
print('Canonical:', content[content.find('canonical'):content.find('canonical')+80])
