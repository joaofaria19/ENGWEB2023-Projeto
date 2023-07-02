from lxml import etree
import json
import remove as r

directory = './MapaRuas/'

def getDatas(stringXML):
    listaDatas = []
    with open(directory+stringXML, 'r') as xml_document:
        xml_doc = etree.parse(xml_document)

    root  = xml_doc.getroot()

    for data in root.findall('data'):
        objectDatas = {}
        nome = str(data.find('nome').text)
        rua = str(data.find('rua').text)
        posicao = str(data.find('posição').text)
        objectDatas['_id'] = r.remove(posicao).strip()    
        objectDatas['data'] = r.remove(nome).strip()
        objectDatas['rua'] = rua
        listaDatas.append(objectDatas)
    return listaDatas

def getEntidades(stringXML):
    listaEntidades = []
    with open(directory+stringXML, 'r') as xml_document:
        xml_doc = etree.parse(xml_document)

    root  = xml_doc.getroot()

    for entidade in root.findall('entidade'):
        objectEntidades = {}
        tipo = str(entidade.find('tipo').text)
        nome = str(entidade.find('nome').text)
        rua = str(entidade.find('rua').text)
        posicao = str(entidade.find('posição').text)
        objectEntidades['_id'] = r.remove(posicao).strip()
        objectEntidades['tipo'] = r.remove(tipo).strip()
        objectEntidades['entidade'] = r.remove(nome).strip()
        objectEntidades['rua'] = rua
        listaEntidades.append(objectEntidades)
    return listaEntidades

def getLugares(stringXML):
    listaLugares = []
    with open(directory+stringXML, 'r') as xml_document:
        xml_doc = etree.parse(xml_document)
    
    root  = xml_doc.getroot()

    for lugar in root.findall('lugar'):
        objectLugares = {}
        nome = str(lugar.find('nome').text)
        rua = str(lugar.find('rua').text)
        posicao = str(lugar.find('posição').text)
        objectLugares['_id'] = r.remove(posicao).strip()
        objectLugares['lugar'] = r.remove(nome).strip()
        objectLugares['rua'] = rua
        listaLugares.append(objectLugares)
    return listaLugares


def insertData(ruaNumber):
    datas = getDatas("datas.xml")
    entidades = getEntidades("entidades.xml")
    lugares = getLugares("lugares.xml")
    listaData = []
    listaEntidade = []
    listaLugar = []

    for data in datas:
        if int(data['rua']) == ruaNumber:
            listaData.append(data)

    for entidade in entidades:
        if int(entidade['rua']) == ruaNumber:
            listaEntidade.append(entidade)
    
    for lugar in lugares:
        if int(lugar['rua']) == ruaNumber:
            listaLugar.append(lugar)

    return (listaData, listaEntidade, listaLugar)

def insertJSON():
    
    with open('./ruas.json', 'r') as file:
        jsonFile = json.load(file) 
    for rua in jsonFile:
        tuploListas = insertData(rua['_id'])
        rua['datas'] = tuploListas[0]
        rua['entidades'] = tuploListas[1]
        rua['lugares'] = tuploListas[2]

    with open('ruas2.json', 'w') as fw:
        json.dump(jsonFile, fw, indent=4, ensure_ascii=False)

insertJSON()