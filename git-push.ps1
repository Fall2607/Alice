git add .
git commit -m "Fix: Variable shadowing bug (TDZ) in api/absensi/[karyawan_id]"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
