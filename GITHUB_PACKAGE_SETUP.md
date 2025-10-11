# GitHub Package Publishing Guide

## 🎯 Current Status
- ✅ Package built and ready: `radix-obsidian-toknxr-cli-0.2.2.tgz`
- ✅ GitHub repository configured with workflow
- ✅ Package.json configured for GitHub Package Registry
- ⏳ Awaiting authentication for publishing

## 📦 Package Details
- **Name**: `@radix-obsidian/toknxr-cli`
- **Version**: `0.2.2`
- **Registry**: `https://npm.pkg.github.com`
- **Scope**: `@radix-obsidian`

## 🚀 Publishing Options

### Option 1: Automated GitHub Actions (Recommended)
The repository has a workflow that will automatically publish when:
1. A version tag is pushed (already done: `v0.2.2-github`)
2. The workflow is manually triggered

**Check workflow status**: https://github.com/Radix-Obsidian/toknxr/actions

### Option 2: Manual Publishing
1. Get a GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Create token with `write:packages` permission
   
2. Set the token:
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```

3. Publish:
   ```bash
   npm publish --registry=https://npm.pkg.github.com
   ```

### Option 3: GitHub Release (Alternative)
1. Go to: https://github.com/Radix-Obsidian/toknxr/releases/new
2. Create a new release with tag `v0.2.2`
3. Upload the package file: `radix-obsidian-toknxr-cli-0.2.2.tgz`

## 📥 Installation Instructions

### From GitHub Packages (once published):
```bash
# Configure npm to use GitHub registry for @radix-obsidian scope
npm config set @radix-obsidian:registry https://npm.pkg.github.com

# Install the package
npm install -g @radix-obsidian/toknxr-cli
```

### From npm (already available):
```bash
npm install -g @goldensheepai/toknxr-cli@0.2.2
```

## 🔧 Troubleshooting

### Authentication Issues
If you get authentication errors:
1. Ensure GITHUB_TOKEN is set
2. Token must have `write:packages` permission
3. You must be a collaborator on the repository

### Package Not Found
If the package isn't found after publishing:
1. Check GitHub Packages tab in repository
2. Verify the package name and scope
3. Ensure you're using the correct registry URL

## 📋 Files Ready for Publishing
- ✅ `package.json` - Configured with correct scope and registry
- ✅ `toknxr-cli/lib/` - Built JavaScript files
- ✅ `.npmrc` - Registry configuration
- ✅ `.github/workflows/publish-github-package.yml` - Automated workflow
- ✅ `radix-obsidian-toknxr-cli-0.2.2.tgz` - Packaged file ready for upload