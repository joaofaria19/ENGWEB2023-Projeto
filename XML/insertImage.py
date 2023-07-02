import re
import os
import json

directory = "../Interface/public/images/atual/"
images = os.listdir(directory)

expId = re.compile('\d+(?=-)')
expType = re.compile('(\d+-)([A-Z](\w+|\.)+)-(Vista\d)(?=.)')
expName = re.compile('(?<=-)([A-Z](\w+|\.)+)-(Vista\d)(?=.)')

with open('ruas.json', 'r') as fr:
    data = json.load(fr)

def addImage(idImg,image):
    for idObj in data:
        if int(idImg) == int(idObj["_id"]):
            idObj["figuras"].insert(0,image)
            print(idObj["figuras"])

    with open('ruas.json', 'w') as fw:
        json.dump(data, fw, indent=2, ensure_ascii=False)

def makeObj():
    for imageName in images:
        number = expId.match(imageName).group(0)
        idImg = expType.search(imageName).group(0)
        name = expName.search(imageName).group(0)
        imageObj = {}
        imageObj["id"] = idImg
        imageObj["imagem"] = "../atual/"+imageName
        imageObj["legenda"] = name
        addImage(number, imageObj)
    
makeObj()