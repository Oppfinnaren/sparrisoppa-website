# Personal site

A small personal site built with [Hugo](https://gohugo.io): a home page, projects and an about page. The look is typewriter type on cream paper, from the Claude Design mockups in `design/` (directions 1a, 2a, 2b and 2c).

All text is in Markdown files under `content/`. To update the site, edit a file and push to `main`. GitHub Actions builds the site and copies it to your server.

```
content/            ← your text (Markdown)
  _index.md           home page: name and short statement
  about.md            about page, plus the Experience and Education lists
  projects/           one file per project
static/images/      ← images you reference from content
hugo.toml           ← site name, email, social links, menu
themes/paper/       ← the template (layouts, CSS, fonts)
deploy/             ← Caddy and nginx configs, manual deploy script
design/             ← the original design handoff, for reference
```

## Running it locally

Install Hugo **extended**, version 0.158 or newer (`brew install hugo`, `winget install Hugo.Hugo.Extended`, or a [release binary](https://github.com/gohugoio/hugo/releases)). Then:

```sh
hugo server -D      # http://localhost:1313, reloads as you edit; -D shows drafts
hugo --gc --minify  # builds the site into public/
```

## Editing content

### Name, email, links and menu

These are in `hugo.toml`: `title` and `params.author` (your name), `params.email`, `params.social` (GitHub, LinkedIn and so on, in display order) and `menus.main`. Also set `baseURL` to your domain.

### Home page

`content/_index.md`. The `title` is the big name, and the body is the statement under it.

The "Selected projects" list shows every page, project or post, that has `featured: true`, newest first, up to `featured_limit`. Each row shows the page's `home_title` (or its `title`) and its year.

### Projects

Make a new project with `hugo new content projects/my-project.md`, or copy an existing file. The front matter:

```yaml
---
title: "WALL-E"
date: 2022-01-01
weight: 1                   # order in lists: lower comes first
year: "2022 – now"          # optional, otherwise the year of `date`
description: "A four-wheeled robot that collects trash on its own."
status: "work in progress"  # shown in the list, capitalised on the page
role: "Design, code"
stack: ["Language", "Framework"]  # a list or a single string
featured: true              # list it on the home page
home_title: "WALL-E, a trash-collecting robot"
links:
  - name: "Source on GitHub"
    url: "https://github.com/sparrisoppa/wall-e"
draft: false                # drafts are not published
---
```

`role`, `stack`, `status`, `year` and `links` are optional. The row of facts under the title only shows the ones you fill in.

Projects are listed by `weight`, then newest first. Projects next to each other in that order that share a year label sit under one year heading.

The body is ordinary Markdown. `##` gives the small bold subheadings. For figures, use the shortcode:

```
{{< figure src="/images/wall-e.jpg" alt="Sync diagram" caption="Fig. 1, the sync model" >}}
{{< figure placeholder="screenshot or diagram" caption="Fig. 1, the sync model" >}}
```

Put images in `static/images/`. You can also make the project a folder (`projects/wall-e/index.md`) and keep its images beside it, then use `src="sync.png"`.

"Next project" at the bottom goes to the next project in list order and loops back to the first after the last one.

### Adding a Writing section later

The theme still supports a blog. Create `content/writing/_index.md` with a `title` and `description`, add posts as `content/writing/my-post.md` (with `title`, `date` and `description`), and add a "Writing" entry to `menus.main` in `hugo.toml`. Posts get the same list and page styles as projects, plus an RSS feed.

### About

`content/about.md`. The body holds the paragraphs. `timelines` holds the lists under the text (each has a `heading` and `items` with `when` and `what`), and `portrait` takes an image path such as `/images/me.jpg` (square, at least 220×220). Leave `portrait` empty to show the striped placeholder. The "Elsewhere" links come from `hugo.toml`.

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
