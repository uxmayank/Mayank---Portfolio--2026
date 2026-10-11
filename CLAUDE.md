# Mayank Pal — Portfolio

Static site in plain HTML, CSS and a little JavaScript. No frameworks and no build tools. Hosted on GitHub Pages. The owner is learning, so keep code readable and explain changes briefly.

## Design source (Figma MCP)
Portfolio file: https://www.figma.com/design/oCIkYYlVhhgrFdjonfGArZ/Proffesional_Deck
| Page | Desktop (1440) | Mobile (402) | Code file |
|---|---|---|---|
| Home | 83:2 | 225:151 | index.html |
| About | 111:224 | 342:2810 | about.html |
| Square Foot Story | 107:224 | 274:2714 | projects/square-foot-story.html |
| MechServi | 302:2792 | 313:156 | projects/mechservi.html |
| BuildMyCV | 306:16510 | 313:2 | projects/buildmycv.html |
| AstroBharat AI | 312:16758 | 319:2 | projects/astrobharat-ai.html |

Design system file (tokens: colours, type, spacing, radius, icons): https://www.figma.com/design/Oo9UcJOJxyj4ZF7AHAuCQh
- Colours 15:596, Typography 159:387, Spacing 188:3, Radius 195:150, Icons 196:264
- Portfolio fonts: Bricolage Grotesque (headings), Geist (body). Primary CTA blue: #0052BD.

Always read the matching Figma frame with the Figma MCP before building or changing a page. Match the design and don't invent content.

## Folder structure
```
index.html              Home
about.html              About
projects/               one HTML file per case study
css/
  base/
    reset.css           browser resets
    tokens.css          CSS variables: colours, fonts, spacing, radius, shadows (only place for raw values)
    typography.css      heading/body text styles
    layout.css          container, section spacing, grid helpers
  components/           one file per reusable piece: nav.css, footer.css, buttons.css, cards.css, chips.css, carousel.css, phone-mockup.css,
                        browser-mockup.css (incl. browser-shot), media-frame.css (grid frame for video), preloader.css (home page),
                        sfs-cover.css (animated Square Foot Story cover), mechservi-cover.css, buildmycv-cover.css, astro-cover.css
  pages/                one file per page: home.css, about.css, case-study.css (shared by all case studies), plus project-specific files only if needed
                        (square-foot-story.css)
js/
  main.js               small shared scripts (e.g. mobile nav)
  carousel.js           About page photo carousel
  schedule.js           Cal.com booking calendar in the home page contact card
  preloader.js          Home page preloader: outlined "Mynk" filled by a hopping orange dot (loaded in <head> so it runs before the first paint)
  vendor/gsap.min.js    GSAP 3.12.5 animation library, used only by preloader.js (downloaded only when the preloader plays)
assets/
  images/home/, images/about/, images/square-foot-story/, images/mechservi/, images/buildmycv/, images/astrobharat-ai/
  icons/
  videos/home/          sfs-launch-reel.mp4 (keep each video under ~20 MB; GitHub rejects files over 100 MB)
  docs/                 resume.pdf
```

## Rules
1. File and folder names: lowercase, kebab-case (e.g. square-foot-story.html, hero-cover.webp).
2. Every page links CSS in this order: base (reset, tokens, typography, layout), then components it uses, then its page file.
3. Raw colour, font and spacing values live only in tokens.css. Everywhere else, use var(--token-name).
4. Class names: BEM-style, e.g. .hero, .hero__title, .card--dark. No inline styles. No IDs for styling.
5. Semantic HTML: header, nav, main, section, footer, and one h1 per page. Every image has meaningful alt text.
6. Responsive: desktop-first, with one main breakpoint @media (max-width: 767px) matching the 402px mobile frames. Put a page's mobile rules at the bottom of that page's CSS file.
7. Nav and footer markup must be identical on every page. When you change one, update all pages.
8. Images: export from Figma as .webp (2x), and put them in the matching assets/images/<page>/ folder.
9. Small, focused commits, one per section, with clear messages (e.g. "Home: hero section").
10. After each change, list the files touched and explain what changed in 2–3 lines.
