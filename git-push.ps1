git add .
git commit -m "Fix: Make NIP visible on mobile profile header and display NIP prominently below QR code"
git push origin master
git checkout development
git merge master
git push origin development
git checkout master
