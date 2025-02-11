from flask import Flask, jsonify
from flask_cors import CORS
import cv2
# from ultralytics import solutions
from region_custom import RegionCounter
import requests
from requests.auth import HTTPDigestAuth
import base64
import numpy as np
import asyncio

app = Flask(__name__)
CORS(app)

# Global configuration for cameras
# Global configuration for cameras
CAMERA_CONFIGS = {
    "simpang_5_bandara": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.50.17.200",
        "line_points_left": [(199, 226), (300, 242), (93, 534), (6, 441)],
        "line_points_right": [(192, 84), (315, 124), (695, 322), (700, 375)],
        "classes_to_count": [1,2,3,4]
    },
    "taman_macan": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.50.83.200",
        "line_points_left": [],
        "line_points_right": [(438, 230), (294, 232), (455, 498), (695, 432)],
        "classes_to_count": [1,2,3,4]
    },
    "pasar_butung": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.19.200",
        "line_points_left": [],
        "line_points_right": [(868, 363), (994, 350), (1651, 913), (1023, 1005)],
        "classes_to_count": [1,2,3,4]
    },
    "abdesir_batua_raya": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.26.200",
        "line_points_left": [(594, 677), (75, 462), (595, 89), (722, 141)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "waduk_borong": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.37.200",
        "line_points_left": [(150, 300), (450, 210), (950, 650), (400, 700)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "flyover_atas": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.99.200",
        "line_points_left": [(703, 129), (852, 104), (850, 897), (328, 897)],
        "line_points_right": [(901, 96), (1027, 83), (1624, 868), (1039, 920)],
        "classes_to_count": [1,2,3,4]
    },
    "haji_bau_monginsidi": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.50.93.200",
        "line_points_left": [(63, 41), (250, 26), (450, 400), (100, 500)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "pettarani_andi_djemma": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.50.12.200",
        "line_points_left": [(150, 175), (300, 175), (700, 500), (150, 500)],
        "line_points_right": [(300, 150), (500, 140), (700, 200), (600, 300)],
        "classes_to_count": [1,2,3,4]
    },
    "perintis_unhas_pintu_2": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.106.200",
        "line_points_left": [(446, 226), (865, 226), (750, 1000), (15, 662)],
        "line_points_right": [(1086, 142), (1626, 110), (1950, 400), (1300, 950)],
        "classes_to_count": [1,2,3,4]
    },
    "andi_tonro_kumala": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.17.200",
        "line_points_left": [(380, 1100), (87, 575), (904, 23), (1555, 82)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "batas_makassar_gowa": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.35.200",
        "line_points_left": [(566, 150), (665, 141), (670, 590), (117, 578)],
        "line_points_right": [(670, 140), (770, 140), (1200, 633), (740, 606)],
        "classes_to_count": [1,2,3,4]
    },
    "gunung_nona_1": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.33.200",
        "line_points_left": [(533, 282), (578, 290), (566, 685), (200, 674)],
        "line_points_right": [(595, 287), (637, 282), (1044, 673), (643, 700)],
        "classes_to_count": [1,2,3,4]
    },
    "nipa_nipa_1": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.30.200",
        "line_points_left": [(588, 95), (631, 97), (570, 701), (251, 701)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "mtos_1_barat": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.71.200",
        "line_points_left": [(561, 143), (657, 150), (625, 663), (41, 690)],
        "line_points_right": [(674, 145), (748, 143), (1188, 567), (708, 628)],
        "classes_to_count": [1,2,3,4]
    },
    "gunung_nona_2": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.56.200",
        "line_points_left": [(767, 269), (887, 278), (815, 1048), (136, 1034)],
        "line_points_right": [(928, 278), (1014, 271), (1673, 1046), (1005, 1053)],
        "classes_to_count": [1,2,3,4]
    },
    "nipa_nipa_2": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.40.200",
        "line_points_left": [(375, 155), (440, 145), (932, 676), (409, 692)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "masjid_chengho_1": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.91.200",
        "line_points_left": [(73, 192), (169, 160), (1007, 653), (414, 704)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "masjid_chengho_2": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.92.200",
        "line_points_left": [(616, 52), (1052, 69), (650, 714), (133, 705)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "perintis_unhas_pintu_1": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.74.200",
        "line_points_left": [(916, 222), (1047, 262), (856, 704), (137, 704)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "antang_raya_baruga": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.4.200",
        "line_points_left": [(141, 152), (226, 91), (1161, 296), (787, 704)],
        "line_points_right": [(886, 12), (1093, 26), (524, 712), (73, 660)],
        "classes_to_count": [1,2,3,4]
    },
    "batua_raya_depan_yamaha": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.107.200",
        "line_points_left": [],
        "line_points_right": [(776, 101), (918, 110), (1908, 923), (814, 1059)],
        "classes_to_count": [1,2,3,4]
    },
    "pongtiku_urip_sumoharjo": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.51.15.200",
        "line_points_left": [(2, 778), (160, 570), (1885, 718), (1888, 1053), (108,1101)],
        "line_points_right": [(1067, 79), (1169, 105), (1425, 1075), (441, 1067)],
        "classes_to_count": [1,2,3,4]
    },
    "jembatan_barombong": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.39.200",
        "line_points_left": [(944,207), (1032, 232), (892, 714), (246, 709)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "losari_02_c": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.95.5",
        "line_points_left": [(622,52), (998, 140), (1576, 1063),(91,1052), (9, 358)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "ahmad_yani": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.81.200",
        "line_points_left": [(1284,32), (1840, 147), (1300, 1066), (91, 1029), (32, 597)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "losari_pintu_masuk_utama": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.201.100",
        "line_points_left": [(497, 302), (1849, 469), (1571, 1024), (423, 375)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    },
    "depan_sentra_wijaya": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.214.200",
        "line_points_left": [(22,486), (990, 19), (1069, 41), (71, 669)],
        "line_points_right": [(49,1048), (1100, 94), (1325, 85), (1128, 1073)],
        "classes_to_count": [1,2,3,4]
    },
    "pizza_kfc_mtos": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.210.200",
        "line_points_left": [(14,689), (1892, 471), (1910, 771), (1223, 1060), (37,1065)],
        "line_points_right": [],
        "classes_to_count": [1,2,3,4]
    }
}

botToken = '6549521642:AAERiGSS09dHrvZlomlvvDTlaSLasiILJyQ'
chatId = -1002020021576

@app.route('/image-data/<camera_id>', methods=['GET'])
async def image_data(camera_id):
    # Validate camera ID
    camera_config = CAMERA_CONFIGS.get(camera_id)
    if not camera_config:
        return jsonify({"error": "Invalid camera_id"}), 400

    # Build the RTSP URI
    username = camera_config["username"]
    password = camera_config["password"]
    ip = camera_config["ip"]
    uri = f"http://{ip}/ISAPI/Streaming/channels/102/picture"

    full_uri = {
        "username": username,
        "password": password,
        "uri": uri,
    }

    # Initialize counters
    counter = RegionCounter(
        show=False,
        draw_tracks=True,
        line_width=1,
        model="best.pt",
        verbose=False,
        # classes=camera_config["classes_to_count"],
        region=camera_config["line_points_left"]
    )

    counter.add_region(
        name='regionRIght',
        polygon_points=camera_config['line_points_right'],
        region_color=(0, 255, 255),
        text_color=(0, 0, 0)
    )
    # counterRight = RegionCounter(
    #     show=False,
    #     draw_tracks=False,
    #     line_width=1,
    #     model="yolo11n.pt",
    #     verbose=False,
    #     classes=camera_config["classes_to_count"],
    #     region=camera_config["line_points_right"]
    # )

    # counterRight.counting_regions
    # Process the frame and return results
    data = await process_frame(counter, full_uri)
    return jsonify(data)


async def process_frame(counter, full_uri):
    """Process video frame, return image in base64 and class counts."""
    auth = HTTPDigestAuth(full_uri['username'], full_uri['password'])
    try:
        response = requests.get(full_uri['uri'], auth=auth, timeout=5)
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}, 500

    # Decode the response content to an image
    bin_data = response.content
    arr = np.asarray(bytearray(bin_data), dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    # Initialize frame data
    base64_image = None
    count_region_left = 0
    count_region_right = 0
    status_kiri = "lancar"
    status_kanan = "lancar"

    if frame is not None:
        # Process the frame with YOLO
        all_frame = counter.count(frame)
        # all_frame = counterRight.count(left_frame)

        count_kendaraan = counter.clss
        # count_right = counterRight.clss

        # print(f'left: {counterLeft.counting_regions[0]}')
        # print(f'right: {counter.counting_regions}')

        count_region_right = counter.counting_regions[0]['countnow']
        count_region_left = counter.counting_regions[1]['countnow']
        
        # Encode the processed frame to Base64
        _, encodedImage = cv2.imencode('.jpg', all_frame)
        base64_image = base64.b64encode(encodedImage).decode('utf-8')
        photo_binary = base64.b64decode(base64_image)

        if int(count_region_left) <= 8 :
            status_kiri = "lancar"
        elif int(count_region_left) > 8 and int(count_region_left) <=12:
            status_kiri = "padat"
        elif int(count_region_left) > 12:
            status_kiri = "macet"
        
        if int(count_region_right) <= 8 :
            status_kanan = "lancar"
        elif int(count_region_right) > 8 and int(count_region_right) <=12:
            status_kanan = "padat"
        elif int(count_region_right) > 12:
            status_kanan = "macet"

        # if(int(count_region_left) > 0 or int(count_region_right) > 0):
        photo_file = "photo.jpg"
        with open(photo_file, "wb") as file:
            file.write(photo_binary)
        
        url = f"https://api.telegram.org/bot{botToken}/sendPhoto"
        files = {"photo": open(photo_file, "rb")}
        data = {
                "chat_id": chatId,
                "caption": f"https://cctv.makassar.go.id\n\nJalur Kiri: {status_kiri}\nJalur Kanan: {status_kanan}"
                }
        response = requests.post(url, data=data, files=files)

    # Return both the base64-encoded image and class counts
    return {
        "image": base64_image,
        "counts_left": count_kendaraan,
        "counts_right": [],
        "count_region_left": count_region_left,
        "count_region_right": count_region_right
    }


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=False)
