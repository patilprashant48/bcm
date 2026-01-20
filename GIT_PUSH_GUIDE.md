# Push BCM Project to GitHub

## Step-by-Step Guide

### Step 1: Initialize Git (if not already done)

```bash
cd "d:\Freelancing projects\BCM"
git init
```

### Step 2: Add Remote Repository

```bash
git remote add origin https://github.com/patilprashant48/bcm.git
```

### Step 3: Create .env.example Files

Before committing, create example environment files (without sensitive data):

**backend/.env.example:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bcm
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**admin-web/.env.example:**
```bash
VITE_API_URL=http://localhost:5000/api
```

**business-web/.env.example:**
```bash
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Add All Files

```bash
git add .
```

### Step 5: Commit

```bash
git commit -m "Initial commit: BCM Platform - Complete application with backend, admin-web, business-web, and mobile app"
```

### Step 6: Set Main Branch

```bash
git branch -M main
```

### Step 7: Push to GitHub

```bash
git push -u origin main
```

If the repository already has content, you might need to force push (be careful!):
```bash
git push -u origin main --force
```

## Alternative: If Repository Already Exists

If you want to push to an existing repository:

```bash
# Pull existing content first
git pull origin main --allow-unrelated-histories

# Resolve any conflicts if they occur

# Then push
git push -u origin main
```

## Verify Upload

After pushing, visit:
https://github.com/patilprashant48/bcm

You should see all your files there!

## Important Notes

✅ **Included in Git:**
- All source code
- Configuration files (without secrets)
- Documentation
- README.md
- .gitignore

❌ **Excluded from Git (via .gitignore):**
- node_modules/
- .env files (sensitive data)
- build/ directories
- APK files
- Temporary files
- IDE settings

## Quick Commands Reference

```bash
# Check status
git status

# See what will be committed
git diff

# Add specific files
git add filename

# Commit with message
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline
```

## Troubleshooting

### Error: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/patilprashant48/bcm.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

### Error: "Permission denied"
Make sure you're logged into GitHub and have access to the repository.

## After Pushing

1. ✅ Verify all files are on GitHub
2. ✅ Check README.md displays correctly
3. ✅ Ensure .env files are NOT uploaded (check .gitignore worked)
4. ✅ Test cloning the repository to verify it works

## Clone Command (for others)

```bash
git clone https://github.com/patilprashant48/bcm.git
cd bcm
# Follow README.md for setup
```
