import pymongo
import time
import requests
import ast
import base64
import gridfs
connection_url = 'mongodb://127.0.0.1:27017'

client = pymongo.MongoClient(connection_url)

# Database
Database = client.get_database('ABVIIITM')

SampleTable = Database["dsa_notes"]

def write_new_pdf(path):
    db = Database
    fs = gridfs.GridFS(db,collection='dsa_notes')
    # Note, open with the "rb" flag for "read bytes"
    with open(path, "rb") as f:
        encoded_string = f.read()
    with fs.new_file(
        filename=path.split('/')[-1],
        book_name=(path.split('/')[-1]).split('.')[0],
        author_name=(path.split('/')[-1]).split('.')[0]
        ) as fp:
        fp.write(encoded_string)

write_new_pdf('/home/kc611/Desktop/Btech Minor Project/smart-revision-platform/FlaskAPI/dsa1.pdf')
write_new_pdf('/home/kc611/Desktop/Btech Minor Project/smart-revision-platform/FlaskAPI/dsa2.pdf')
write_new_pdf('/home/kc611/Desktop/Btech Minor Project/smart-revision-platform/FlaskAPI/dsa3.pdf')
write_new_pdf('/home/kc611/Desktop/Btech Minor Project/smart-revision-platform/FlaskAPI/dsa4.pdf')
