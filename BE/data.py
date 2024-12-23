from flask import Flask, jsonify
from flask_cors import CORS
import cv2
from ultralytics import solutions
import requests
from requests.auth import HTTPDigestAuth
import os
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

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
        "line_points_left": [(400, 150), (450, 165), (270, 350), (100, 350)],
        "line_points_right": [(455, 165), (500, 165), (500, 350), (300, 350)],
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

# Initialize Object Counters (shared for all cameras)
counters = {
    "left": solutions.RegionCounter(
        show=False,
        region=None,  # Region will be set dynamically
        draw_tracks=False,
        line_width=1,
        model="best.pt",
        verbose=False,
        # classes=[2, 3, 5, 7],
    ),
    "right": solutions.RegionCounter(
        show=False,
        region=None,  # Region will be set dynamically
        draw_tracks=False,
        line_width=1,
        model="best.pt",
        verbose=False,
        # classes=[2, 3, 5, 7],
    ),
}


@app.route('/image-data/<camera_id>', methods=['GET'])
def image_data(camera_id):
    # Validate camera ID
    camera_config = CAMERA_CONFIGS.get(camera_id)
    if not camera_config:
        return jsonify({"error": "Invalid camera_id"}), 400

    # Build the RTSP URI
    username = camera_config["username"]
    password = camera_config["password"]
    ip = camera_config["ip"]
    uri = f'{ip}/ISAPI/Streaming/channels/102/picture'
    # full_uri = f'rtsp://{username}:{password}@{uri}'
    # full_uri = f'http://{uri}'
    full_uri = {
        "username": username,
        "password": password,
        "uri": f'http://{uri}'
    }

    # Update counters with the specific configuration
    counters["left"].region = camera_config["line_points_left"]
    counters["right"].region = camera_config["line_points_right"]
    # counters["left"].classes = camera_config["classes_to_count"]
    # counters["right"].classes = camera_config["classes_to_count"]

    # Process the frame and return results
    data = process_frame(counters["left"], counters["right"], full_uri)
    return jsonify(data)


def process_frame(counterLeft, counterRight, full_uri):
    """Process video frame, return image in base64 and class counts."""
    # url = f"http://{cctv['ip']}/ISAPI/Streaming/channels/1/picture"
    auth = HTTPDigestAuth(username=full_uri['username'], password=full_uri['password'])
    try:
        response = requests.get(full_uri['uri'], auth=auth)
    except:
        return 0
    finally: 
        bin_data = response.content

    arr = np.asarray(bytearray(bin_data), dtype=np.uint8)

    vc = cv2.imdecode(arr, -1)
    
    # vc = cv2.VideoCapture(full_uri, cv2.CAP_FFMPEG)
    # assert vc, "Error reading video file"


    # Initialize frame data
    base64_image = None
    count_left = {}
    count_right = {}

    if vc is not None:
        frame = vc
        
        # if frame is not None:
            # Process the frame with YOLO
        left_frame = counterLeft.count(frame)
        all_frame = counterRight.count(left_frame)

        count_left = counterLeft.clss
        count_right = counterRight.clss


        # cv2.imshow('image', all_frame)
        # if cv2.waitKey() & 0xff == 27: quit()
        # Encode the frame to JPEG
        _, encodedImage = cv2.imencode('.jpg', all_frame)

        # Convert the image to Base64
        base64_image = base64.b64encode(encodedImage).decode('utf-8')

    vc = None

    # Return both the base64-encoded image and class counts
    return {
        "image": base64_image,
        "counts_left": count_left,
        "counts_right": count_right,
    }


if __name__ == '__main__':
    host = "127.0.0.1"
    port = 8000
    debug = False
    options = None
    app.run(host, port, debug, options)
