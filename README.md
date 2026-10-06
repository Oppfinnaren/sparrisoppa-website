# Veckobygget.se

A one-page Swedish service site built with [Hugo](https://gohugo.io). All text is Markdown under `content/`. Edit a file, push to `main`, and GitHub Actions builds and publishes it to GitHub Pages.

```
hugo.toml                   site settings: brand, accent colour, price, footer, Cal.com
content/
  _index.md                 hero (headline, price sticker, the AI-flow example)
  sections/                 one file per block of the page, ordered by `weight`
    10-offer.md             before / after comparison
    20-services.md          "Vad vi bygger"
    30-process.md           "Så fungerar det"
    40-testimonials.md      customer quotes
    50-calculator.md        pay-back calculator
    60-pricing.md           build price and support plans
    70-faq.md               questions and answers (Markdown)
    80-contact.md           heading, Cal.com booking, contact person
assets/images/              images used from content (resized by Hugo)
themes/veckobygget/         the template: layouts, CSS, JS, fonts
.github/workflows/pages.yml builds and deploys to GitHub Pages
```

## Editing content

- **Text and lists**: open the file in `content/sections/` and edit the front matter (the part between `---` lines). Lists such as services, steps, quotes and FAQ items are simple `- title:` / `body:` entries; copy one to add another.
- **Order**: change `weight` in a section file. Add a section by copying a file and changing `block` to one of `offer`, `services`, `process`, `testimonials`, `calculator`, `pricing`, `faq`, `contact`.
- **Menu**: every section with both `nav` (label) and `anchor` (id) gets a menu link. The button at the end is `params.nav_cta` in `hugo.toml`.
- **Price**: `price` in `hugo.toml` drives the hero sticker, the calculator and the pricing card. The two support plans have their own `price` in `60-pricing.md`.
- **Accent colour**: `accent = "orange"` or `"green"` in `hugo.toml`. Other colours are variables at the top of `themes/veckobygget/assets/css/main.css`.
- **Photo**: put the image in `assets/images/` and set `person.photo` in `80-contact.md`.
- **Footer details**: `[params.company]` in `hugo.toml` (the org number and address are placeholders).

## Cal.com booking

The contact section embeds a [Cal.com](https://cal.com) booking calendar in place of the old mock-up. To switch it on:

1. Create a Cal.com account and an event type (for example a 30 minute video call).
2. In `hugo.toml`, set `link` under `[params.cal]` to `"<your-username>/<event-slug>"`, for example `"mathias-kallmert/30min"`.
3. Push. The calendar loads when visitors scroll near it, uses the site's accent colour, and falls back to a link when JavaScript is off.

Until `link` is set, the section shows an e-mail button instead. If you self-host Cal.com, set `origin` too. In Cal.com you can also set the confirmation redirect, e-mails and the intake questions (name, company, "what do you want to simplify?").

## Running it locally

Install Hugo **extended**, version 0.146 or newer (`brew install hugo`, `winget install Hugo.Hugo.Extended`, or a [release binary](https://github.com/gohugoio/hugo/releases)). Then:

```sh
hugo server     # http://localhost:1313, reloads as you edit
hugo --gc --minify
```

## Publishing

There are two ways to publish, and you can use either or both:

- **GitHub Pages**: GitHub hosts the site, on `sparrisoppa.github.io/website` or on your own domain. No server needed.
- **Your own server** with Caddy or nginx, updated over SSH.

### GitHub Pages

`.github/workflows/pages.yml` builds and publishes the site on every push to `main`.

1. **Turn it on (once):** in the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**. Then run the "GitHub Pages" workflow from the **Actions** tab, or push a commit.
2. **The site is live at** https://sparrisoppa.github.io/website/.

Pages needs a public repository, unless you have a paid GitHub plan.

#### Using your own domain

1. Under **Settings → Pages → Custom domain**, enter your domain (for example `yourname.se`) and save.
2. At your DNS provider, add these records for the bare domain:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | AAAA | @ | 2606:50c0:8000::153 |
   | AAAA | @ | 2606:50c0:8001::153 |
   | AAAA | @ | 2606:50c0:8002::153 |
   | AAAA | @ | 2606:50c0:8003::153 |
   | CNAME | www | sparrisoppa.github.io |

3. Once DNS has updated (minutes to a few hours), tick **Enforce HTTPS** in the same settings page. GitHub issues the certificate itself.
4. Run the workflow again, so the links use the new address. The workflow reads the address from the Pages settings, so nothing in the code needs to change.

It's also worth verifying the domain under your account's **Settings → Pages**. That stops anyone else from claiming it on GitHub.

If you only use GitHub Pages, you can ignore `deploy/` and the server steps below. The server workflow skips itself while its secrets are unset.

## Publishing to your own server

The workflow in `.github/workflows/deploy.yml` runs on every push. It builds the site, and on `main` it copies `public/` to the server with rsync over SSH. Pull requests are only built, which checks that they don't break anything.

### 1. Prepare the server (once)

```sh
# a user that can only write the site folder
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/yourname.se
sudo chown deploy:deploy /var/www/yourname.se
sudo apt install rsync
```

Make a key pair for GitHub on your own machine and install the public half on the server:

```sh
ssh-keygen -t ed25519 -N "" -C "github-deploy" -f deploy_key
ssh-copy-id -i deploy_key.pub deploy@yourname.se   # or add it to ~deploy/.ssh/authorized_keys
ssh-keyscan -p 22 yourname.se > known_hosts
```

### 2. Configure the web server

Pick one:

- **Caddy** (easiest, HTTPS is automatic): copy `deploy/Caddyfile` to `/etc/caddy/Caddyfile`, replace `yourname.se`, then `sudo systemctl reload caddy`.
- **nginx**: copy `deploy/nginx.conf` to `/etc/nginx/sites-available/yourname.se`, replace the domain, link it into `sites-enabled`, then run `sudo certbot --nginx -d yourname.se -d www.yourname.se` and `sudo systemctl reload nginx`.

Both configs serve `/var/www/yourname.se`, use Hugo's `404.html`, compress responses and cache the fingerprinted CSS and fonts for a year.

### 3. Add the GitHub secrets

In the repository, open **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | `yourname.se` or the server's IP |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/var/www/yourname.se` |
| `DEPLOY_SSH_KEY` | the contents of `deploy_key` (the private key) |
| `DEPLOY_KNOWN_HOSTS` | the contents of `known_hosts` |
| `DEPLOY_PORT` | optional, defaults to `22` |

Optionally add a repository **variable** `SITE_BASE_URL` (such as `https://yourname.se/`) to override `baseURL` at build time.

The deploy job uses a GitHub environment named `production`, which GitHub creates on first run. Until `DEPLOY_HOST` is set, the job only prints a warning and skips the upload.

Then push to `main`, or run the workflow by hand from the **Actions** tab.

### Deploying without GitHub Actions

```sh
DEPLOY_TARGET=deploy@yourname.se:/var/www/yourname.se ./deploy/deploy.sh
```

## Notes

- Courier Prime (SIL Open Font License) is hosted with the site in `themes/paper/static/fonts/`, so pages make no requests to Google.
- The design is light only, as chosen in the design chat.
- To change colours or spacing, edit the variables at the top of `themes/paper/assets/css/main.css`.
