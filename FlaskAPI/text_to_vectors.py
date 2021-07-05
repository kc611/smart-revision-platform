# importing required modules 
import string
import re

from pdfminer.high_level import extract_text
import numpy as np


def to_sentence(text):
    text = text.replace("\n", " ")
    text = text.replace(string.punctuation, " ")
    text = text.split(".")
    return text
  

useful_pages = [6, 118]
useful_pages = np.arange(useful_pages[0]-1,useful_pages[1]-1).tolist()
text = extract_text('dsa1.pdf', page_numbers=useful_pages)

text = text.lower()


text = to_sentence(text)

lent = []
from transformers import RobertaTokenizerFast
tokenizer = RobertaTokenizerFast.from_pretrained("roberta-base")

for _text in text:    
    tokens = tokenizer(_text)['input_ids']
    if len(tokens) > 100:
        pass
    elif len(tokens) > 10:
        lent.append(len(tokens))
    
    

print(lent)
# text_file = open("dsa1.txt", "w")
# text_file.write(str(text))
# text_file.close()
