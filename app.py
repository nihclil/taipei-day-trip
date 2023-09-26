
import mysql.connector
from flask import *
from dotenv import load_dotenv
import os
import jwt
import datetime

load_dotenv()

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
secret_key = os.getenv("JWT_SECRET_KEY")

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
	
		mrts_arr = []
		for mrt in mrts_result:
			mrt = mrt['mrt']
			if mrt:
				mrts_arr.append(mrt)

		return jsonify({'data': mrts_arr})

	except Exception as e:
		print("An error occurred:", e)
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500


@app.route("/api/user", methods=["POST"])
def register():
	data = request.get_json()
	con = None

	if not data:
		return jsonify({"error": True, "message": "註冊失敗"}), 400
	try:
		name = data["name"]
		email = data["email"]
		password = data["password"]

		con, cursor = con_db()
		search_member = "SELECT email FROM member WHERE email = %s;"
		cursor.execute(search_member, (email,))
		search_email = cursor.fetchone()

		if search_email:
			return jsonify({"error": True, "message": "信箱已經被註冊"}), 400
		else:
			print(name,email,password)
			insert_member = "INSERT INTO member (username, email, password) VALUES (%s, %s, %s);"
			cursor.execute(insert_member, (name, email, password))
			con.commit()
			con.close()
			return jsonify({"ok": True}), 200

	except Exception as e:
		print("An error occurred:", e)
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

	finally:
		con.close()


@app.route("/api/user/auth", methods=["PUT"])
def login():
	data = request.get_json()
	con = None

	if not data:
		return jsonify({"error": True, "message": "登入失敗"}), 400
	try:
		email = data["email"]
		password = data["password"]
		
		con, cursor = con_db()
		match_member = "SELECT * FROM member WHERE email = %s and password = %s;"
		cursor.execute(match_member, (email, password))
		match_result = cursor.fetchone()
		
		if match_result:
			payload = {
				"id": match_result["id"],
				"email": match_result["email"],
				"exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
			}
			token = jwt.encode(payload, secret_key, algorithm="HS256")
			return jsonify({"token": token}), 200

		else:
			return jsonify({"error": True, "message": "帳號或密碼錯誤"}), 400

	except Exception as e:
		print("An error occurred:", e)
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

	finally:
		con.close()


@app.route("/api/user/auth", methods=["GET"])
def get_user():
	auth_header = request.headers.get("Authorization")
	
	if not auth_header or auth_header == "Bearer null":
		return jsonify(None)

	try:
		token = auth_header.split(" ")[1]
		payload = jwt.decode(token, secret_key, algorithms=["HS256"])
		
		payload_id = payload["id"]
		payload_email = payload["email"]

		con, cursor = con_db()
		match_member = "SELECT * FROM member WHERE id = %s and email = %s;"
		cursor.execute(match_member, (payload_id, payload_email))
		match_result = cursor.fetchone()
		if match_result:
			id = match_result["id"]
			name = match_result["username"]
			email = match_result["email"]

			return jsonify({"data":{
					"id":id,
					"name":name,
					"email":email 
				}})
		con.close()

	except Exception as e:
		print("An error occurred:", e)
		return jsonify(None)
	

@app.route("/api/booking", methods=["POST"])
def create_booking():
	auth_header = request.headers.get("Authorization")

	if not auth_header or auth_header == "Bearer null":
		return jsonify({"error": True, "message": "未登入系統，拒絕存取" }), 403

	try:
		token = auth_header.split(" ")[1]
		payload = jwt.decode(token, secret_key, algorithms=["HS256"])
		
		member_id = payload["id"]

		data = request.get_json()
		attraction_id = data.get("attractionId", None)
		date = data.get("date", None)
		time = data.get("time", None)
		price = data.get("price", None)

		if None in [attraction_id, date, time, price]:
			return jsonify({"error": True, "message": "建立失敗，輸入不正確或其他原因"}), 400

		con, cursor = con_db()
		booking_infos = "INSERT INTO booking (member_id, attraction_id, date, time, price) VALUES (%s, %s, %s, %s, %s);"
		cursor.execute(booking_infos,(member_id, attraction_id, date, time, price))
		con.commit()
		return jsonify({"ok": True}), 200
		
	except Exception as e:
		print("An error occurred:", e)
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

	finally:
		con.close()

app.run(host="0.0.0.0", port=3000, debug=True)
