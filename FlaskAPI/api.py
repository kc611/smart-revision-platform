# The Flask Backend of the project
# Thi is where algorithms will be used to build customized quizzes and reading suggestions

from flask import Flask, jsonify, request, make_response, send_file
from flask_cors import CORS, cross_origin
import pymongo
import time
import requests
import ast
import io
from datetime import datetime
import os
import gridfs
import base64
import time
from bson.objectid import ObjectId
from bson.binary import Binary
import numpy as np
from sklearn.neighbors import NearestNeighbors


connection_url = 'mongodb://127.0.0.1:27017'

app = Flask(__name__)
client = pymongo.MongoClient(connection_url)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

uploads_dir = os.path.join(app.instance_path, 'uploads')

def select_nearest_questions(personalized_question, all_org_questions):
    all_vects = []
    # Encode all example sentences
    for _vect in all_org_questions:
        curr_vects = _vect["vectorized"]
        all_vects.append(curr_vects)

    # Encode query sentence
    query_vects = personalized_question["vectorized"]

    # Fit the query string onto a nearest neighbour space
    nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree').fit(query_vects)
    curr_dist = 100000000
    curr_ind = 0
    for i in range(0, len(all_vects)):
        # For every sentence calculate pairwise 1st nearest neighbour to every word
        distances, indices = nbrs.kneighbors(all_vects[i])
        # The distances give us pairwise nearest neighbour between current sentence and query sentence
        # We sum those distances the lower the sum the nearer the meaning of those words (pairwise)
        dist_sum = np.sum(distances)
        if dist_sum < curr_dist:
            curr_dist = dist_sum
            curr_ind = i

    return all_org_questions[i]

def build_quiz_from_data(num_questions, org_question_collection, incorr_question_collection, quiz_subject):
    num_random_questions = int(num_questions/2)
    num_personalized_questions = num_questions - num_random_questions
    all_org_questions = list(org_question_collection.find({}))

    personalized_questions = []
    
    # Take incorrect question from prev 5 quizzes
    all_incorrect_questions_collec = list(incorr_question_collection.find({"subject":quiz_subject}).limit(5))
    all_incorrect_questions = []
    for _collec in all_incorrect_questions_collec:
        all_incorrect_questions.extend(_collec["questions"])

    #  Randomly select half of the required questions out of them
    if len(all_incorrect_questions) < num_personalized_questions:
        num_random_questions = num_questions - len(all_incorrect_questions)
        num_personalized_questions = len(all_incorrect_questions)
        temp_personalized_questions = all_incorrect_questions
    else:
        random_indices = np.random.choice(np.arange(0, len(all_incorrect_questions)), size=num_personalized_questions,replace=False)  
        temp_personalized_questions = [all_incorrect_questions[_index] for _index in random_indices]
    
    # replace each incorrect question with its nearest question
    for i in range(0, len(temp_personalized_questions)):
        personalized_questions.append(select_nearest_questions(temp_personalized_questions[i], all_org_questions))

    personalized_question_statements = [_question["question"] for _question in personalized_questions]

    # From random question select those who aren't selected till now by comparing the question statements
    random_questions = [_question for _question in all_org_questions if _question["question"] not in personalized_question_statements] 
    random_indices = np.random.choice(np.arange(0, len(random_questions)), size=num_random_questions,replace=False) 
    random_questions = [random_questions[_index] for _index in random_indices]
    for i in range(0, len(random_questions)):
        random_questions[i].pop("_id")

    print(len(personalized_questions))
    print(len(random_questions))
    questions = personalized_questions + random_questions

    return questions

@app.route('/build-quiz',methods=['POST'])
def build_quiz_endpoint():

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

    # Database
    Database = client.get_database('myFirstDatabase')
    # Users Table
    users_table = Database.users
    queryUser = {"username": username}
    query = users_table.find_one(queryUser)
    

    # Fetch the specified number of questions
    org_database = client.get_database(user_organization)
    question_collection = org_database[f"{quiz_subject}_questions"]
    usr_database = client.get_database(username.split("@")[0])
    incorr_question_collection = usr_database["incorrects"]

    # We can build a personalized quiz here, since we have the database data available.
    questions = build_quiz_from_data(quiz_num_questions, question_collection, incorr_question_collection, quiz_subject)

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

@app.route('/upload-file',methods=['POST'])
def upload_file():
    pdf_data = request.get_data()
    if request.form.get("type") == "usr":
        Database = client.get_database(request.form.get("user_name"))
    else:
        Database = client.get_database(request.form.get("organization"))
    curr_subject = request.form.get("subject")

    SampleTable = Database[curr_subject+"_notes"]
    db = Database
    fs = gridfs.GridFS(db,collection=curr_subject+'_notes')
   
    with fs.new_file(
        filename=request.form.get("file_name"),
        book_name=request.form.get("book_name"),
        author_name=request.form.get("author_name"),
        # encoding="utf-8"
        ) as fp:
        fp.write(pdf_data)

    return jsonify({'status':'Done'})

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


@app.route('/get-suggestion',methods=['GET','POST'])
@cross_origin()
def get_sugg():
    content = request.get_data()
    dict_str = content.decode("UTF-8")
    user_data = ast.literal_eval(dict_str)

    print(user_data)
    
    db = client.get_database(user_data["_database"])
    sugg_collection = db["suggestions"]
    sugg_data = sugg_collection.find_one({"quiz_code":user_data["quiz_code"],"question_number":int(user_data["question_number"])})

    filename = "sample"
    return send_file(
                     io.BytesIO(sugg_data["suggestion_"+user_data["sugg_ind"]]),
                     attachment_filename='%s.pdf' % filename,
                     mimetype='application/pdf'
               )

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
    return jsonify({'status':'Done','suggestion_code':str(suggestion_query.inserted_id)})

@app.route('/', methods=['GET'])
def home():
    return "<h1>This is the API for Smart Revision Platform</h1><p>Please go to xyz to access our main site.</p>"

if __name__ == '__main__':
	app.run(debug=True)

