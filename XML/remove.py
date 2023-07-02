import re

def remove(str):
    return re.sub(r'\s{2,}', ' ',str)