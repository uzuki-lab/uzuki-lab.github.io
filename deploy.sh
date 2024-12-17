#!/bin/bash

# デバッグ用のメッセージを表示
echo "Starting deployment process..."

# CNAMEと.nojekyllファイルを一時的に保存（存在する場合）
echo "Backing up CNAME and .nojekyll files..."
[ -f docs/CNAME ] && cp docs/CNAME docs_CNAME.tmp
[ -f docs/.nojekyll ] && cp docs/.nojekyll docs_nojekyll.tmp

# docsディレクトリを完全に削除
echo "Removing docs directory..."
rm -rf docs
ls -la # ディレクトリが削除されたか確認

# docsディレクトリを再作成
echo "Creating new docs directory..."
mkdir docs
ls -la docs # 新しいディレクトリが空であることを確認

# 保存したファイルを戻す（存在した場合）
echo "Restoring CNAME and .nojekyll files..."
[ -f docs_CNAME.tmp ] && mv docs_CNAME.tmp docs/CNAME
[ -f docs_nojekyll.tmp ] && mv docs_nojekyll.tmp docs/.nojekyll

# サイトのビルド
echo "Building site..."
quarto render

# すべての変更をステージング
echo "Staging changes..."
git add .

# 変更をコミット
echo "Committing changes..."
git commit -m "Deploy website"

# mainブランチにプッシュ
echo "Pushing to main branch..."
git push origin main

echo "Deployment complete!"