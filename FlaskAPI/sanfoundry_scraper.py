import requests
from bs4 import BeautifulSoup
import pymongo
import time
import requests
import ast

# Script used to add questions from sanfoundry websote using web scraping

connection_url = 'mongodb://127.0.0.1:27017'

client = pymongo.MongoClient(connection_url)

# Database
Database = client.get_database('ABVIIITM')

subject = "dsa"

SampleTable = Database[f"{subject}_questions"]
import gensim.downloader as api
import numpy as np

#choose from multiple models https://github.com/RaRe-Technologies/gensim-data
model = api.load("glove-wiki-gigaword-50") 
with open("./stop_words.txt", "r") as f:
  stop_words = f.read().split("\n")

def preprocess_sentence(_sent):
  #  Remove unnecessary characters
  _sent = _sent.replace("?", "")
  _sent = _sent.replace("_", "")
  _sent = _sent.replace(",", "")
  _sent = _sent.replace(".", "")

  _sent = _sent.lower()
  _sent = _sent.split(" ")
  # Remove Stop words
  _sent = [_word for _word in _sent if _word not in stop_words]
  
  curr_vects = []
  for _word in _sent:
    try:
      # Uses glove to encode the words into vectors
      curr_vec = model[_word]
      curr_vects.append(curr_vec.tolist())
    except:
      pass
  return curr_vects

def insertOne(question,topic,answer,options,explain):
    queryObject = {
		"question":question,
        "topic":topic,
        "answer":answer,
        "options":options,
        "explain":explain,
        "vectorized":preprocess_sentence(question),
        "vectorized_explain":preprocess_sentence(explain),
	}
    query = SampleTable.insert_one(queryObject)
    return "Query inserted...!!!"


page = requests.get(
    "https://www.sanfoundry.com/data-structure-questions-answers-array-array-operations/")
soup = BeautifulSoup(page.content, 'html.parser')

# Extract title of page
questions = soup.find('div', attrs = {'class':'entry-content'}) 
# print the result
page_text = questions.text

for i in range (1,100):
    try:
        curr_quest = page_text.split(f"{i}. ")[1]
        curr_quest = curr_quest.split(f"{i+1}. ")[0]
    except:
        break

    curr_quest = curr_quest.split('\n')

    quest_statement = curr_quest[0]
    optiona = [curr[3:] for curr in curr_quest if curr.startswith('a)')]
    optionb = [curr[3:] for curr in curr_quest if curr.startswith('b)')]
    optionc = [curr[3:] for curr in curr_quest if curr.startswith('c)')]
    optiond = [curr[3:] for curr in curr_quest if curr.startswith('d)')]
    options = []
    options.extend(optiona)
    options.extend(optionb)
    options.extend(optionc)
    options.extend(optiond)

    ans = [curr for curr in curr_quest if curr.startswith('View Answer')]
    correct_opt = ans[0][-1]
    if correct_opt=='a':
        correct_opt=0
    elif correct_opt=='b':
        correct_opt=1
    elif correct_opt=='c':
        correct_opt=2
    elif correct_opt=='d':
        correct_opt=3
    else:
        raise ValueError("Incorrect option detected")

    explain = [curr for curr in curr_quest if curr.startswith('Explanation:')]
    explain = explain[0].split(": ")[1]
    print(quest_statement)

    insertOne(quest_statement, soup.title.text, correct_opt, options, explain)
    print(quest_statement)
    print(options)
    print(correct_opt)
    print(explain)
 
# To add questions from user
# while(True):
#     print("Enter Topic: ")
#     topic = input()
#     print("Enter Question: ")
#     question = input()

#     options = []
#     for i in range(0,4):
#         print(f"Enter option {i+1}:")
#         options.append(input())

#     print("Enter option number for correct answer:")
#     answer = int(input())-1

#     print(insertOne(question, topic, answer, options))
