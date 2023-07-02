from lxml import etree
import remove as r

directory = './MapaRuas/'

def convert(string_rua):

    toJSON = {}
    with open(directory+string_rua, 'r') as xml_document:
        xml_doc = etree.parse(xml_document)

    root = xml_doc.getroot()
    
    meta = root.find('meta')
    corpo = root.find('corpo')
    
    toJSON['_id'] = int(meta.find('número').text)
    toJSON['nome'] = meta.find('nome').text
    
    toJSON['para'] = []
    for para in corpo.findall('para'):
        texto = etree.tostring(para, encoding='unicode', method='text')
        texto = ' '.join(texto.split())
        toJSON['para'].append(texto)
        
    toJSON['figuras'] = []
    for figura in corpo.findall('figura'):
        figuraObject = {}
        figuraObject['id'] = figura.get('id')
        figuraObject['imagem'] = figura.find('imagem').get('path')
        figuraObject['legenda'] = figura.find('legenda').text
        toJSON['figuras'].append(figuraObject)
    
    toJSON['lista_casas'] = []
    lista_casas = corpo.find('lista-casas')
    if lista_casas is not None:
        for casa in lista_casas:
            casaObject = {}
            if (casa.find('número') is not None) and casa.find('número').text:
                casaObject['número'] = casa.find('número').text
            if (casa.find('vista') is not None) and casa.find('vista').text:
                vista = str(casa.find('vista').text)
                casaObject['vista'] = r.remove(vista).strip()
            if (casa.find('enfiteuta') is not None) and casa.find('enfiteuta').text:
                enfiteuta = str(casa.find('enfiteuta').text)
                casaObject['enfiteuta'] = r.remove(enfiteuta).strip()
            if (casa.find('foro') is not None) and casa.find('foro').text:
                foro = str(casa.find('foro').text)
                casaObject['foro'] = r.remove(foro).strip()
            if (casa.find('desc') is not None) and casa.find('desc').text:
                texto = etree.tostring(casa.find('desc'), encoding='unicode', method='text')
                texto = ' '.join(texto.split())
                casaObject['desc'] = r.remove(texto).strip()
            toJSON['lista_casas'].append(casaObject)    

    return toJSON
