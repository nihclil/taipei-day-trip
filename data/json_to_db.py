import mysql.connector
import json
from dotenv import load_dotenv
import os

load_dotenv()

db_user = os.getenv("DB_USERNAME")
db_pass = os.getenv("DB_PASSWORD")

def con_db():
    con = mysql.connector.connect(
        user=db_user,
        password=db_pass,
        host='localhost',
        database='tourist_spots'
    )
    cursor = con.cursor(dictionary=True)
    cursor.execute('USE tourist_spots;')
    return con, cursor

with open("taipei-attractions.json", mode="r", encoding="utf-8") as attractions_file:

    data = json.load(attractions_file)
    attractions = data['result']['results']
    con, cursor = con_db()

    for spot in attractions:

        spot_id = spot['_id']
        longitude = spot['longitude']
        latitude = spot['latitude']
        address = spot['address']
        mrt = spot['MRT']
        direction = spot['direction']
        description = spot['description']
        name = spot['name']
        cat = spot['CAT']
        url = spot['file']
        file = spot['file'].split('https')

        for pic in file:
            pic = pic.replace('JPG', 'jpg')
            if 'jpg' in pic:
                picture = 'https' + pic
                cursor.execute('INSERT INTO pictures (attractions_id, name, file) VALUES (%s, %s, %s);', (spot_id, name, picture))
                con.commit()

        cursor.execute(
            'INSERT INTO attractions (id, name, category, description, address, transport, lng, lat, mrt, images) VALUES '
            '(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);',
            (spot_id, name, cat, description, address, direction, longitude, latitude, mrt, url))
        con.commit()

        cursor.execute('INSERT INTO transportation (attractions_id, name,MRT) VALUES (%s, %s, %s);',
                       (spot_id, name, mrt))
        con.commit()

    con.close()
