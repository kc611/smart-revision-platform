# The Flask Backend of the project
# Thi is where algorithms will be used to build customized quizzes and reading suggestions

from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo
import time
import requests
import ast
from datetime import datetime

from flask import jsonify

# Following MongoDB key hidden for security purposes. Flask will not run without this key.
from question_adder import connection_url

app = Flask(__name__)
client = pymongo.MongoClient(connection_url)

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

