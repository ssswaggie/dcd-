#导入requests库
import csv
from lxml import etree
import requests

with open("car_sales.csv", 'a+') as file:
    write=csv.writer(file)
    write.writerow(['ranks','brandnames','names','counts','min_prices','max_prices','carModel','etype','marktime','insure'])
def func(num):
    #目标网址
    url = 'https://www.dongchedi.com/motor/pc/car/rank_data?aid=1839&app_name=auto_web_pc&city_name=%E6%9D%AD%E5%B7%9E&count=10&offset='+str(num*10)+'&month=1000&new_energy_type=&rank_data_type=11&brand_id=&price=&manufacturer=&series_type=&nation=0'
    sjj_cars=requests.get(url).json()['data']['list']
    #print(sjj_cars)
    for i in sjj_cars:
        #print(i)
        # 排名
        ranks = i['rank']
        #厂商
        brandnames=i['sub_brand_name']
        #车名
        names=i['series_name']
        #销量
        counts=i['count']
        #最低价格
        min_prices=i['min_price']
        #最高价格
        max_prices=i['max_price']
        #id
        ids=i['series_id']
        print(ids,ranks,brandnames,names,counts,min_prices,max_prices)
        #获取相关网页上的车型与能源类型
        infoHTML= requests.get('https://www.dongchedi.com/auto/params-carIds-x-%s'%ids)
        infoHTMLpath=etree.HTML(infoHTML.text)
        #车型
        carModel=infoHTMLpath.xpath("//div[@data-row-anchor='jb']/div[2]/div/text()")[0]
        print(carModel)
        #能源类型
        etype=infoHTMLpath.xpath("//div[@data-row-anchor='fuel_form']/div[2]/div/text()")[0]
        print(etype)
        #上市时间
        marktime=infoHTMLpath.xpath("//div[@data-row-anchor='market_time']/div[2]/div/text()")[0]
        print(marktime)
        #保修期限
        insure=infoHTMLpath.xpath("//div[@data-row-anchor='period']/div[2]/div/text()")[0]
        print(insure)
        with open("car_sales.csv",'a+') as file:
            file.write('{}, {}, {}, {}, {}, {}, {}, {}, {}, {}\n'.format(ranks,brandnames,names,counts,min_prices,max_prices,carModel,etype,marktime,insure))
            print(names+"下载成功！！")
for i in range(0,10):
    print(i)
    func(i)