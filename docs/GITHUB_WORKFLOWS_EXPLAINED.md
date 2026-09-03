# GitHub Workflows & CI/CD Explained (Beginner's Guide)

## 🤔 What is CI/CD?

**CI/CD** stands for **Continuous Integration** and **Continuous Deployment**.

Think of it like having an **automatic quality checker** that runs every time you push code to GitHub.

### Simple Analogy
Imagine you're building a house:
- **CI (Continuous Integration)** = An inspector automatically checks your work after each change
- **CD (Continuous Deployment)** = If everything passes inspection, the house is automatically moved to the neighborhood

In software:
- **CI** = Automatically test and check your code when you push it
- **CD** = Automatically deploy (publish) your app if tests pass

---

## 📁 What is a GitHub Workflow?

A **GitHub Workflow** is a file that tells GitHub: *"Hey, when someone pushes code, do these things automatically!"*

Your workflow file is located at:
```
.github/workflows/ci.yml
```

The `.github` folder is special - GitHub automatically looks here for workflow files.

---

## 🔍 What Does YOUR Workflow Do?

Let's break down your `ci.yml` file step by step:

### 1. **When Does It Run?** (Lines 3-7)

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**Translation:**
- ✅ Run when code is **pushed** to `main` or `develop` branches
- ✅ Run when someone creates a **Pull Request** to `main` or `develop`

**Example:**
- You push code → Workflow runs automatically
- Someone opens a PR → Workflow runs to check if their code is good

---

### 2. **What Job Does It Run?** (Line 10)

```yaml
jobs:
  lint-and-build:
```

**Translation:**
- Creates a job called `lint-and-build`
- This job will check your code and build it

---

### 3. **Where Does It Run?** (Line 11)

```yaml
runs-on: ubuntu-latest
```

**Translation:**
- Runs on a fresh Ubuntu Linux computer (provided by GitHub)
- This is a **virtual machine** - like a temporary computer that gets deleted after the job finishes
- You don't pay for it (free for public repos, limited free hours for private repos)

---

### 4. **Step-by-Step: What Happens?**

#### Step 1: Checkout Code (Lines 14-15)
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

**What it does:**
- Downloads your code from GitHub to the virtual machine
- Like doing `git clone` on a fresh computer

**Why:**
- The virtual machine starts empty, so it needs to get your code first

---

#### Step 2: Setup Node.js (Lines 17-20)
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
```

**What it does:**
- Installs Node.js version 18 on the virtual machine
- Like running `nvm install 18` on your computer

**Why:**
- Your project needs Node.js to run (for npm, TypeScript, etc.)

---

#### Step 3: Install Dependencies (Lines 23-24)
```yaml
- name: Install dependencies
  run: npm install --include=dev
```

**What it does:**
- Runs `npm install` to download all your packages
- Like running `npm install` on your computer

**Why:**
- The virtual machine needs all your dependencies (React, Express, Prisma, etc.) before it can build or test

---

#### Step 4: Build Shared Package (Lines 26-27)
```yaml
- name: Build shared package first (required by other packages)
  run: npm run build --workspace=shared
```

**What it does:**
- Builds the `shared` package first
- Like running `npm run build` in the `shared` folder

**Why:**
- Your `frontend` and `backend` depend on `shared`
- You must build `shared` first, or the other builds will fail

---

#### Step 5: Lint Shared Package (Lines 29-31)
```yaml
- name: Lint shared package
  run: npm run lint --workspace=shared
  continue-on-error: true
```

**What it does:**
- Checks code quality in the `shared` package
- Looks for style issues, unused variables, etc.

**Why `continue-on-error: true`?**
- Even if linting finds issues, don't stop the workflow
- It will still report the errors, but won't fail the entire build

---

#### Step 6: Lint Backend (Lines 33-35)
```yaml
- name: Lint backend
  run: npm run lint --workspace=backend
  continue-on-error: true
```

**What it does:**
- Checks code quality in the `backend` package
- Same as above, but for backend code

---

#### Step 7: Lint Frontend (Lines 37-39)
```yaml
- name: Lint frontend
  run: npm run lint --workspace=frontend
  continue-on-error: true
```

**What it does:**
- Checks code quality in the `frontend` package
- Same as above, but for frontend code

---

#### Step 8: Type Check (Lines 41-42)
```yaml
- name: Type check
  run: npm run type-check
```

**What it does:**
- Runs TypeScript type checking across all packages
- Checks if your TypeScript code has type errors

**Why this is important:**
- Catches bugs before they reach production
- Example: If you try to use a string as a number, TypeScript will catch it here

**Note:** This step will **FAIL** if there are type errors (unlike linting)

---

#### Step 9: Build Backend (Lines 44-45)
```yaml
- name: Build backend
  run: npm run build --workspace=backend
```

**What it does:**
- Compiles your TypeScript backend code to JavaScript
- Like running `npm run build` in the `backend` folder

**Why:**
- Verifies that your backend code can actually be built
- If there are compilation errors, this will fail

---

#### Step 10: Build Frontend (Lines 47-48)
```yaml
- name: Build frontend
  run: npm run build --workspace=frontend
```

**What it does:**
- Compiles your Next.js frontend code
- Like running `npm run build` in the `frontend` folder

**Why:**
- Verifies that your frontend code can actually be built
- If there are build errors, this will fail

---

## 🎯 What Happens If Something Fails?

### ✅ **If Everything Passes:**
- You see a green checkmark ✅ on your commit/PR
- You know your code is ready to merge/deploy

### ❌ **If Something Fails:**
- You see a red X ❌ on your commit/PR
- You can click on it to see which step failed
- You fix the issue and push again

---

## 📊 Where Can I See This Running?

1. **On GitHub:**
   - Go to your repository
   - Click the **"Actions"** tab (top menu)
   - You'll see all workflow runs

2. **On Commits:**
   - Each commit shows a status icon (✅ or ❌)
   - Click it to see the workflow results

3. **On Pull Requests:**
   - PRs show workflow status at the bottom
   - You can't merge if checks are failing (if you set branch protection)

---

## 💡 Why Is This Useful?

### 1. **Catches Bugs Early**
- Instead of finding errors after deploying, you find them immediately
- Example: TypeScript error caught before it reaches production

### 2. **Saves Time**
- You don't have to manually run `npm run build` and `npm run type-check` every time
- It happens automatically

### 3. **Team Collaboration**
- When someone opens a PR, you can see if their code builds correctly
- No need to manually test their changes

### 4. **Confidence**
- Green checkmark = "This code is safe to merge"
- Red X = "Fix this before merging"

---

## 🔧 Common Workflow Statuses

| Status | Meaning |
|--------|---------|
| ✅ **Success** | All steps passed, code is good! |
| ❌ **Failure** | One or more steps failed, fix the errors |
| 🟡 **In Progress** | Workflow is currently running |
| ⏸️ **Cancelled** | Workflow was cancelled (usually by you) |

---

## 🚀 What Could You Add Later?

### 1. **Automated Testing**
```yaml
- name: Run tests
  run: npm test
```

### 2. **Automated Deployment**
```yaml
- name: Deploy to production
  run: npm run deploy
```

### 3. **Security Scanning**
```yaml
- name: Check for vulnerabilities
  run: npm audit
```

### 4. **Code Coverage**
```yaml
- name: Generate coverage report
  run: npm run test:coverage
```

---

## 📝 Summary

Your workflow does this:

1. **Triggers** when you push code or open a PR
2. **Sets up** a fresh Ubuntu machine with Node.js
3. **Downloads** your code
4. **Installs** dependencies
5. **Builds** the shared package first
6. **Lints** all packages (checks code style)
7. **Type checks** everything (catches TypeScript errors)
8. **Builds** backend and frontend (verifies they compile)

**Result:** You know immediately if your code has any issues before merging or deploying!

---

## 🎓 Key Terms

- **Workflow** = The automated process (your `ci.yml` file)
- **Job** = A collection of steps (your `lint-and-build` job)
- **Step** = A single action (like "Install dependencies")
- **Action** = A reusable piece of code (like `actions/checkout@v4`)
- **Runner** = The virtual machine that runs your workflow (Ubuntu in your case)

---

## ❓ FAQ

### Q: Does this cost money?
**A:** Free for public repositories. Private repos get 2,000 free minutes/month.

### Q: How long does it take?
**A:** Usually 2-5 minutes, depending on your project size.

### Q: Can I run it manually?
**A:** Yes! Go to Actions tab → Select workflow → Click "Run workflow"

### Q: What if I don't want it to run?
**A:** You can disable it in repository settings, or delete the workflow file.

### Q: Can I see what went wrong?
**A:** Yes! Click on the failed workflow run to see detailed logs for each step.

---

## 🔗 Learn More

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CI/CD Best Practices](https://docs.github.com/en/actions/guides/about-continuous-integration)

---

**Last Updated:** January 2025

