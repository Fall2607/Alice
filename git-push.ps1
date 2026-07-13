git add .
git commit -m "Feat: Add rejected_by column to capture and display who rejected the cuti"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
