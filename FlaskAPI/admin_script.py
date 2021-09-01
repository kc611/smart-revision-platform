
# Small script used to add an Admin account of college to the database

confirm = ""
while 1:
    college_name = input("Enter Name of the college : ")
    username = input("Username of Admin Account to be created : ")
    password = input("Enter password of admin account : ")

    print("Please verify your data : ")
    print("Name of College: ", college_name)
    print("Username of Admin Account", username)
    print("Password of Admin Account", password)

    while 1:
        confirm = input("Please Enter 'yes' to continue or 'no' to edit : ")
        if (confirm == 'yes' or confirm == 'no'):
            break
        print(confirm)
    if confirm=="yes":
        break

import pymongo
import time
import requests
import ast
import base64
import gridfs
# connection_url = 'mongodb://127.0.0.1:27017'

# client = pymongo.MongoClient(connection_url)
# Database = client.get_database('test')
# org_table = Database["organizations"]

queryObject = {
    "college_name":college_name,
    "username":username,
    "password":password
}

URL = "http://localhost:3000/admin/register"

r = requests.post(url = URL, data = queryObject)
print(r.text)
print("You can now log-in using these credentials")
