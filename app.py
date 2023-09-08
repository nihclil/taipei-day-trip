
import mysql.connector
from flask import *
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

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


# Pages
@app.route("/")
def index():
	return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")


@app.route("/booking")
def booking():
	return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


@app.route("/api/attractions")
def all_attractions():
	page = int(request.args.get('page', 0))
	keyword = str(request.args.get('keyword', ''))

	per_page_data = 12
	page_index = page * per_page_data

	next_page = None

	try:
		con, cursor = con_db()

		if keyword:
			attractions_keyword = 'SELECT * FROM attractions WHERE name LIKE %s or mrt = %s LIMIT %s OFFSET %s;'
			cursor.execute(attractions_keyword, ('%' + keyword + '%', keyword, per_page_data + 1, page_index))
			keyword_result = cursor.fetchall()
			con.commit()

			if len(keyword_result) > per_page_data:
				next_page = page + 1
				keyword_result = keyword_result[:per_page_data]

			keyword_arr = []
			for spot in keyword_result:
				keyword_dict = {
					"id": spot['id'],
					"name": spot['name'],
					"category": spot['category'],
					"description": spot['description'],
					"address": spot['address'],
					"transport": spot['transport'],
					"lat": spot['lat'],
					"lng": spot['lng'],
					"mrt": spot['mrt'],
					"images": []
				}

				file = spot['images'].split('https')
				pictures_arr = []
				for pic in file:
					pic = pic.replace('JPG', 'jpg')
					if 'jpg' in pic:
						picture = 'https' + pic
						pictures_arr.append(picture)

				keyword_dict['images'] = pictures_arr
				keyword_arr.append(keyword_dict)

			return jsonify({"nextPage": next_page, "data": keyword_arr})

		else:
			attractions_query = 'SELECT * FROM attractions LIMIT %s OFFSET %s;'
			cursor.execute(attractions_query, (per_page_data + 1, page_index))
			attractions_result = cursor.fetchall()
			con.commit()

			if len(attractions_result) > per_page_data:
				next_page = page + 1
				attractions_result = attractions_result[:per_page_data]

			attraction_arr = []
			for spot in attractions_result:
				attraction_dict = {
					"id": spot['id'],
					"name": spot['name'],
					"category": spot['category'],
					"description": spot['description'],
					"address": spot['address'],
					"transport": spot['transport'],
					"lat": spot['lat'],
					"lng": spot['lng'],
					"mrt": spot['mrt'],
					"images": []
				}

				file = spot['images'].split('https')
				pictures_arr = []
				for pic in file:
					pic = pic.replace('JPG', 'jpg')
					if 'jpg' in pic:
						picture = 'https' + pic
						pictures_arr.append(picture)

				attraction_dict['images'] = pictures_arr
				attraction_arr.append(attraction_dict)

			if len(attractions_result) == per_page_data:
				return jsonify({"nextPage": next_page, "data": attraction_arr})
			else:
				return jsonify({"nextPage": None, "data": attraction_arr})

	except Exception as e:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500


@app.route("/api/attraction/<spot_id>")
def tourist_spot(spot_id):
	try:
		con, cursor = con_db()
		attractions_query = 'SELECT * FROM attractions WHERE id = %s'
		cursor.execute(attractions_query, (spot_id,))
		attractions_result = cursor.fetchall()
		con.commit()

		if not attractions_result:
			return jsonify({'error': True, 'message': '景點編號不正確'}), 400

		for spot in attractions_result:
			attraction_dict = {
				"id": spot['id'],
				"name": spot['name'],
				"category": spot['category'],
				"description": spot['description'],
				"address": spot['address'],
				"transport": spot['transport'],
				"lat": spot['lat'],
				"lng": spot['lng'],
				"mrt": spot['mrt'],
				"images": []
			}

			file = spot['images'].split('https')
			pictures_arr = []
			for pic in file:
				pic = pic.replace('JPG', 'jpg')
				if 'jpg' in pic:
					picture = 'https' + pic
					pictures_arr.append(picture)

			attraction_dict['images'] = pictures_arr
			return jsonify({'data': attraction_dict})

	except Exception as e:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

	con.close()


@app.route("/api/mrts")
def mrts():
	try:
		con, cursor = con_db()
		mrts_query = 'SELECT mrt, COUNT(*) as total FROM attractions group by mrt order by total desc;'
		cursor.execute(mrts_query)
		mrts_result = cursor.fetchall()
		con.commit()
		print(mrts_result)
		mrts_arr = []
		for mrt in mrts_result:
			mrt = mrt['mrt']
			if mrt:
				mrts_arr.append(mrt)

		return jsonify({'data': mrts_arr})

	except Exception as e:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500


app.run(host="0.0.0.0", port=3000, debug=True)
