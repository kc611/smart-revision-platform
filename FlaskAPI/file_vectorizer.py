from PyPDF2 import PdfFileWriter, PdfFileReader
from io import BytesIO
# importing required modules 
import string
import re
import os
import numpy as np   
from scipy import spatial
import gensim.downloader as api
from pdfminer.high_level import extract_text
import os
from sklearn.neighbors import NearestNeighbors
import numpy as np
import pymongo

dir_path = os.path.dirname(os.path.realpath(__file__))
connection_url = 'mongodb://127.0.0.1:27017'

client = pymongo.MongoClient(connection_url)

def to_sentence(text):
    # Split page into paragraphs
    paras = text.split("\n\n")
    res = []
    for _text in paras:
        _text = _text.replace("\n", " ")
        _text = _text.replace(string.punctuation, " ")
        _text = _text.split(".")
        res.extend(_text)
    return res

#choose from multiple models https://github.com/RaRe-Technologies/gensim-data
model = api.load("glove-wiki-gigaword-50") 

with open("./stop_words.txt", "r") as f:
  stop_words = f.read().split("\n")

def preprocess_sentence(_sent):
  #  Remove unnecessary characters
  _sent = _sent.replace("?", "")
  _sent = _sent.replace("_", "")
  _sent = _sent.replace(",", "")
  _sent = _sent.replace(".", " ")

  _sent = _sent.lower()
  _sent = _sent.split(" ")
  # Remove Stop words
  _sent = [_word for _word in _sent if _word not in stop_words]
  
  curr_vects = []
  for _word in _sent:
    try:
      # Uses glove to encode the words into vectors
      curr_vec = model[_word]
      curr_vects.append(curr_vec)
    except:
      pass
  return np.array(curr_vects)

def vectorize_and_update(pdf_data, user_name, org, curr_subject):
  with open("sample.pdf", "wb") as file1:
    file1.write(pdf_data)
      # Database
  Database = client.get_database(org)
  SampleTable = Database[f"{curr_subject}_questions"]
  all_questions = list(SampleTable.find({}))
  all_data = []

  useful_pages = [5, 25]
  for i in range(useful_pages[0]-1, useful_pages[1]):
    print("Page : ", i)
    text = extract_text(os.path.join(dir_path,"sample.pdf"), page_numbers=[i])
    text = text.lower()
    all_sent = to_sentence(text)
    # print(text)
    # text_file = open(os.path.join(dir_path,"sample.pdf"), "w")
    # text_file.write(str(text))
    # text_file.close()
    all_vects = []
    # Encode all example sentences
    for _sent in all_sent:
        curr_vects = preprocess_sentence(_sent)
        all_vects.extend(curr_vects)

    # Fit the query string onto a nearest neighbour space
    all_vects = np.array(all_vects)
    nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree').fit(all_vects)
    curr_dict = {}
    
    for _question in all_questions:
      query = _question['question']
      # Encode query sentence
      query_vects = preprocess_sentence(query)
      distances, indices = nbrs.kneighbors(query_vects)
      # The distances give us pairwise nearest neighbour between current sentence and query sentence
      # We sum those distances the lower the sum the nearer the meaning of those words (pairwise)
      dist_sum = np.sum(distances)
      print("Query : ", query)
      print("Distance : ", dist_sum)
      curr_dict[query] = dist_sum
    all_data.append(curr_dict)
  return all_data


with open("dsa2.pdf", "rb") as file1:
  # Reading form a file
  _data = file1.read()

vectorize_and_update(_data, "SampleUser2", "ABVIIITM","dsa")
