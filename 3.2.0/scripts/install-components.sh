set -e

cd src
bower install
mv bower_components/showdown/dist/showdown.min.js ./
rm -r bower_components
cd ..