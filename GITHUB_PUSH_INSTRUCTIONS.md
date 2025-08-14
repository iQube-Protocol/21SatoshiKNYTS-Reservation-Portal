# GitHub Push Instructions

This document provides instructions for pushing your local branches to GitHub.

## Prerequisites

1. GitHub account with access to the repository
2. Personal Access Token (PAT) or SSH key set up for authentication

## Option 1: Push using HTTPS with Personal Access Token

### Creating a Personal Access Token (PAT)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give your token a descriptive name
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (if you need GitHub Actions)
5. Click "Generate token"
6. **IMPORTANT**: Copy your token immediately and store it securely

### Pushing to GitHub

```bash
# Make sure you're on the branch you want to push
git checkout staging

# Push the staging branch
git push -u origin staging

# Switch to dev branch
git checkout dev

# Push the dev branch
git push -u origin dev
```

When prompted for your password, use your Personal Access Token instead of your GitHub password.

## Option 2: Push using SSH

### Setting up SSH Keys

1. Generate an SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Start the SSH agent:
   ```bash
   eval "$(ssh-agent -s)"
   ```

3. Add your SSH key to the agent:
   ```bash
   ssh-add ~/.ssh/id_ed25519
   ```

4. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub | pbcopy
   ```

5. Go to GitHub → Settings → SSH and GPG keys → New SSH key
6. Paste your key and give it a descriptive title
7. Click "Add SSH key"

### Update Remote URL to use SSH

```bash
# Update the remote URL to use SSH
git remote set-url origin git@github.com:iQube-Protocol/21SatoshiKNYTS-Reservation-Portal.git
```

### Pushing to GitHub

```bash
# Make sure you're on the branch you want to push
git checkout staging

# Push the staging branch
git push -u origin staging

# Switch to dev branch
git checkout dev

# Push the dev branch
git push -u origin dev
```

## Option 3: Using GitHub CLI

### Installing GitHub CLI

```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli
```

### Authenticate with GitHub CLI

```bash
gh auth login
```

### Pushing to GitHub

```bash
# Push the current branch
gh repo sync

# Or push specific branches
git checkout staging
git push -u origin staging

git checkout dev
git push -u origin dev
```

## After Pushing

Once you've pushed your branches, you can:

1. Create a pull request from `dev` to `staging` when you want to merge changes
2. Set branch protection rules to prevent direct pushes to `staging`
3. Configure GitHub Actions for CI/CD if needed

## Troubleshooting

If you encounter permission issues:
1. Verify you have write access to the repository
2. Check that your authentication credentials are correct
3. Try regenerating your PAT or SSH key if needed
