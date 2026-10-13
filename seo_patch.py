content = open(r'd:\Documents\WEBSITES\LS\gallery.html', encoding='utf-8').read()

# Find the footer block
footer_start = content.find('  <!-- FOOTER -->')
footer_end = content.find('  <script>document.getElementById(\'footer-year\')', footer_start)
footer_end = content.find('\n', footer_end) + 1  # include the newline after this script tag

old_footer = content[footer_start:footer_end]
print('Old footer length:', len(old_footer))
print('First 100 chars:', repr(old_footer[:100]))

new_footer = '''  <!-- FOOTER -->
  <footer class="site-footer" role="contentinfo">
    <div class="site-container">
      <div class="footer-inner">

        <!-- Brand -->
        <div class="footer-brand">
          <a href="index.html" aria-label="LS Nails Studio home">
            <img src="images/LOGO.png" alt="LS Nails Studio logo" />
            <span class="footer-brand-name">Nails Studio</span>
          </a>
          <p class="footer-tagline">Negombo, Sri Lanka &middot; Est. 2023</p>
        </div>

        <!-- Nav -->
        <nav class="footer-nav" aria-label="Footer navigation">
          <ul>
            <li><a href="index.html#services">Services</a></li>
            <li><a href="index.html#portfolio">Portfolio</a></li>
            <li><a href="gallery.html" style="color:#B8926A">Gallery</a></li>
            <li><a href="index.html#studio">Studio</a></li>
            <li><a href="index.html#contact">Book</a></li>
          </ul>
        </nav>

        <!-- Socials -->
        <div class="footer-socials">
          <a href="https://www.instagram.com/__ls_nails__" target="_blank" rel="noopener noreferrer" aria-label="LS Nails Studio on Instagram">
            <i class="ph ph-instagram-logo"></i>
          </a>
          <a href="https://www.facebook.com/profile.php?id=100091059944803" target="_blank" rel="noopener noreferrer" aria-label="LS Nails Studio on Facebook">
            <i class="ph ph-facebook-logo"></i>
          </a>
          <a href="https://www.tiktok.com/@ls_nails__" target="_blank" rel="noopener noreferrer" aria-label="LS Nails Studio on TikTok">
            <i class="ph ph-tiktok-logo"></i>
          </a>
        </div>

      </div>
      <p class="footer-copy">&copy; <span id="footer-year"></span> LS Nails Studio. All rights reserved.</p>
    </div>
  </footer>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
'''

content = content[:footer_start] + new_footer + content[footer_end:]
open(r'd:\Documents\WEBSITES\LS\gallery.html', 'w', encoding='utf-8').write(content)
print('Done. New footer in place.')
print('site-footer in file:', 'site-footer' in open(r'd:\Documents\WEBSITES\LS\gallery.html', encoding='utf-8').read())
