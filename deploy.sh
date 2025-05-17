#!/bin/bash

# Simple script to deploy Flappy Austin to GitHub Pages

echo "Preparing to deploy Flappy Austin to GitHub Pages..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "game.js" ]; then
    echo "Error: Make sure you're in the Flappy Austin directory."
    exit 1
fi

# Initialize git repository if it doesn't exist
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    
    # Configure git user if not already done
    if [ -z "$(git config user.name)" ]; then
        echo "Please enter your GitHub username:"
        read username
        git config user.name "$username"
    fi
    
    if [ -z "$(git config user.email)" ]; then
        echo "Please enter your GitHub email:"
        read email
        git config user.email "$email"
    fi
fi

# Create .gitignore
echo "Creating .gitignore file..."
cat > .gitignore << EOL
.DS_Store
*~
._*
.env
node_modules/
EOL

# Add all files to git
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy Flappy Austin with AdSense"

# Create or update gh-pages branch
echo "Creating/updating gh-pages branch..."
git branch -M gh-pages

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "Please enter your GitHub repository URL (e.g., https://github.com/sethjones348/sethjones348.github.io.git):"
    read repo_url
    git remote add origin "$repo_url"
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin gh-pages --force

echo ""
echo "Deployment complete! Your game should be available at your GitHub Pages URL."
echo "Remember to verify your AdSense account by checking that the code is properly inserted."
echo ""
echo "Your actual ad units will appear after verification is complete and you've created the ad units in your AdSense account."

exit 0 