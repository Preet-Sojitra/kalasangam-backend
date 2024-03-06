# !/bin/bash

# check if seedMongo directory exists 
if [ ! -d "seedMongo" ]; then
    echo "seedMongo directory does not exist"
    exit 1
fi

echo "> DIRECTORY CHECKS PASSED"

# check if seedMongo directory is empty
if [ ! "$(ls -A seedMongo)" ]; then
    echo "seedMongo directory is empty"
    exit 1
fi

echo "> DIRECTORY IS NOT EMPTY"

# check if nodejs is installed
if ! [ -x "$(command -v node)" ]; then
    echo "nodejs is not installed"
    exit 1
fi

echo "> NODEJS CHECK PASSED"

# change directory to seedMongo and run npm install
cd seedMongo

echo "> INSTALLING DEPENDENCIES"
echo ""
npm install

echo ""
echo "> Dependencies installed"

# check if mongod is running
if ! pgrep mongod > /dev/null ; then
    echo "mongod is not running. Please run mongod and try again."
    exit 1
fi

echo "> MONGODB IS RUNNING"

# check if backend server is running
if [ "$(curl -s -o /dev/null -w ''%{http_code}'' http://localhost:3000)" != "200" ]; then
    echo "Backend server is not running. Please start the server and try again."
    exit 1
fi

echo "> BACKEND SERVER IS RUNNING"

# list all files in seedMongo directory
files=$(ls)

# make array of files
files=($files)

# print empty line
echo ""
echo "> SEEDING DATABASE"

for i in {0..3} # seed files are only first 4 files
do
    # run node command to seed the database
    node ${files[i]}
    echo "> ${files[i]} has been seeded"

    # sleep for 2 second before seeding the next file
    sleep 2
done

# print empty line
echo ""
echo "> DATABASE HAS BEEN SEEDED"
echo "> SEEDING COMPLETED"
echo "> YOU CAN NOW START THE FRONTEND SERVER"