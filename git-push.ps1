git add .
git commit -m "Fix: Handle 409/403 info status in AbsensiTab Live Absen to match Kiosk behavior"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
