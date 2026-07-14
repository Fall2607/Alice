git add .
git commit -m "Feat: Loosen facial recognition threshold for NIP-based 1-to-1 check-ins"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
