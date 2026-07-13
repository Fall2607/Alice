git add .
git commit -m "Fix: Cuti HC email discovery logic to include employees in HC department even if they don't have user_id"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
