from lxml import etree
import json
import xmlTojson

directory = './MapaRuas/'
# carregar o arquivo XSD
with open(directory+'MRB-rua.xsd', 'r') as xsd_file:
    xsd = etree.parse(xsd_file)

# criar um validador XSD
schema = etree.XMLSchema(xsd)


# carregar o documento XML
with open(directory+'indiceruas.xml', 'r') as xml_file:
    xml = etree.parse(xml_file)

root = xml.getroot()
documents=[]
for rua in root.iter('rua'):
    documents.append(rua.get('doc'))

#print(documents)
i=0

listaJSON = []
for doc in documents:
    # validar o documento XML
    i+=1
    with open(directory+doc, 'r') as xml_document:
        xml_doc = etree.parse(xml_document)
    
    try:
        schema.assertValid(xml_doc)
        print("O documento "+str(i)+" XML é válido de acordo com o XSD.")
    except etree.DocumentInvalid as e:
        print("O documento "+str(i)+" XML é inválido de acordo com o XSD.")
        print(e)

    ruaObject = {}
    ruaObject = xmlTojson.convert(doc)
    listaJSON.append(ruaObject)

with open("ruas.json", "w", encoding="utf-8") as json_file:
            json.dump(listaJSON,json_file, indent=4, ensure_ascii=False)


