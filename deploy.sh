#!/bin/bash
# TEF Master - One-Click Deploy to Netlify
# Just double-click this file or run: bash deploy.sh

echo "🚀 Deploying TEF Master to Netlify..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Deploy to the existing Netlify site
npx netlify-cli deploy --prod --dir=. --site=c4428bd1-f800-4735-9e94-ea5da9097e5b

echo ""
echo "✅ Deploy complete! Visit: https://tef-master.netlify.app"
echo ""
read -p "Press Enter to close..."
