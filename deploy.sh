#!/bin/bash

echo "Starting deployment process..."

# .quartoディレクトリを削除
rm -rf .quarto
echo "Removed .quarto cache directory"

# CNAMEと.nojekyllファイルのバックアップ
[ -f docs/CNAME ] && cp docs/CNAME docs_CNAME.tmp
[ -f docs/.nojekyll ] && cp docs/.nojekyll docs_nojekyll.tmp

# docsディレクトリを完全に削除
rm -rf docs
mkdir docs

# バックアップファイルの復元
[ -f docs_CNAME.tmp ] && mv docs_CNAME.tmp docs/CNAME
[ -f docs_nojekyll.tmp ] && mv docs_nojekyll.tmp docs/.nojekyll

# サイトのビルド
echo "Building site with full render..."
quarto render

# Git操作
git add .
git commit -m "Deploy website"
git push origin main

echo "Deployment complete!"