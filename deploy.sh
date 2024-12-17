#!/bin/bash

# CNAMEと.nojekyllファイルを一時的に保存（存在する場合）
[ -f docs/CNAME ] && cp docs/CNAME docs_CNAME.tmp
[ -f docs/.nojekyll ] && cp docs/.nojekyll docs_nojekyll.tmp

# docsディレクトリを完全に削除
rm -rf docs

# docsディレクトリを再作成
mkdir docs

# 保存したファイルを戻す（存在した場合）
[ -f docs_CNAME.tmp ] && mv docs_CNAME.tmp docs/CNAME
[ -f docs_nojekyll.tmp ] && mv docs_nojekyll.tmp docs/.nojekyll

# サイトのビルド
quarto render

# すべての変更をステージング
git add .

# 変更をコミット
git commit -m "Deploy website"

# mainブランチにプッシュ
git push origin main