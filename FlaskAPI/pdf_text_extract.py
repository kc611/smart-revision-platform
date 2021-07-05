# importing required modules 
from pdfminer.high_level import extract_text
import numpy as np

useful_pages = [6, 118]
useful_pages = np.arange(useful_pages[0]-1,useful_pages[1]-1).tolist()
text = extract_text('dsa1.pdf', page_numbers=useful_pages)
text_file = open("dsa1.txt", "w")
text_file.write(text)
text_file.close()