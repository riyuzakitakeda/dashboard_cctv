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

CAMERA_CONFIGS = {
    "pettarani": {
        "username": "admin",
        "password": "makassar12",
        "ip": "10.50.12.200",
        "line_points_left": [(150, 175), (300, 175), (700, 500), (150, 500)],
        "line_points_right": [(300, 150), (500, 140), (700, 200), (600, 300)],
        # "classes_to_count": [2, 3, 5, 7], 
    }
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
    counter = RegionCounter(
        show=False,
        draw_tracks=True,
        line_width=1,
        model="best.pt",
        verbose=False,
        region=camera_config["line_points_right"]
    )

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

    if frame is not None:
        # Process the frame with YOLO
        all_frame = counter.count(frame)

        
        # Encode the processed frame to Base64
        # _, encodedImage = cv2.imencode('.jpg', all_frame)
        cv2.imwrite('./result.jpg', all_frame)
    
    return 0


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=False)