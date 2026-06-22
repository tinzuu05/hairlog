# Git-safe deployment note

This project is safe to upload to GitHub as long as you do not commit your real `.env`.

## Public and safe to commit

- `.env.example`
- `firestore.rules`
- source files
- GitHub Actions workflow

## Do not commit

- `.env`
- `.env.local`
- `.env.production`
- any file containing your real Firebase config values

The `.gitignore` already excludes `.env` and `.env.*`, while keeping `.env.example`.

For GitHub Pages deployment, put Firebase values into:

GitHub repo → Settings → Secrets and variables → Actions → New repository secret
