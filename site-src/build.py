import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "medical-store"
OUT.mkdir(parents=True, exist_ok=True)

css = (ROOT / "styles.css").read_text()
js = (ROOT / "app.js").read_text()


def img_uri(name):
    p = ROOT / "img" / name
    if not p.exists():
        return ""
    mime = "png" if name.endswith(".png") else "jpeg"
    return "data:image/" + mime + ";base64," + base64.b64encode(p.read_bytes()).decode("ascii")


IMG_HERO = img_uri("hero.jpg")
IMG_STORE = img_uri("store.jpg")
IMG_DESK = img_uri("desk.jpg")
# FIX-MEDIA: real brand logo and monogram supplied by the client
IMG_LOGO = img_uri("logo.jpg")
IMG_MARK = img_uri("mark.png")
# FIX-MEDIA: GST registration certificate displayed in the documents section
DOC_GST_PDF = "data:application/pdf;base64," + base64.b64encode((ROOT / "img" / "gst-certificate.pdf").read_bytes()).decode("ascii")
DOC_GST_P1 = img_uri("gst-p1.jpg")
DOC_GST_P2 = img_uri("gst-p2.jpg")
DOC_GST_P3 = img_uri("gst-p3.jpg")

# FIX-MEDIA: clean percent encoded inline SVG placeholder used by img onerror fallback
IMG_FALLBACK = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23eef3ef%22%2F%3E%3Crect%20x%3D%2222%22%20y%3D%2222%22%20width%3D%22756%22%20height%3D%22556%22%20rx%3D%2226%22%20fill%3D%22none%22%20stroke%3D%22%230e5c4a%22%20stroke-width%3D%225%22%20stroke-dasharray%3D%2218%2013%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22252%22%20r%3D%2248%22%20fill%3D%22%23c46a3b%22%20opacity%3D%220.55%22%2F%3E%3Cpath%20d%3D%22M190%20440l130-140%2096%20106%2072-72%20132%20142H190z%22%20fill%3D%22%230e5c4a%22%20opacity%3D%220.35%22%2F%3E%3C%2Fsvg%3E'

FAVICON = "data:image/png;base64," + base64.b64encode((ROOT / "img" / "mark.png").read_bytes()).decode("ascii")
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>__TITLE__</title>
<meta name="description" content="__DESC__">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Levana Life Sciences">
<meta property="og:title" content="__TITLE__">
<meta property="og:description" content="__DESC__">
<meta name="theme-color" content="#0e5c4a">
<link rel="icon" href="__FAVICON__">
__FONTS__
<style>
__CSS__</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<div class="announce">
<div class="container">
<span>Licensed pharmacy (20B / 21B) in Meerut, Uttar Pradesh</span>
<div class="announce__right">
<span>Same-day delivery in Meerut</span>
<a href="tel:+919876543210">Helpline +91 98765 43210</a>
</div>
</div>
</div>
<header class="site-header">
<div class="container header-inner">
<a class="brand" href="index.html" aria-label="Levana Life Sciences home">
<!-- FIX-MEDIA: client logo embedded as data URI with size hints and SVG fallback -->
<img class="brand__logo" src="__IMG_LOGO__" alt="Levana Lifesciences" width="640" height="309" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'">
</a>
<!-- FIX-NAV: links collapse into the hamburger dropdown below 1024px -->
<nav class="site-nav" id="site-nav" aria-label="Main navigation">
<ul>
__NAV__
</ul>
</nav>
<div class="header-actions">
<button class="icon-btn js-open-cart" type="button" aria-label="Open shopping cart"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M3 4h2.2l2.3 12.2a1.8 1.8 0 001.8 1.5h8.6a1.8 1.8 0 001.8-1.4L21.5 8H6"/><circle cx="10" cy="21" r="1.6" fill="currentColor"/><circle cx="18" cy="21" r="1.6" fill="currentColor"/></svg><span class="cart-count" data-cart-count hidden>0</span></button>
<a class="btn btn--primary btn--sm" href="prescriptions.html">Upload Rx</a>
<button class="nav-toggle" id="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="site-nav"><span></span></button>
</div>
</div>
</header>
<main id="main">
__BODY__
</main>
<footer class="site-footer">
<div class="container">
<div class="footer-grid">
<div class="footer-brand">
<span class="brand__name">Levana</span>
<span class="brand__sub">Life Sciences</span>
<p>Your trusted licensed medical store in Meerut, Uttar Pradesh. Genuine medicines, pharmacist-verified orders and friendly service, online and in-store.</p>
<div class="footer-legal"><strong>Drug Licence</strong> 20B / 21B, UP/20B-21B/2026/1876<br><strong>GSTIN</strong> 09AANFL0727C1ZG</div>
</div>
<div>
<h4>Explore</h4>
<ul class="footer-links">
<li><a href="medicines.html">All medicines</a></li>
<li><a href="prescriptions.html">Upload prescription</a></li>
<li><a href="about.html">About and compliance</a></li>
<li><a href="contact.html">Contact us</a></li>
</ul>
</div>
<div>
<h4>Policies</h4>
<ul class="footer-links">
<li><a href="#" class="js-demo-doc">Privacy policy (DPDP)</a></li>
<li><a href="#" class="js-demo-doc">Terms and conditions</a></li>
<li><a href="#" class="js-demo-doc">Shipping policy</a></li>
<li><a href="#" class="js-demo-doc">Return and refund policy</a></li>
<li><a href="#" class="js-demo-doc">Grievance redressal</a></li>
</ul>
</div>
<div>
<h4>Visit us</h4>
<ul class="footer-contact">
<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><span>Unit No. S-002 (LIG), Second Floor, C-Block, Apex City Colony, Village Rampur Pawati, Tehsil and District Meerut, Uttar Pradesh</span></li>
<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z"/></svg><span><a href="tel:+919876543210">+91 98765 43210</a></span></li>
<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/></svg><span><a href="mailto:levanalifesciences26@gmail.com">levanalifesciences26@gmail.com</a></span></li>
<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg><span>Open daily, 8:00 AM to 11:00 PM</span></li>
</ul>
</div>
</div>
<div class="footer-bottom">
<p>&copy; <span id="year">2026</span> Levana Life Sciences. All rights reserved.</p>
</div>
</div>
</footer>
<div class="overlay" id="overlay" hidden></div>
<aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">
<div class="cart-drawer__head">
<h2 id="cart-title">Your cart</h2>
<button class="cart-close" id="cart-close" type="button" aria-label="Close cart">&times;</button>
</div>
<div class="cart-items" id="cart-items"></div>
<div class="cart-drawer__foot">
<p class="delivery-note" id="delivery-note">Free delivery on orders above &#8377;499</p>
<div class="cart-total"><span>Subtotal</span><strong id="cart-subtotal">&#8377;0</strong></div>
<button class="btn btn--primary btn--block js-checkout" type="button">Proceed to checkout</button>
<p class="cart-fine">Taxes included. Prescription items are dispatched only after pharmacist verification.</p>
</div>
</aside>
<div class="toast-wrap" id="toast-wrap" aria-live="polite" aria-atomic="true"></div>
<button class="back-to-top" id="back-to-top" type="button" aria-label="Back to top">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M18 15l-6-6-6 6"/></svg>
</button>
<script>
__JS__</script>
</body>
</html>
"""

NAV = [
    ("index.html", "Home", "home"),
    ("medicines.html", "Medicines", "medicines"),
    ("prescriptions.html", "Prescriptions", "prescriptions"),
    ("about.html", "About", "about"),
    ("contact.html", "Contact", "contact"),
]


def nav_html(active):
    parts = []
    for url, label, key in NAV:
        cls = ' class="is-active"' if key == active else ""
        parts.append('<li><a href="' + url + '"' + cls + '>' + label + '</a></li>')
    return "\n".join(parts)


BODY_HOME = """
<section class="hero">
<div class="container hero__inner">
<div class="hero__copy">
<span class="label">Licensed pharmacy in Meerut</span>
<h1>Genuine medicines, <em>verified with care.</em></h1>
<p class="hero__lead">Levana Life Sciences brings your neighbourhood pharmacy online. Every prescription order is checked by a registered pharmacist, and every product is sourced from licensed suppliers.</p>
<div class="hero__actions">
<a class="btn btn--primary" href="medicines.html">Shop medicines</a>
<a class="link-arrow" href="prescriptions.html">Upload a prescription <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
</div>
<div class="hero__facts">
<div class="hero-fact"><strong>500+</strong><span>Products in catalogue</span></div>
<div class="hero-fact"><strong>30 to 60 min</strong><span>Delivery in Meerut</span></div>
<div class="hero-fact"><strong>Now open</strong><span>In Apex City Colony, Meerut</span></div>
</div>
</div>
<div class="hero-panel">
<!-- FIX-MEDIA: embedded photo with size hints and an inline SVG fallback -->
<img class="hero-panel__img" src="__IMG_HERO__" alt="Shelves of genuine medicines at the Levana Life Sciences pharmacy counter" width="1024" height="1536" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'">
<div class="hero-panel__veil"></div>
<span class="hero-panel__badge" aria-hidden="true"><img src="__IMG_MARK__" alt="" width="96" height="96" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'"></span>
<div class="status-card">
<span class="status-card__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M7.5 12.5l3 3 6-6.5"/><circle cx="12" cy="12" r="10"/></svg></span>
<div><strong>Prescription verified</strong><span>By A. Sharma, B.Pharm</span></div>
</div>
<div class="status-card status-card--right">
<span class="status-card__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M1 16V6a2 2 0 012-2h11v12H1zM14 9h4l4 4v3h-8V9z"/><circle cx="6.5" cy="18" r="2.2"/><circle cx="17.5" cy="18" r="2.2"/></svg></span>
<div><strong>Out for delivery</strong><span>Order 1842, arriving in 24 min</span></div>
</div>
</div>
</div>
</section>
<div class="factbar">
<div class="container">
<div class="factbar__item"><strong>100%</strong><span>Genuine medicines</span></div>
<div class="factbar__item"><strong>Pharmacist</strong><span>Verified orders</span></div>
<div class="factbar__item"><strong>Free delivery</strong><span>On orders above 499 rupees</span></div>
<div class="factbar__item"><strong>GST invoice</strong><span>With every order</span></div>
</div>
</div>
<section class="section" aria-labelledby="cat-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">Shop by category</span>
<h2 id="cat-title">Everything your family needs, <em>in one place.</em></h2>
</div>
<div class="sec-head__side"><p>From everyday essentials to wellness devices, all sourced from licensed manufacturers and distributors.</p></div>
</div>
<div class="cat-grid">
<a class="cat-card" href="medicines.html?cat=otc"><span class="cat-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="48" height="48"><rect x="6" y="18" width="36" height="13" rx="6.5" transform="rotate(-45 24 24)" stroke="currentColor" stroke-width="2"/><path d="M15 20.5l7.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><strong>OTC medicines</strong><span>Everyday care without a prescription</span></a>
<a class="cat-card" href="medicines.html?cat=rx"><span class="cat-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="48" height="48"><rect x="10" y="6" width="28" height="36" rx="5" stroke="currentColor" stroke-width="2"/><path d="M17 18h9a4 4 0 010 8h-9V18zm0 8l10 12M28 26l-11 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><strong>Prescription</strong><span>Verified by our pharmacist</span></a>
<a class="cat-card" href="medicines.html?cat=ayurveda"><span class="cat-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="48" height="48"><path d="M39 7C20 7 10 17.5 10 30c0 4 1.4 7 2.8 8.4C17 26.5 25 20 33.2 16.8 25 22 19 29.5 15.8 41.5 28.5 43.5 39 32.5 39 7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13 41c5-2.5 9.5-5 13.5-9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><strong>Ayurveda</strong><span>Trusted herbal wellness</span></a>
<a class="cat-card" href="medicines.html?cat=devices"><span class="cat-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="48" height="48"><rect x="13" y="5" width="22" height="38" rx="6" stroke="currentColor" stroke-width="2"/><rect x="18.5" y="11" width="11" height="13" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="33.5" r="2.6" stroke="currentColor" stroke-width="2"/></svg></span><strong>Health devices</strong><span>BP monitors, thermometers and more</span></a>
<a class="cat-card" href="medicines.html?cat=personal"><span class="cat-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="48" height="48"><rect x="5" y="13" width="38" height="26" rx="5" stroke="currentColor" stroke-width="2"/><path d="M18 13v-2.5A3.5 3.5 0 0121.5 7h5a3.5 3.5 0 013.5 3.5V13M24 20v12M18 26h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><strong>Personal care</strong><span>First-aid and daily hygiene</span></a>
</div>
</div>
</section>
<section class="section section--flush" aria-labelledby="feat-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">Customer favourites</span>
<h2 id="feat-title">Popular right now at <em>Levana.</em></h2>
</div>
<div class="sec-head__side">
<p>Transparent pricing with printed MRP on every product. What you see is what you pay.</p>
<a class="link-arrow" href="medicines.html">View all medicines <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
</div>
</div>
<div class="product-grid" id="product-grid" data-limit="6"></div>
<div class="empty-state" id="empty-state" hidden><strong>No medicines found</strong><p>Call us at <a href="tel:+919876543210">+91 98765 43210</a> and we will arrange it for you.</p></div>
</div>
</section>
<section class="section section--flush" aria-labelledby="how-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">How it works</span>
<h2 id="how-title">Ordering made <em>simple.</em></h2>
</div>
<div class="sec-head__side"><p>Four clear steps, designed so that anyone can order comfortably, on any phone or computer.</p></div>
</div>
<div class="steps-row">
<div class="step-item reveal"><div class="step-item__num">01</div><h3>Search and add</h3><p>Find medicines by brand name or salt, then add them to your cart.</p></div>
<div class="step-item reveal"><div class="step-item__num">02</div><h3>Upload prescription</h3><p>For prescription items, upload a photo or PDF of your doctor&#39;s prescription.</p></div>
<div class="step-item reveal"><div class="step-item__num">03</div><h3>Pharmacist verifies</h3><p>Our registered pharmacist reviews it and confirms your order by call or WhatsApp.</p></div>
<div class="step-item reveal"><div class="step-item__num">04</div><h3>Delivered to you</h3><p>Receive your order at home with a GST invoice, or collect it from our store.</p></div>
</div>
</div>
</section>
<section class="section section--flush" aria-labelledby="trust-title">
<div class="container split">
<div>
<span class="label">Trust and compliance</span>
<h2 id="trust-title">Licensed, verified and <em>transparent.</em></h2>
<p>We display our credentials openly, the same way we display our prices. Original documents are available at our store for anyone who wishes to verify them in person.</p>
<a class="link-arrow" href="about.html">Read about our compliance <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
</div>
<dl class="spec-rows">
<div class="spec-row"><dt>Drug licence</dt><dd>Forms 20B and 21B, Uttar Pradesh</dd></div>
<div class="spec-row"><dt>Pharmacist</dt><dd>B.Pharm</dd></div>
<div class="spec-row"><dt>GSTIN</dt><dd>09AANFL0727C1ZG</dd></div>
<div class="spec-row"><dt>Records</dt><dd>Retained securely for 3+ years</dd></div>
<div class="spec-row"><dt>Privacy</dt><dd>Aligned with the DPDP Act</dd></div>
</dl>
</div>
</section>
<section class="section section--flush" aria-labelledby="love-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">Customer stories</span>
<h2 id="love-title">What our first customers <em>say.</em></h2>
</div>
</div>
<div class="quotes">
<figure class="quote reveal"><div class="quote__mark" aria-hidden="true">&ldquo;</div><p>Ordered my father&#39;s BP medicines at night and they arrived the next morning. The pharmacist even called to confirm the prescription. Genuine service.</p><div class="quote__stars" aria-label="Rated 5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><footer><span class="quote__avatar" aria-hidden="true">SD</span><span class="quote__who"><strong>Sunita Devi</strong><span>Meerut</span></span></footer></figure>
<figure class="quote reveal"><div class="quote__mark" aria-hidden="true">&ldquo;</div><p>The website is so simple that I ordered from my phone without any help. Prices are clear and the GST bill came on WhatsApp. Highly recommended.</p><div class="quote__stars" aria-label="Rated 5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><footer><span class="quote__avatar" aria-hidden="true">RM</span><span class="quote__who"><strong>Rahul Mehrotra</strong><span>Meerut</span></span></footer></figure>
<figure class="quote reveal"><div class="quote__mark" aria-hidden="true">&ldquo;</div><p>Uploading my prescription took one minute and the correct medicines arrived the same evening. Knowing a real pharmacist checks every order gives great peace of mind.</p><div class="quote__stars" aria-label="Rated 5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><footer><span class="quote__avatar" aria-hidden="true">AR</span><span class="quote__who"><strong>Anjali Rawat</strong><span>Rampur Pawati</span></span></footer></figure>
</div>
</div>
</section>
<section class="cta-band" aria-label="Contact us">
<div class="container">
<div>
<h2>Not sure which medicine you need?</h2>
<p>Talk to our pharmacist. We will help you find the right product and confirm your prescription without any confusion.</p>
</div>
<div class="cta-band__actions">
<a class="btn btn--light" href="tel:+919876543210">Call now</a>
<a class="btn btn--outline-light" href="https://wa.me/919876543210" target="_blank" rel="noopener">Chat on WhatsApp</a>
</div>
</div>
</section>
"""

BODY_MEDICINES = """
<section class="page-head">
<div class="container">
<span class="label">Catalogue</span>
<h1>Medicines and health products.</h1>
<p class="page-head__lead">Search by brand name, salt or manufacturer. Prices include all taxes and every product comes from a licensed source.</p>
<form class="searchbar" id="catalog-search-form" role="search">
<input id="catalog-search" type="search" placeholder="Search by medicine, salt or company" aria-label="Search the catalogue" autocomplete="off">
<button type="submit">Search</button>
</form>
</div>
</section>
<section class="section" aria-label="Product catalogue">
<div class="container">
<div class="toolbar">
<div class="chips" id="filter-chips" role="group" aria-label="Filter by category"></div>
<div class="sortbox">
<label for="sort-select">Sort by</label>
<select id="sort-select">
<option value="featured">Popularity</option>
<option value="price-low">Price: low to high</option>
<option value="price-high">Price: high to low</option>
<option value="discount">Best discount</option>
</select>
</div>
</div>
<p class="result-line" id="result-count" aria-live="polite"></p>
<div class="product-grid" id="product-grid"></div>
<div class="empty-state" id="empty-state" hidden><strong>No medicines found</strong><p>Try a different search or category, or call us at <a href="tel:+919876543210">+91 98765 43210</a>.</p></div>
<div class="info-strip">
<div class="info-strip__item"><strong>Prescription items</strong><p>Products marked &#34;Prescription required&#34; are dispatched only after our pharmacist verifies your prescription.</p></div>
<div class="info-strip__item"><strong>Fast local delivery</strong><p>Same-day delivery across Meerut in 30 to 60 minutes. Free delivery on orders above 499 rupees.</p></div>
<div class="info-strip__item"><strong>Need a medicine we do not list?</strong><p>Call our helpline and we will arrange it for you, often on the same day.</p></div>
<div class="info-strip__item"><strong>Ways to pay</strong><p>UPI, credit and debit cards, netbanking and Cash on Delivery. Online payments go through a licensed payment gateway and we never store your card details.</p></div>
</div>
</div>
</section>
"""

BODY_PRESCRIPTIONS = """
<section class="page-head">
<div class="container">
<span class="label">Prescriptions</span>
<h1>Upload your prescription, <em>we handle the rest.</em></h1>
<p class="page-head__lead">Fast, private and pharmacist-verified. Your documents are stored securely and are never shared with anyone.</p>
</div>
</section>
<section class="section" aria-label="Prescription upload">
<div class="container rx-layout">
<div class="rx-panel">
<h2>Submit a prescription</h2>
<p class="lead">JPG, PNG or PDF up to 5 MB. You can upload up to 5 pages.</p>
<div class="dropzone" id="rx-dropzone" role="button" tabindex="0" aria-label="Upload prescription: choose files or drag and drop here">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
<strong>Drag and drop your prescription here</strong>
<p>or click to browse your phone or computer</p>
</div>
<input id="rx-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple hidden>
<ul class="rx-file-list" id="rx-file-list" aria-live="polite"></ul>
<button class="btn btn--primary btn--block" id="rx-submit" type="button" disabled>Submit prescription</button>
<p class="note"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="24" height="24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/></svg><span>This is a demo, so files stay on your device. On the live site they will be uploaded over an encrypted connection and reviewed by our pharmacist within 30 minutes during store hours.</span></p>
</div>
<div>
<div class="media-frame media-frame--wide"><img src="__IMG_DESK__" alt="Prescription pad and stethoscope on a clean desk" width="1400" height="933" loading="lazy" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'"></div>
<div class="rx-steps">
<div class="rx-step reveal"><span class="rx-step__num" aria-hidden="true">1</span><div><h3>What we accept</h3><p>A valid prescription from a registered medical practitioner, with the doctor&#39;s name, signature and date. A clear photo taken with your phone is perfectly fine.</p></div></div>
<div class="rx-step reveal"><span class="rx-step__num" aria-hidden="true">2</span><div><h3>How verification works</h3><p>Our pharmacist matches each medicine on your prescription before dispatch. If we have a question, we call you and speak in plain language.</p></div></div>
<div class="rx-step reveal"><span class="rx-step__num" aria-hidden="true">3</span><div><h3>Your privacy matters</h3><p>Prescriptions are health data. They are stored in encrypted form, accessed only by our pharmacist, and deleted on request, in line with the DPDP Act.</p></div></div>
<div class="rx-step reveal"><span class="rx-step__num" aria-hidden="true">4</span><div><h3>What we never sell online</h3><p>Schedule X drugs, narcotics and habit-forming medicines are never sold through this website, in line with Indian regulations.</p></div></div>
</div>
</div>
</div>
</section>
<section class="section section--flush" aria-labelledby="rx-faq-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">Good to know</span>
<h2 id="rx-faq-title">Common questions about <em>prescriptions.</em></h2>
</div>
</div>
<div class="faq">
<details open><summary>Which medicines need a prescription?</summary><div class="faq__body">Products marked &#34;Prescription required&#34; on our website need a valid prescription from a registered doctor. These include Schedule H and H1 medicines such as antibiotics. Everyday OTC products, vitamins, ayurveda and devices do not need one.</div></details>
<details><summary>How long does verification take?</summary><div class="faq__body">Usually within 30 minutes during store hours (8:00 AM to 11:00 PM). After verification we confirm your order on call or WhatsApp, and then it is packed and dispatched.</div></details>
<details><summary>Can I send my prescription on WhatsApp instead?</summary><div class="faq__body">Yes. Send a clear photo to +91 98765 43210 along with your name and delivery address, and our pharmacist will take care of the rest.</div></details>
</div>
</div>
</section>
<section class="cta-band" aria-label="Contact us">
<div class="container">
<div>
<h2>Questions about your prescription?</h2>
<p>Our pharmacist is available daily from 8:00 AM to 11:00 PM to help you.</p>
</div>
<div class="cta-band__actions">
<a class="btn btn--light" href="tel:+919876543210">Call now</a>
<a class="btn btn--outline-light" href="contact.html">Contact us</a>
</div>
</div>
</section>
"""

BODY_ABOUT = """
<section class="page-head">
<div class="container">
<span class="label">About and compliance</span>
<h1>Trust built on <em>transparency.</em></h1>
<p class="page-head__lead">Levana Life Sciences is a licensed pharmacy serving Meerut and nearby areas. We display our credentials openly, the same way we display our prices.</p>
</div>
</section>
<section class="section" aria-label="Our story">
<div class="container split">
<div>
<span class="label">Our story</span>
<h2>A neighbourhood pharmacy, built for <em>modern life.</em></h2>
<p>Levana Life Sciences has just opened its doors in Apex City Colony, Rampur Pawati, with a simple promise: genuine medicines and honest advice. Ordering a refill is as simple as a phone tap, with a real pharmacist still checking every prescription.</p>
<p>We source only from licensed manufacturers and distributors, keep proper records, and follow the rules that govern pharmacy practice in India, online and offline.</p>
</div>
<div class="media-frame"><img src="__IMG_STORE__" alt="Interior of the Levana Life Sciences store with neatly organised medicine shelves" width="1400" height="933" loading="lazy" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'"></div>
</div>
<div class="container story-specs">
<dl class="spec-rows">
<div class="spec-row"><dt>Established</dt><dd>Newly opened in 2026, fully licensed</dd></div>
<div class="spec-row"><dt>Catalogue</dt><dd>12,000+ medicines and products</dd></div>
<div class="spec-row"><dt>Delivery</dt><dd>Meerut in 30 to 60 minutes</dd></div>
<div class="spec-row"><dt>Pharmacist on duty</dt><dd>Every day, 8 AM to 11 PM</dd></div>
<div class="spec-row"><dt>Store address</dt><dd>Unit No. S-002 (LIG), Second Floor, C-Block, Apex City Colony, Village Rampur Pawati, Tehsil and District Meerut, Uttar Pradesh</dd></div>
</dl>
</div>
</section>
<section class="section section--flush" aria-labelledby="cred-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">Our credentials</span>
<h2 id="cred-title">Documents you can <em>verify.</em></h2>
</div>
<div class="sec-head__side"><p>View the GST registration certificate below or download the complete certificate PDF.</p></div>
</div>
<div class="cred-grid">
<div class="cred-card reveal">
<div class="cred-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></svg></div>
<h3>Drug licence</h3>
<p>Retail sale of drugs under Forms 20B and 21B, issued by the Uttar Pradesh State Drugs Control Department.</p>
<span class="value">20B / 21B<br>UP/20B-21B/2026/1876</span>
<button class="btn btn--ghost btn--sm js-demo-doc" type="button">View certificate</button>
</div>
<div class="cred-card reveal">
<div class="cred-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 11h8M8 15h5"/></svg></div>
<h3>GST registration</h3>
<p>Every order comes with a proper GST tax invoice with HSN codes. There are no hidden charges.</p>
<span class="value">GSTIN<br>09AANFL0727C1ZG</span>
<a class="btn btn--ghost btn--sm" href="#documents">View certificate</a>
</div>
</div>
</div>
</section>
<!-- FIX: trust documents section with full certificate PDF download -->
<section class="section docs-section" id="documents" aria-labelledby="docs-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">Original documents</span>
<h2 id="docs-title">Our certificates, <em>on record.</em></h2>
</div>
<div class="sec-head__side"><p>Government issued verification copies for our customers. Personal photos on documents are withheld for privacy. Originals are kept at our store and can be inspected in person at any time.</p></div>
</div>
<div class="doc-card reveal">
<div class="doc-card__head">
<div>
<h3>GST Registration Certificate</h3>
<p class="doc-card__meta">Form GST REG-06, issued by the Government of India</p>
</div>
<div class="doc-card__actions">
<a class="btn btn--primary btn--sm" data-pdf-src="gst" href="__DOC_GST_PDF__" download="Levana-Lifesciences-GST-Registration.pdf">Download PDF</a>
<a class="btn btn--ghost btn--sm" data-pdf-href="copy" href="#documents" target="_blank" rel="noopener">Open full size</a>
</div>
</div>
<div class="spec-rows">
<div class="spec-row"><dt>GSTIN</dt><dd>09AANFL0727C1ZG</dd></div>
<div class="spec-row"><dt>Legal name</dt><dd>LEVANA LIFESCIENCES</dd></div>
<div class="spec-row"><dt>Valid from</dt><dd>02 April 2026, no expiry</dd></div>
<div class="spec-row"><dt>Issuing office</dt><dd>Assistant Commissioner, Gonda Sector-4</dd></div>
</div>
<div class="doc-pages">
<a class="doc-page" data-pdf-href="copy" href="#documents" target="_blank" rel="noopener" aria-label="Open GST certificate, page 1"><img src="__DOC_GST_P1__" alt="GST registration certificate, Form GST REG-06, page 1" width="820" height="1159" loading="lazy" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'"></a>
<a class="doc-page" data-pdf-href="copy" href="#documents" target="_blank" rel="noopener" aria-label="Open GST certificate, page 2"><img src="__DOC_GST_P2__" alt="GST registration certificate, Annexure A, page 2" width="820" height="1159" loading="lazy" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'"></a>
<a class="doc-page" data-pdf-href="copy" href="#documents" target="_blank" rel="noopener" aria-label="Open GST certificate, page 3"><img src="__DOC_GST_P3__" alt="GST registration certificate, Annexure B, page 3" width="820" height="1159" loading="lazy" onerror="this.onerror=null;this.src='__IMG_FALLBACK__'"></a>
</div>
</div>
</div>
</section>
<section class="section section--flush"
 aria-labelledby="rules-title">
<div class="container split">
<div class="prose">
<span class="label">How we stay compliant</span>
<h2 id="rules-title">The rules we follow, <em>every day.</em></h2>
<p>Online sale of medicines in India is governed by the Drugs and Cosmetics Act, 1940 and related rules. We operate to the strictest reading of these rules, and we build our systems so that compliance is automatic, not an afterthought.</p>
<ul>
<li>Prescription medicines (Schedule H and H1) are dispensed only against a valid prescription from a registered medical practitioner.</li>
<li>Schedule X drugs, narcotics and psychotropic substances are never sold through this website.</li>
<li>Maximum retail price (MRP) is displayed clearly on every product, as required by the NPPA price display rules.</li>
<li>Order records and prescription records are retained securely for at least 3 years.</li>
<li>Customer data is handled in line with the Digital Personal Data Protection (DPDP) Act, and stored in India wherever possible.</li>
<li>Identity documents of the owner are redacted and watermarked when published. Full ID proofs are never displayed publicly.</li>
<li>Every order is packed at our licensed premises under the supervision of our registered pharmacist.</li>
</ul>
</div>
<div>
<div class="spec-rows">
<div class="spec-row"><dt>Prescription check</dt><dd>Before every Rx dispatch</dd></div>
<div class="spec-row"><dt>Records retention</dt><dd>Minimum 3 years</dd></div>
<div class="spec-row"><dt>Data storage</dt><dd>India, encrypted at rest</dd></div>
<div class="spec-row"><dt>Price display</dt><dd>MRP shown on all products</dd></div>
<div class="spec-row"><dt>Prohibited online</dt><dd>Schedule X and narcotics</dd></div>
</div>
<div class="map-card">
<strong>Verify us in person</strong>
<p>Visit our store at Apex City Colony, Rampur Pawati, Meerut with any question about our licence, pharmacist or documents. We are open daily from 8:00 AM to 11:00 PM.</p>
<a href="contact.html">Get directions and contact details</a>
</div>
</div>
</div>
</section>
<section class="cta-band" aria-label="Contact us">
<div class="container">
<div>
<h2>Need to verify a document?</h2>
<p>Call our pharmacist and we will help you with any verification, including licence and registration details.</p>
</div>
<div class="cta-band__actions">
<a class="btn btn--light" href="tel:+919876543210">Call now</a>
<a class="btn btn--outline-light" href="contact.html">Contact us</a>
</div>
</div>
</section>
"""

BODY_CONTACT = """
<section class="page-head">
<div class="container">
<span class="label">Contact</span>
<h1>We are here to <em>help.</em></h1>
<p class="page-head__lead">Call us, message us or visit the store. A real person answers every call, every day from 8:00 AM to 11:00 PM.</p>
</div>
</section>
<section class="section" aria-label="Contact options">
<div class="container contact-grid">
<div class="contact-cards">
<div class="contact-card reveal"><span class="contact-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z"/></svg></span><div><strong>Manager / Main contact</strong><p><a href="tel:+918219379566">+91 82193 79566</a></p></div></div>
<div class="contact-card reveal"><span class="contact-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M21 11.5a8.4 8.4 0 01-12.6 7.3L3 20.5l1.8-5.2A8.5 8.5 0 1121 11.5z"/></svg></span><div><strong>WhatsApp</strong><p><a href="https://wa.me/919876543210" target="_blank" rel="noopener">Chat with us on WhatsApp</a></p></div></div>
<div class="contact-card reveal"><span class="contact-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/></svg></span><div><strong>Harshit Pandey</strong><p><a href="tel:+919565796439">+91 95657 96439</a><br><a href="mailto:hp4961535@gmail.com">hp4961535@gmail.com</a></p></div></div>
<div class="contact-card reveal"><span class="contact-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/></svg></span><div><strong>Aditya Gupta</strong><p><a href="tel:+919336463634">+91 93364 63634</a><br><a href="mailto:2005adityag@gmail.com">2005adityag@gmail.com</a></p></div></div>
<div class="contact-card reveal"><span class="contact-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></span><div><strong>Store hours</strong><p>Open daily, 8:00 AM to 11:00 PM</p></div></div>
<div class="map-card">
<strong>Visit our store</strong>
<p>Unit No. S-002 (LIG), Second Floor, C-Block, Apex City Colony, Village Rampur Pawati, Tehsil and District Meerut, Uttar Pradesh.</p>
<a href="https://maps.google.com/?q=Apex+City+Colony+Rampur+Pawati+Meerut" target="_blank" rel="noopener">Open in Google Maps</a>
</div>
</div>
<div class="form-box">
<h2>Send us a message</h2>
<p class="lead">We usually reply within a few hours during store hours.</p>
<form class="form-grid" id="contact-form">
<div class="field"><label for="cf-name">Your name</label><input id="cf-name" name="name" type="text" required autocomplete="name"></div>
<div class="field"><label for="cf-phone">Phone number</label><input id="cf-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel"></div>
<div class="field field--full"><label for="cf-email">Email (optional)</label><input id="cf-email" name="email" type="email" autocomplete="email"></div>
<div class="field field--full"><label for="cf-msg">How can we help?</label><textarea id="cf-msg" name="message" required></textarea></div>
<div class="field" hidden aria-hidden="true"><label for="cf-website">Leave this field empty</label><input id="cf-website" name="botcheck" type="text" tabindex="-1" autocomplete="off"></div>
<div class="field field--full"><button class="btn btn--primary btn--block" type="submit">Send message</button><p id="contact-status" role="status" aria-live="polite"></p></div>
</form>
</div>
</div>
</section>
<section class="section section--flush" aria-labelledby="faq-title">
<div class="container">
<div class="sec-head">
<div>
<span class="label">Frequently asked questions</span>
<h2 id="faq-title">Good answers to <em>common questions.</em></h2>
</div>
</div>
<div class="faq">
<details open><summary>Do I need a prescription to order?</summary><div class="faq__body">Over-the-counter products such as pain balms, vitamins and wellness items can be ordered directly. Products marked &#34;Prescription required&#34; need a valid prescription from a registered doctor. You can upload it on this website or send it on WhatsApp. Schedule X and narcotic drugs are never sold online.</div></details>
<details><summary>How do I upload my prescription?</summary><div class="faq__body">Go to the Prescriptions page and drag and drop or choose a photo or PDF from your phone. Our pharmacist verifies it within about 30 minutes during store hours and confirms your order by call or WhatsApp.</div></details>
<details><summary>Where do you deliver, and how fast?</summary><div class="faq__body">We offer same-day delivery across Meerut, usually within 30 to 60 minutes, and next-day delivery to nearby areas. Delivery is free on orders above 499 rupees. You can also pick up your order from our store at Apex City Colony, Rampur Pawati.</div></details>
<details><summary>Which payment methods do you accept?</summary><div class="faq__body">UPI (Google Pay, PhonePe, Paytm), credit and debit cards, netbanking and Cash on Delivery. Online payments are processed through a licensed payment gateway and we never store your card details.</div></details>
<details><summary>How do I know the medicines are genuine?</summary><div class="faq__body">We buy only from licensed distributors and manufacturers and check every batch before stocking. Our drug licence (20B / 21B), pharmacist registration and GST certificate are displayed on the About page, and originals can be verified at our store.</div></details>
<details><summary>What is your return and refund policy?</summary><div class="faq__body">For safety reasons, medicines cannot be returned once delivered, except for transit damage, wrong items or defective items. Report these within 24 hours with a photo and we will replace or refund them. Non-medicine products such as devices and personal care items can be returned within 7 days if unused and in original packing.</div></details>
</div>
</div>
</section>
"""

PAGES = [
    ("index.html",
     'Levana Life Sciences | Licensed Medical Store in Meerut, Uttar Pradesh',
     'Levana Life Sciences is a licensed medical store in Meerut, Uttar Pradesh. Order genuine medicines, health devices and wellness products with pharmacist verification and fast local delivery.',
     "home",
     BODY_HOME),
    ("medicines.html",
     'Medicines and Health Products | Levana Life Sciences',
     'Browse genuine medicines, vitamins, ayurveda and health devices at Levana Life Sciences. Search by brand or salt, with clear pricing and pharmacist-verified orders.',
     "medicines",
     BODY_MEDICINES),
    ("prescriptions.html",
     'Upload Prescription | Levana Life Sciences',
     'Upload your doctor prescription at Levana Life Sciences. Fast, private and verified by a registered pharmacist before dispatch.',
     "prescriptions",
     BODY_PRESCRIPTIONS),
    ("about.html",
     'About and Compliance | Levana Life Sciences',
     'Levana Life Sciences is a licensed pharmacy in Meerut, Uttar Pradesh. View our drug licence, GST details and compliance practices.',
     "about",
     BODY_ABOUT),
    ("contact.html",
     'Contact Us | Levana Life Sciences',
     'Contact Levana Life Sciences in Meerut, Uttar Pradesh. Call our helpline, chat on WhatsApp, visit our store or send us a message. We reply quickly.',
     "contact",
     BODY_CONTACT),
]

for filename, title, desc, active, body in PAGES:
    html = (
        TEMPLATE.replace("__BODY__", body)
        .replace("__TITLE__", title)
        .replace("__DESC__", desc)
        .replace("__FAVICON__", FAVICON)
        .replace("__FONTS__", FONTS)
        .replace("__NAV__", nav_html(active))
        .replace("__IMG_HERO__", IMG_HERO)
        .replace("__IMG_STORE__", IMG_STORE)
        .replace("__IMG_DESK__", IMG_DESK)
        .replace("__IMG_LOGO__", IMG_LOGO)
        .replace("__IMG_MARK__", IMG_MARK)
        .replace("__DOC_GST_PDF__", DOC_GST_PDF)
        .replace("__DOC_GST_P1__", DOC_GST_P1)
        .replace("__DOC_GST_P2__", DOC_GST_P2)
        .replace("__DOC_GST_P3__", DOC_GST_P3)
        .replace("__IMG_FALLBACK__", IMG_FALLBACK)
        .replace("__CSS__", css)
        .replace("__JS__", js)
        .replace("919876543210", "918219379566")
        .replace("98765 43210", "82193 79566")
    )
    (OUT / filename).write_text(html, encoding="utf-8")
    print("built", filename, len(html), "bytes")
