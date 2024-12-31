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
        "line_points_left": [(150, 250), (400, 250), (700, 500), (150, 500)],
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
        "line_points_left": [(470, 230), (570, 270), (230, 550), (25, 300)],
        "line_points_right": [(580, 270), (700, 300), (670, 550), (270, 550)],
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
    counterLeft = RegionCounter(
        show=False,
        draw_tracks=False,
        line_width=1,
        model="yolo11n.pt",
        verbose=False,
        classes=camera_config["classes_to_count"],
        region=camera_config["line_points_left"]
    )
    counterRight = RegionCounter(
        show=False,
        draw_tracks=False,
        line_width=1,
        model="yolo11n.pt",
        verbose=False,
        classes=camera_config["classes_to_count"],
        region=camera_config["line_points_right"]
    )

    # counterRight.counting_regions
    # Process the frame and return results
    data = await process_frame(counterLeft, counterRight, full_uri)
    return jsonify(data)


async def process_frame(counterLeft, counterRight, full_uri):
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
    count_left = {}
    count_right = {}
    count_region_left = 0
    count_region_right = 0

    if frame is not None:
        # Process the frame with YOLO
        left_frame = counterLeft.count(frame)
        all_frame = counterRight.count(left_frame)

        count_left = counterLeft.clss
        count_right = counterRight.clss

        # print(f'left: {counterLeft.counting_regions[0]}')
        # print(f'right: {counterRight.counting_regions[0]}')

        count_region_left = counterLeft.counting_regions[0]['countnow']
        count_region_right = counterRight.counting_regions[0]['countnow']

        # Encode the processed frame to Base64
        _, encodedImage = cv2.imencode('.jpg', all_frame)
        base64_image = base64.b64encode(encodedImage).decode('utf-8')

    # Return both the base64-encoded image and class counts
    return {
        "image": base64_image,
        "counts_left": count_left,
        "counts_right": count_right,
        "count_region_left": count_region_left,
        "count_region_right": count_region_right
    }


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=False)
