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
    "pettarani": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.50.12.200",
        "line_points_left": [(150, 175), (300, 175), (700, 500), (150, 500)],
        "line_points_right": [(300, 150), (500, 140), (700, 200), (600, 300)],
        "classes_to_count": [2, 3, 5, 7], 
    },
    "barombong": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.53.39.200",
        "line_points_left": [(770, 350), (870, 365), (570, 700), (200, 700)],
        "line_points_right": [(875, 365), (970, 365), (970, 700), (575, 700)],
        "classes_to_count": [2, 3, 5, 7],
    },
    "alauddin": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.50.77.200",
        "line_points_left": [(550, 220), (620, 250), (230, 550), (25, 300)],
        "line_points_right": [(600, 270), (700, 300), (670, 550), (250, 550)],
        "classes_to_count": [2, 3, 5, 7],
    },
    "mtos": {
        "username": "admin",
        "password": "makassar123",
        "ip": "10.53.32.200",
        "line_points_left": [(470, 230), (570, 270), (230, 550), (25, 300)],
        "line_points_right": [(580, 270), (700, 300), (670, 550), (270, 550)],
        "classes_to_count": [2, 3, 5, 7],
    },
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
        model="yolo11n.pt",
        verbose=False,
        classes=camera_config["classes_to_count"],
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
