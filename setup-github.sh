#!/bin/bash

echo "🚀 Setting up GitHub repository for SpeakEase..."
echo ""
echo "Please create a new repository on GitHub:"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: speakease (or ai-english-speaker)"
echo "3. Description: AI-powered English speaking practice platform with voice conversations"
echo "4. Make it Public or Private (your choice)"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo ""
echo "Once created, enter your repository name below:"
read -p "Repository name: " REPO_NAME

GITHUB_USERNAME="Hamzasohail123"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "📝 Adding remote repository..."
git remote add origin "$REPO_URL"

echo "✅ Remote added successfully!"
echo ""
echo "🔍 Checking remote..."
git remote -v

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✨ Done! Your repository is now on GitHub:"
echo "   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
