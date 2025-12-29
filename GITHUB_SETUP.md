# 🔐 GitHub Authentication Setup

Your code is ready to push, but you need to authenticate with GitHub first.

## Option 1: Using Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token
1. Go to: https://github.com/settings/tokens/new
2. Note: "SpeakEase Project"
3. Expiration: Choose your preference (90 days or No expiration)
4. Select scopes:
   - ✅ repo (Full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Configure Git to Use the Token
Run these commands:

```bash
# Store credentials (so you don't have to enter token every time)
git config --global credential.helper store

# Push with your token
git push -u origin main
```

When prompted:
- **Username**: Hamzasohail123
- **Password**: [paste your personal access token]

---

## Option 2: Using SSH (More Secure)

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "hamzasohail429@gmail.com"
```
Press Enter for all prompts (use default location and no passphrase).

### Step 2: Copy Your Public Key
```bash
cat ~/.ssh/id_ed25519.pub
```

### Step 3: Add to GitHub
1. Go to: https://github.com/settings/ssh/new
2. Title: "SpeakEase Development"
3. Paste the key from step 2
4. Click "Add SSH key"

### Step 4: Change Remote to SSH
```bash
git remote set-url origin git@github.com:Hamzasohail123/speakease.git
git push -u origin main
```

---

## Quick Push Command

After setting up authentication (either option), run:

```bash
git push -u origin main
```

Your repository will be live at:
🔗 https://github.com/Hamzasohail123/speakease

