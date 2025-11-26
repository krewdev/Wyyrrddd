# Deployment Guide for wyyrrddd.fun

## 🌐 Domain Setup

**Live URL**: [https://wyyrrddd.fun](https://wyyrrddd.fun)

---

## 📦 Build for Production

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Create production build**:
   ```bash
   npm run build
   ```

3. **Preview production build** (optional):
   ```bash
   npm run preview
   ```

The build output will be in the `dist/` directory.

---

## 🚀 Deployment Options

### Option 1: Static Hosting (Recommended)

**Platforms**: Vercel, Netlify, Cloudflare Pages, GitHub Pages

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Cloudflare Pages
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set build output: `dist`
4. Deploy!

---

## 🌍 Domain Configuration

### DNS Settings for wyyrrddd.fun

**A Records** (if using static IP):
```
Type: A
Name: @
Value: [Your Server IP]
TTL: Auto
```

**CNAME Records** (if using platform):
```
Type: CNAME
Name: www
Value: wyyrrddd.fun
TTL: Auto
```

### SSL/TLS Certificate
- ✅ Enable SSL/TLS encryption
- ✅ Force HTTPS redirects
- ✅ Use automatic certificate renewal

---

## 📱 Progressive Web App (PWA)

The app includes PWA support with:
- ✅ `manifest.json` - App manifest
- ✅ Service worker ready
- ✅ Offline support (can be added)
- ✅ Install prompt

### Service Worker (Optional Enhancement)

Create `public/sw.js` for offline support:
```javascript
const CACHE_NAME = 'wyyrrddd-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

Register in `index.html`:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 🔐 Environment Variables

### Required Variables
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Platform-Specific Setup

**Vercel**:
```bash
vercel env add GEMINI_API_KEY
```

**Netlify**:
- Dashboard → Site Settings → Environment Variables
- Add `GEMINI_API_KEY`

**Cloudflare Pages**:
- Dashboard → Settings → Environment Variables
- Add `GEMINI_API_KEY`

---

## 🎯 SEO Configuration

### Files Included
- ✅ `robots.txt` - Search engine instructions
- ✅ `sitemap.xml` - Site structure
- ✅ `manifest.json` - PWA manifest
- ✅ Open Graph meta tags
- ✅ Twitter Card meta tags

### Google Search Console
1. Verify ownership of wyyrrddd.fun
2. Submit sitemap: `https://wyyrrddd.fun/sitemap.xml`
3. Request indexing

### Social Media Cards
Test your cards:
- Twitter: https://cards-dev.twitter.com/validator
- Facebook: https://developers.facebook.com/tools/debug/
- LinkedIn: https://www.linkedin.com/post-inspector/

---

## 🔧 Performance Optimization

### Build Optimizations Included
- ✅ Code splitting (React, Three.js, Polkadot)
- ✅ Tree shaking
- ✅ Minification
- ✅ Asset optimization
- ✅ Lazy loading for heavy components

### CDN Configuration
Enable CDN caching for:
- `/assets/*` - 1 year cache
- `/manifest.json` - 1 day cache
- `/*.xml` - 1 day cache
- `/*.txt` - 1 day cache

### Compression
Enable Gzip/Brotli compression:
```
Content-Encoding: br
Content-Type: application/javascript
```

---

## 📊 Analytics Setup (Optional)

### Google Analytics
Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (Privacy-friendly)
```html
<script defer data-domain="wyyrrddd.fun" src="https://plausible.io/js/script.js"></script>
```

---

## 🧪 Testing Checklist

Before deploying:

- [ ] Test all 5 view modes (Grid, Horizontal, Carousel, Web, Space)
- [ ] Verify scroll animations work
- [ ] Test particle effects
- [ ] Check dark mode
- [ ] Test on mobile devices
- [ ] Verify wallet connection
- [ ] Test token interactions
- [ ] Check share functionality
- [ ] Verify all routes work
- [ ] Test image/video uploads
- [ ] Check responsive design
- [ ] Verify PWA installation
- [ ] Test offline functionality (if PWA)
- [ ] Lighthouse audit score > 90

---

## 🔍 Monitoring

### Uptime Monitoring
- Use UptimeRobot or Pingdom
- Set up alerts for downtime

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay

### Performance Monitoring
- Google PageSpeed Insights
- WebPageTest
- Lighthouse CI

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Routes Not Working (404 on refresh)
- Ensure SPA redirect rules are configured
- Check platform-specific routing configuration

### Environment Variables Not Loading
- Verify variables are set in platform dashboard
- Redeploy after adding variables
- Check build logs for errors

### Performance Issues
- Enable CDN caching
- Optimize images (use WebP)
- Enable compression
- Check bundle size: `npm run build -- --stats`

---

## 📈 Post-Deployment

### Immediate Steps
1. ✅ Verify site loads at wyyrrddd.fun
2. ✅ Test all major features
3. ✅ Submit sitemap to search engines
4. ✅ Set up monitoring
5. ✅ Configure CDN caching

### Marketing
- Share on social media
- Post on Reddit (r/polkadot, r/web3)
- Product Hunt launch
- Crypto forums announcement

---

## 🔄 Continuous Deployment

Set up automatic deployments:

1. **GitHub Actions** (if using GitHub):
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: wyyrrddd
          directory: dist
```

2. **Automatic Previews**:
- Every PR gets a preview URL
- Test before merging to production

---

## 📞 Support

For deployment issues:
- Check documentation
- Review platform-specific guides
- Test locally first with `npm run preview`

---

**Last Updated**: November 25, 2025  
**Domain**: wyyrrddd.fun  
**Version**: 2.0.0



