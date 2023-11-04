from selenium import webdriver
from selenium.webdriver.common.by import By

def url_gen(search_term):
    url = 'https://www.amazon.in/s?k='
    for i in search_term.split(' '):
        url += i + '+'
    url = url[:-1]
    return url

options = webdriver.FirefoxOptions()
options.add_argument("-headless")
driver = webdriver.Firefox(options=options)


search_term = 'antique vase'
input_url = url_gen(search_term)
driver.get(input_url)
price_string = driver.find_elements(By.CLASS_NAME, 'a-price') 
l = []
for i in price_string:
    l.append(i.text)
a = 'abc'
f = open('data.txt', 'w')
for i in range(len(l)):
    l[i] = l[i][1:]
    s = ''
    for j in l[i]:
        if j!=',':
            s += j
    try:
        l[i] = int(s)
    except Exception as e:
        pass
    f.write(f'{l[i]}\n')
