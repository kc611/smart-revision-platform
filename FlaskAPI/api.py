# The Flask Backend of the project
# Thi is where algorithms will be used to build customized quizzes and reading suggestions

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import pymongo
import time
import requests
import ast
from datetime import datetime

from flask import jsonify

# Following MongoDB key hidden for security purposes. Flask will not run without this key.
# from question_adder import connection_url

connection_url = 'mongodb://127.0.0.1:27017'

app = Flask(__name__)
client = pymongo.MongoClient(connection_url)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


# Database
Database = client.get_database('myFirstDatabase')
# Users Table
users_table = Database.users


@app.route('/', methods=['GET'])
def home():
    return "<h1>This is the API for Smart Revision Platform</h1><p>Please go to xyz to access our main site.</p>"

@app.route('/build-quiz',methods=['POST'])
def build_quiz():

    content = request.get_data()
    dict_str = content.decode("UTF-8")
    user_data = ast.literal_eval(dict_str)

    print(user_data)
    username = user_data["username"]
    user_organization = user_data["organization"]
    quiz_subject = user_data["subject"]
    quiz_num_questions = int(user_data["num_questions"])
    quiz_time = int(user_data["quiz_time"])
    quiz_name = user_data["quiz_name"]

    queryUser = {"username": username}
    query = users_table.find_one(queryUser)
    # print(query)
    # If query exists / user authenticated then continue else error
    

    # Fetch the specified number of questions
    org_database = client.get_database(user_organization)
    question_collection = org_database[f"{quiz_subject}_questions"]
    questions = list(question_collection.find({}).limit(quiz_num_questions))
    for i in range(0, quiz_num_questions):
        questions[i].pop('_id')

    # We can build a personalized quiz here, since we have the database data available.
    

    #Save the questions as a quiz in database
    user_database = client.get_database(username.split('@')[0])
    user_quizzes = user_database["quizzes"]

    quiz_object = {
		'created_on': datetime.now(),
        'num_questions':quiz_num_questions,
        'subject':quiz_subject,
        'quiz_time':quiz_time,
        'quiz_name':quiz_name,
		'questions': questions,
        'show_in_suggestions':False,
	}
    query = user_quizzes.insert_one(quiz_object)
    print(query.inserted_id)

    # Send the quiz code back to node server
    return jsonify({'quiz_code':str(query.inserted_id)})


@app.route('/build-report',methods=['POST'])
def build_report():
    content = request.get_data()
    dict_str = content.decode("UTF-8")
    report_data = ast.literal_eval(dict_str)
    return jsonify({'status':'Done'})

import os
import gridfs
import base64
uploads_dir = os.path.join(app.instance_path, 'uploads')

@app.route('/upload-file',methods=['POST'])
def upload_file():
    pdf = request.get_data()
    # TODO: Separate other data and the actual file bytes data
    pdf_file = open(uploads_dir+ "/sample.pdf", "wb")
    pdf_file.write(pdf)
    pdf_file.close()
    # TODO: Delete after uploaded to database

    return jsonify({'status':'Done'})

from flask import make_response, send_file
import io

@app.route('/get-file',methods=['GET','POST'])
@cross_origin()
def get_file():
    content = request.get_data()
    dict_str = content.decode("UTF-8")
    user_data = ast.literal_eval(dict_str)

    print(user_data)
    
    db = client.get_database(user_data["_database"])
    subject = user_data["subject"]
    filename = user_data["filename"]

    fs = gridfs.GridFS(db, collection = subject+'_notes')
    filelist = list(db[subject + '_notes.files'].find({"filename":filename},{"_id": 1, "filename": 1})) 
    print(filelist)
    fileid = filelist[0]['_id']
    fobj = fs.get(fileid).read()
    return send_file(
                     io.BytesIO(fobj),
                     attachment_filename='%s.pdf' % filename,
                     mimetype='application/pdf'
               )

import time
from bson.objectid import ObjectId
from bson.binary import Binary

@app.route('/build-suggestion',methods=['POST'])
def build_suggestion():
    content = request.get_data()
    dict_str = content.decode("UTF-8")
    req_data = ast.literal_eval(dict_str)
    print(req_data)

    username = req_data["username"].split("@")[0]
    db = client.get_database(username)
    user_suggestions = db["suggestions"]

    question_number = req_data['question_number']
    orig_quiz_code = req_data['quiz_code']
    orig_quiz = {'_id':ObjectId(orig_quiz_code)}
   

    sugg_query = user_suggestions.find_one({'question_number':question_number,'quiz_code':orig_quiz_code})

    if sugg_query is not None:
        return jsonify({'status':'Already present','suggestion_code':str(sugg_query['_id'])})

    orig_quiz = db['quizzes'].find_one(orig_quiz)

    db['quizzes'].update_one({'_id':orig_quiz['_id']},{"$set":{'show_in_suggestions':True}})

    # TODO: Handle this and render properly back in Nodejs
    db['responses'].update_one({'_id':ObjectId(req_data['response_code'])},{"$set":{'report_reqs.'+str(question_number):"1"}})

    with open("dsa1_5.pdf", "rb") as f:
        encoded1 = Binary(f.read())
    with open("dsa1_6.pdf", "rb") as f:
        encoded2 = Binary(f.read())
    with open("dsa1_7.pdf", "rb") as f:
        encoded3 = Binary(f.read())

    suggestion_object = {
		'created_on': datetime.now(),
        'question_number':question_number,
        "quiz_code":orig_quiz_code,
        'suggestion_1':encoded1,
        'suggestion_2':encoded2,
        'suggestion_3':encoded3
	}
    
    suggestion_query = user_suggestions.insert_one(suggestion_object)

    print(suggestion_query.inserted_id)
    # secs = int(report_data['question_number'])
    # time.sleep(5-secs)
    return jsonify({'status':'Done','suggestion_code':str(suggestion_query.inserted_id)})

# # To insert a single document into the database,
# # insert_one() function is used
# @app.route('/insert-one/<name>/<id>/', methods=['GET'])
# def insertOne(name, id):
# 	queryObject = {
# 		'Name': name,
# 		'ID': id
# 	}
# 	query = SampleTable.insert_one(queryObject)
# 	return "Query inserted...!!!"

# # To find the first document that matches a defined query,
# # find_one function is used and the query to match is passed
# # as an argument.
# @app.route('/find-one/<argument>/<value>/', methods=['GET'])
# def findOne(argument, value):
# 	queryObject = {argument: value}
# 	query = SampleTable.find_one(queryObject)
# 	query.pop('_id')
# 	return jsonify(query)

# # To find all the entries/documents in a table/collection,
# # find() function is used. If you want to find all the documents
# # that matches a certain query, you can pass a queryObject as an
# # argument.
# @app.route('/find/', methods=['GET'])
# def findAll():
# 	query = SampleTable.find()
# 	output = {}
# 	i = 0
# 	for x in query:
# 		output[i] = x
# 		output[i].pop('_id')
# 		i += 1
# 	return jsonify(output)


# # To update a document in a collection, update_one()
# # function is used. The queryObject to find the document is passed as
# # the first argument, the corresponding updateObject is passed as the
# # second argument under the '$set' index.
# @app.route('/update/<key>/<value>/<element>/<updateValue>/', methods=['GET'])
# def update(key, value, element, updateValue):
# 	queryObject = {key: value}
# 	updateObject = {element: updateValue}
# 	query = SampleTable.update_one(queryObject, {'$set': updateObject})
# 	if query.acknowledged:
# 		return "Update Successful"
# 	else:
# 		return "Update Unsuccessful"


if __name__ == '__main__':
	app.run(debug=True)

