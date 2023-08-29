import mysql.connector
import json


def con_db():
    con = mysql.connector.connect(
        user='root',
        password='123456789',
        host='localhost',
        database='tourist_spots'
    )
    cursor = con.cursor(dictionary=True)
    cursor.execute('USE tourist_spots;')
    return con, cursor


def clear_table():
    con, cursor = con_db()

    cursor.execute('DELETE FROM transportation;')
    print("transportation table cleared")

    cursor.execute('DELETE FROM information;')
    print("information table cleared")

    cursor.execute('DELETE FROM introduction;')
    print("introduction table cleared")

    cursor.execute('DELETE FROM attractions;')
    print("attractions table cleared")

    cursor.execute('DELETE FROM pictures;')
    print("pictures table cleared")

    con.commit()
    print("All tables cleared")


with open("taipei-attractions.json", mode="r", encoding="utf-8") as attractions_file:
    data = json.load(attractions_file)
    attractions = data['result']['results']
    # 避免資料重複
    clear_table()

    for spot in attractions:
        spot_id = spot['_id']
        longitude = spot['longitude']
        latitude = spot['latitude']
        address = spot['address']

        mrt = spot['MRT']
        direction = spot['direction']

        description = spot['description']
        rate = spot['rate']

        serial_no = spot['SERIAL_NO']
        date = spot['date']
        idpt = spot['idpt']
        ref_wp = spot['REF_WP']
        langinfo = spot['langinfo']
        memo_time = spot['MEMO_TIME']
        poi = spot['POI']
        av_begin = spot['avBegin']
        av_end = spot['avEnd']

        name = spot['name']
        cat = spot['CAT']
        file = spot['file'].split('https')
        row_number = spot['RowNumber']
        con, cursor = con_db()

        for pic in file:
            pic = pic.replace('JPG', 'jpg')
            if 'jpg' in pic:
                picture = 'https' + pic
                con, cursor = con_db()
                cursor.execute('INSERT INTO pictures (attractions_id, RowNumber, file, name, CAT) VALUES '
                               '(%s, %s, %s, %s, %s);', (spot_id, row_number, picture, name, cat))
                con.commit()

        cursor.execute('INSERT INTO attractions (attractions_id, address, longitude, latitude) VALUES '
                       '(%s, %s, %s, %s);', (spot_id, address, longitude, latitude))
        con.commit()

        cursor.execute('INSERT INTO transportation (attractions_id, MRT, direction) VALUES '
                       '(%s, %s, %s);', (spot_id, mrt, direction))
        con.commit()

        cursor.execute('INSERT INTO introduction (attractions_id, description, rate) VALUES '
                       '(%s, %s, %s);', (spot_id, description, rate))
        con.commit()

        cursor.execute('INSERT INTO information (attractions_id, SERIAL_NO, date, idpt, '
                       'REF_WP, langinfo, MEMO_TIME, POI, avBegin, avEnd) VALUES '
                       '(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);', (spot_id, serial_no, date, idpt, ref_wp, langinfo,
                                                                     memo_time, poi, av_begin, av_end))
        con.commit()
        con.close()

        # print(id, name, longitude, description, address, rate, MRT, CAT, file, direction)
