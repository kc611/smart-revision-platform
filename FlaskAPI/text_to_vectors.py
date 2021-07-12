# importing required modules 
import string
import re

from pdfminer.high_level import extract_text
import numpy as np


def to_sentence(text):
    # Split page into paragraphs
    paras = text.split("\n\n")
    res = []
    for _para in paras:
        # For each paragraph
        sentences = _para.split(".")


        _text = _text.replace("\n", " ")
        _text = _text.replace(string.punctuation, " ")
        res.append(_text)
    # text = text.split(".")
    return res
  


useful_pages = [6, 6]
for i in range(useful_pages[0]-1, useful_pages[1]):
    text = extract_text('/home/kc611/Desktop/Btech Minor Project/smart-revision-platform/FlaskAPI/dsa1.pdf', page_numbers=[i])
    text = text.lower()
    text = to_sentence(text)
    print(text)
    text_file = open("/home/kc611/Desktop/Btech Minor Project/smart-revision-platform/FlaskAPI/dsa1.txt", "w")
    text_file.write(str(text))
    text_file.close()


    
from scipy import spatial
import gensim.downloader as api
import numpy as np

model = api.load("glove-wiki-gigaword-50") #choose from multiple models https://github.com/RaRe-Technologies/gensim-data

s0 = 'Mark zuckerberg owns the facebook company'
s1 = 'Facebook company ceo is mark zuckerberg'
s2 = 'Microsoft is owned by Bill gates'
s3 = 'How to learn japanese'

def preprocess(s):
    return [i.lower() for i in s.split()]

def get_vector(s):
    return np.sum(np.array([model[i] for i in preprocess(s)]), axis=0)

print(np.array([model[i] for i in preprocess(s0)]))
# print('s0 vs s1 ->',1 - spatial.distance.cosine(get_vector(s0), get_vector(s1)))
# print('s0 vs s2 ->', 1 - spatial.distance.cosine(get_vector(s0), get_vector(s2)))
# print('s0 vs s3 ->', 1 - spatial.distance.cosine(get_vector(s0), get_vector(s3)))
# from keras.preprocessing.text import Tokenizer
# from keras.preprocessing.sequence import pad_sequences

# tokenizer=Tokenizer()
# tokenizer.fit_on_texts(documents_df.documents_cleaned)
# tokenized_documents=tokenizer.texts_to_sequences(documents_df.documents_cleaned)
# tokenized_paded_documents=pad_sequences(tokenized_documents,maxlen=64,padding='post')
# vocab_size=len(tokenizer.word_index)+1

# # reading Glove word embeddings into a dictionary with "word" as key and values as word vectors
# embeddings_index = dict()

# with open('glove.6B.100d.txt') as file:
#     for line in file:
#         values = line.split()
#         word = values[0]
#         coefs = np.asarray(values[1:], dtype='float32')
#         embeddings_index[word] = coefs
    
# # creating embedding matrix, every row is a vector representation from the vocabulary indexed by the tokenizer index. 
# embedding_matrix=np.zeros((vocab_size,100))

# for word,i in tokenizer.word_index.items():
#     embedding_vector = embeddings_index.get(word)
#     if embedding_vector is not None:
#         embedding_matrix[i] = embedding_vector
        
# # calculating average of word vectors of a document weighted by tf-idf
# document_embeddings=np.zeros((len(tokenized_paded_documents),100))
# words=tfidfvectoriser.get_feature_names()

# # instead of creating document-word embeddings, directly creating document embeddings
# for i in range(documents_df.shape[0]):
#     for j in range(len(words)):
#         document_embeddings[i]+=embedding_matrix[tokenizer.word_index[words[j]]]*tfidf_vectors[i][j]
        

pairwise_similarities=cosine_similarity(document_embeddings)
pairwise_differences=euclidean_distances(document_embeddings)

