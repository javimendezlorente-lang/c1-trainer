# GitHub Pages Deployment Setup

This document explains how to configure GitHub Pages for the C1 Examiner app to deploy to https://dev.vidga.hu/examiner/.

## Prerequisites

1. Repository is at `dhanak/examiner` (https://github.com/dhanak/examiner)
2. Custom domain `dev.vidga.hu` is configured to point to GitHub Pages
3. Primary branch is `master`

## GitHub Repository Settings

### 1. Enable GitHub Pages

Navigate to your repository settings:

1. Go to **Settings** > **Pages**
2. Under **Source**, select:
   - Source: **GitHub Actions** (not "Deploy from a branch")
3. Configure custom domain: `dev.vidga.hu`

### 2. Configure GitHub Actions Permissions

Ensure GitHub Actions has the right permissions:

1. Go to **Settings** > **Actions** > **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
3. Check: ✅ **Allow GitHub Actions to create and approve pull requests**
4. Save changes

### 3. Environment Setup (Optional but Recommended)

For better deployment tracking:

1. Go to **Settings** > **Environments**
2. Click **New environment**
3. Name it: `github-pages`
4. Add protection rules if desired (e.g., required reviewers)
5. Save

## How It Works

### Workflow Triggers

The workflow (`.github/workflows/deploy.yml`) runs on:
- **Push to `master` branch**: Runs tests, builds, and deploys
- **Pull requests to `master`**: Runs tests and builds (no deployment)

### Pipeline Steps

1. **Test Job**
   - Checks out code
   - Installs Node.js 20
   - Installs dependencies with `npm ci`
   - Runs tests with `npm test -- --run`
   - Runs linter with `npm run lint`

2. **Build Job** (runs after tests pass)
   - Checks out code
   - Installs dependencies
   - Builds production bundle with `npm run build`
   - Uploads `dist/` as an artifact

3. **Deploy Job** (runs after build, only on main branch)
   - Downloads build artifact
   - Configures GitHub Pages
   - Uploads to GitHub Pages
   - Deploys to production

### Deployment URL

The app will be available at:
- **Primary**: https://dev.vidga.hu/examiner/
- **GitHub Pages**: https://dhanak.github.io/examiner/ (fallback)

## First Time Setup Checklist

- [ ] Create `.github/workflows/deploy.yml` (already done)
- [ ] Ensure `vite.config.js` has `base: '/examiner/'` (already set)
- [ ] Push changes to the `master` branch
- [ ] Go to **Settings** > **Pages** and select **GitHub Actions** as source
- [ ] Configure custom domain `dev.vidga.hu` if not already set
- [ ] Wait for the first workflow run to complete
- [ ] Visit https://dev.vidga.hu/examiner/ to verify deployment

## Monitoring Deployments

### View Workflow Runs

1. Go to **Actions** tab in your repository
2. Click on the latest **Build and Deploy** workflow
3. See status of Test, Build, and Deploy jobs

### Check Deployment Status

1. Go to **Settings** > **Pages**
2. See the current deployment status and URL
3. Recent deployments are listed with timestamps

## Troubleshooting

### Workflow fails with "Permission denied"

- Check **Settings** > **Actions** > **General** > **Workflow permissions**
- Ensure "Read and write permissions" is selected

### Deployment succeeds but site shows 404

- Verify `base: '/examiner/'` is set in `vite.config.js`
- Check that `basename="/examiner/"` is set in `src/main.jsx` (React Router)
- Clear browser cache and try again

### Tests fail in CI but pass locally

- Ensure all dependencies are in `package.json` (not just `devDependencies`)
- Check Node.js version compatibility (workflow uses Node 20)
- Look for environment-specific issues in the workflow logs

### Build succeeds but deploy fails

- Check GitHub Pages settings are configured correctly
- Verify the `github-pages` environment exists (or remove environment from workflow)
- Check workflow logs for specific error messages

## Manual Deployment (Backup Method)

If you need to deploy manually without GitHub Actions:

```bash
# Build the project
npm run build

# Deploy dist/ folder to GitHub Pages
# (use gh-pages branch or your preferred method)
```

## Testing Before Merging

Pull requests will automatically run tests and build verification:
- Tests must pass
- Linter must pass
- Build must succeed
- No deployment occurs (only on master branch)

## Workflow File Location

`.github/workflows/deploy.yml`

To modify the workflow:
1. Edit the YAML file
2. Commit and push to `master`
3. Workflow will use the updated configuration on next run
