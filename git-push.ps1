git add .
git commit -m "Fix: Restrict HC email recipients strictly to those with HRD roles in users table"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
