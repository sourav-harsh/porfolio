---
title: "Ways of optimising the image to increase load time."
date: "2025-08-28"
excerpt: "There are some ways to optimising the image to reduce LCP(Largest Contentful Paint,) timing. And increase the page loading, reloading timing."
tags: ["img", "optimisation"]
---

## 1\. Thematic Images

### Approach

*   Serve images based on user theme (light/dark)


### Example

```html
<picture>
  <source srcset="banner-dark.webp" media="(prefers-color-scheme: dark)" />
  <img src="banner-light.webp" alt="Banner" />
</picture>
```

### Benefits

*   Better visual consistency with UI theme

*   Improved UX in dark mode


* * *

## 2\. Device-Specific Images

### Approach

*   Deliver optimized images based on screen size and resolution


### Example

```html
<picture>
  <source srcset="image-mobile.webp" media="(max-width: 768px)" />
  <source srcset="image-tablet.webp" media="(max-width: 1024px)" />
  <img src="image-desktop.webp" alt="Responsive image" />
</picture>
```

### Enhancements

*   Use modern formats: WebP / AVIF

*   Use `srcset` for resolution switching


```html
<img src="image.webp" srcset="image-1x.webp 1x, image-2x.webp 2x" alt="High resolution image" />
```

### Benefits

*   Reduced bandwidth usage

*   Faster loading on mobile devices


* * *

## 3\. Lazy Loading

### Approach

Defer loading of non-critical resources until needed.

### Image Lazy Loading

```html
<img src="image.webp" loading="lazy" />
```

### Advanced (Intersection Observer)

*   Load assets only when they enter viewport


### Benefits

*   Reduced initial load time

*   Better performance on slow networks

*   Improved user-perceived speed


* * *

## 4\. Change Image file formate to WebP/AVIF

*   Modern formats like WebP and AVIF offer significantly better compression than JPEG/PNG at the same quality, often reducing file sizes by 30–80%.


* * *

## 5\. Priorities the images

*   Prioritize images that are critical for initial render like hero images, logo, etc.

*   For LCP specifically, the critical insight is that your LCP image should not be lazy-loaded — it needs to be prioritized with fetchpriority="high"


```html
<img src="photo.jpg" loading="lazy" alt="..." /> <img src="hero.jpg" fetchpriority="high" alt="..." />
```

* * *

## 6\. Avoid using the css background image

*   Avoid CSS background images for LCP — the browser discovers CSS background images later in the rendering pipeline than HTML `<img>` tags. If your hero image is a CSS background-image, consider switching to an `<img>` element, or at minimum use a in .
