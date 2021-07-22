from PyPDF2 import PdfFileWriter, PdfFileReader
input_pdf = PdfFileReader("./dsa1.pdf")
output = PdfFileWriter()
output.addPage(input_pdf.getPage(5))

with open("dsa1_5.pdf", "wb") as output_stream:
    output.write(output_stream)
output = PdfFileWriter()
output.addPage(input_pdf.getPage(6))
with open("dsa1_6.pdf", "wb") as output_stream:
    output.write(output_stream)
output = PdfFileWriter()
output.addPage(input_pdf.getPage(7))
with open("dsa1_7.pdf", "wb") as output_stream:
    output.write(output_stream)

