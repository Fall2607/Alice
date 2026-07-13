git add .
git commit -m "Fix: Type cast ILIKE for enum status_cuti and move Approval Cuti to Kehadiran/Cuti"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
