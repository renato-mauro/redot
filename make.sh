#!/bin/bash

cd site
./generate.sh
cd ..
git checkout master
git add *
git commit -m "$1"
git push
git checkout gh-pages
git rebase master
git push
git checkout master
