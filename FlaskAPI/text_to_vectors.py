# importing required modules 
import string
import re
import numpy as np   
from scipy import spatial
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
      curr_vects.append(curr_vec)
      print(curr_vec.shape)
    except:
      pass
  return np.array(curr_vects)


s0 = 'Which of these best describes an array?'
s1 = 'How do you initialize an array in C?'
s2 = 'How do you instantiate an array in Java?'
s3 = 'Which of the following is the correct way to declare a multidimensional array in Java?'
s4 = 'What is the output of the following Java code?'
s5 = 'What is the output of the following Java code?'
s6 = 'When does the Array Index Out Of Bounds Exception occur?'
s7 = 'Which of the following concepts make extensive use of arrays?'
s8 = 'What are the advantages of arrays?'
s9 = 'What are the disadvantages of arrays?'
s10 = 'Assuming int is of 4 bytes, what is the size of int arr[15];?'
s11 = 'In general, the index of the first element in an array is __________'
s12 = 'Elements in an array are accessed _____________'

all_sent = [s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12]
all_vects = []

# Encode all example sentences
for _sent in all_sent:
  curr_vects = preprocess_sentence(_sent)
  all_vects.append(curr_vects)

query = 'How do you instantiate an array in Python?'

# Encode query sentence
query_vects = preprocess_sentence(query)

from sklearn.neighbors import NearestNeighbors
import numpy as np

# Fit the query string onto a nearest neighbour space
nbrs = NearestNeighbors(n_neighbors=1, algorithm='ball_tree').fit(query_vects)


for i in range(0, len(all_vects)):
  # For every sentence calculate pairwise 1st nearest neighbour to every word
  distances, indices = nbrs.kneighbors(all_vects[i])
  # The distances give us pairwise nearest neighbour between current sentence and query sentence
  # We sum those distances the lower the sum the nearer the meaning of those words (pairwise)
  dist_sum = np.sum(distances)
  print(i," : ", dist_sum)

