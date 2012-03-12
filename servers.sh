cd dooh
killall mongod
echo "Launching MongoDB server..."
rm -fr ./tmp
mkdir -p ./tmp/db
mongod --dbpath ./tmp/db --logpath ./tmp/mongodb.log --logappend &
