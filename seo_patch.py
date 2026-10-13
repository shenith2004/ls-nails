import re

content = open(r'd:\Documents\WEBSITES\LS\index.html', encoding='utf-8').read()

# Fix title - remove "London"
content = content.replace(
    '<title>LS Nails Studio \u2014 Premium Nail Art & Beauty London</title>',
    '<title>LS Nails Studio \u2014 Premium Nail Art, Lash Extensions & Waxing in Negombo</title>\r\n  <link rel="canonical" href="https://ls-nails.pages.dev/" />\r\n  <meta name="robots" content="index, follow">\r\n  <meta name="author" content="LS Nails Studio">'
)

# Fix meta description (multiline)
content = re.sub(
    r'<meta name="description"\s*\n\s*content="LS Nails Studio[^"]*">',
    '<meta name="description" content="LS Nails Studio in Negombo \u2014 precision nail extensions, gel nail art, eyelash extensions, and waxing. Book your appointment today.">',
    content
)

# Add OG + Twitter + preconnect before font stack
og_block = '''
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="LS Nails Studio">
  <meta property="og:title" content="LS Nails Studio \u2014 Premium Nail Art &amp; Beauty in Negombo">
  <meta property="og:description" content="Precision nail extensions, gel nail art, eyelash extensions, and waxing in Negombo. A quiet, intentional studio built for meticulous craft.">
  <meta property="og:url" content="https://ls-nails.pages.dev/">
  <meta property="og:image" content="https://ls-nails.pages.dev/images/1_web.jpg">
  <meta property="og:image:alt" content="LS Nails Studio \u2014 dark red nail extensions close-up">
  <meta property="og:locale" content="en_LK">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="LS Nails Studio \u2014 Premium Nail Art &amp; Beauty in Negombo">
  <meta name="twitter:description" content="Precision nail extensions, gel nail art, eyelash extensions, and waxing in Negombo. Book your appointment today.">
  <meta name="twitter:image" content="https://ls-nails.pages.dev/images/1_web.jpg">
  <meta name="twitter:image:alt" content="LS Nails Studio \u2014 dark red nail extensions close-up">

  <!-- Preconnect for external resources -->
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">

  '''

content = content.replace('  <!-- Premium Font Stack -->', og_block + '<!-- Premium Font Stack -->')

open(r'd:\Documents\WEBSITES\LS\index.html', 'w', encoding='utf-8').write(content)
print('SUCCESS')
print('Title:', content[content.find('<title>'):content.find('</title>')+8])
