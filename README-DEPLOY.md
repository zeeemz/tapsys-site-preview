# Tapsys New Website — Deployment Package

Built: 29 October 2026 · Replaces the React SPA with a static, server-rendered HTML site.

## What is in this package

| File/Folder | Purpose |
|---|---|
| `index.html` | Home |
| `services.html`, `product.html`, `company.html`, `contact.html` | Core pages (all content from the old site, now crawlable) |
| `pricing.html` | NEW — pricing explainer + SBP subsidy + quote form (no invented rates; add real numbers when ready) |
| `terms.html`, `privacy.html` | Legal (verbatim from old site) |
| `404.html` | Friendly 404 (old site had none) |
| `blog/` | Blog index + 2 cornerstone articles |
| `assets/` | Images (renamed for SEO), self-hosted Poppins fonts, one stylesheet |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Crawler + AI-assistant files (none existed before) |
| `web.config` | IIS config — safe on any Windows host (cache headers, MIME types, 404) |
| `web.config-rewrite-optional.txt` | OPTIONAL pretty-URL rules — test before enabling |
| `.htaccess` | Only if ever hosted on Apache |

## Why it is faster than the current site

**Measured (local, 29 Oct 2026):** first view = ~158 KB total (23 KB HTML + 13 KB CSS + 8 KB font + 4 KB logo + 99 KB hero WebP). The old site ships a 355 KB JS bundle before any text appears, plus multi-megabyte images (one unused PNG was 19.8 MB; hero was 3.5 MB → now 99 KB WebP).

- Ships real HTML on first byte — no 350 KB JS bundle to download/parse/execute before content appears
- Zero JavaScript on every page (nav = CSS checkbox, FAQ = native <details>, YouTube = click-to-play facade)
- One ~13 KB CSS file, 3 self-hosted woff2 fonts (~8 KB each), all below-fold images lazy-loaded
- All heavy images converted to resized WebP (16 converted, 19.8 MB unused asset removed; total package 1.9 MB)
- Target: Lighthouse Performance 95+, LCP < 1.2 s on 4G

**Verification results:** 12/12 pages render with 1 H1 each, 0 broken images, JSON-LD valid on 9 pages (Organization, WebSite, FAQPage, ServicePage, ItemList, AboutPage, ContactPage, Article), all internal links resolve, forms POST to formsubmit.co, sitemap.xml maps 1:1 to files.

## Deployment steps (STAGING FIRST — production stays untouched)

**A. Staging (recommended)**
1. On the hosting panel, create a subdomain e.g. `new.tapsys.net` pointing to a new folder such as `www_new`.
2. Upload EVERYTHING in this folder (except this README and `web.config-rewrite-optional.txt`) into that folder — binary mode for images/fonts.
3. Verify at `https://new.tapsys.net`: all 11 pages load, form submits reach info@tapsys.net, images render, mobile nav works.
4. Optional: test the rewrite block from `web.config-rewrite-optional.txt`.

**B. Atomic cutover (after approval)**
1. Rename the current site folder to `www_old_YYYYMMDD` (this is the instant rollback).
2. Upload this package into the live site root (`index.html` replacing the old one).
3. Verify: homepage, /services.html, /product.html, /company.html, /contact.html, /terms.html, /privacy.html, /pricing.html, /blog/ all return 200; the contact form delivers mail.
4. Rollback if ever needed: swap folder names back. Nothing else changed.

**C. Post-launch (same day)**
1. Google Search Console → add property tapsys.net (if missing) → submit `https://tapsys.net/sitemap.xml`.
2. Bing Webmaster Tools → import from GSC → submit sitemap.
3. Confirm FormSubmit.co: the first form submission may require a one-time activation email to info@tapsys.net — do this test yourself at cutover.
4. Watch GSC Coverage for 404s over the next week.

## Form note
The contact/quote forms POST to `https://formsubmit.co/info@tapsys.net` — identical backend to the current site. No server code needed. A honeypot field (`_honey`) filters basic spam.

## Content verification checklist (vs old site)
- [x] All 7 original routes replicated with verbatim copy
- [x] 31 client logos present with real brand names in alt text (were unreadable in the old JS bundle)
- [x] Leadership team, our-story text, YouTube office video preserved
- [x] Google Play link + all 4 social links preserved
- [x] Fixed: inner-page 404s, empty "Learn More" link, empty footer links, "Privacy Polices" typo
- [ ] Confirm with management: pricing page wording, leadership photo mapping (`founder.png` = Karim Jindani per old site alt text)

## Known intentional changes vs old site
1. All pages now exist as real URLs (previously only `/` was reachable directly).
2. Added FAQ sections, pricing page, blog, llms.txt, sitemap, robots.txt, per-page titles/descriptions, structured data.
3. YouTube embed replaced with a thumbnail facade (click opens YouTube) — saves ~700 KB on page load.
4. Footer "Services" column now lists real product anchors; two empty links removed.
5. Copyright line: "Tapsys (Private) Limited" (was "Tapsys Services Pvt. Ltd.").
