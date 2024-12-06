#!/bin/bash
# deploy.sh として保存

# 特定ファイルを保護してクリーンアップ
find docs/ -type f ! -name 'CNAME' ! -name '.nojekyll' -delete

# サイトのビルド
quarto render

# Git関連の処理
git add docs/
git commit -m "Deploy website"
git push origin main