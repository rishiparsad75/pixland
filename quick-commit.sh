# Quick Git Commit and Push Script
# Save time by using this script to commit and push changes

# Add all changes
git add .

# Commit with a descriptive message (edit the message below)
git commit -m "Update: [describe your changes here]"

# Pull latest changes and rebase
git pull origin main --rebase

# Push to GitHub
git push origin main

# Done!
echo "✅ Changes pushed to GitHub successfully!"
