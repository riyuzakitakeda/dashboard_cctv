from flask import Flask, jsonify
from flask_cors import CORS
import cv2
from ultralytics import solutions
import os
import base64

app = Flask(__name__)
CORS(app)
# 10.53.71.200
# 10.50.12.200
username = 'admin'
password = 'makassar12'
uri = '10.50.12.200/ISAPI/Streaming/Channels/102/httpPreview'
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport:tcp"
full_uri = f'rtsp://{username}:{password}@{uri}'

line_points_left = [(150, 250), (400, 250), (700, 500), (150, 500)]
line_points_right = [(300, 150), (500, 140), (700, 200), (600, 300)]
classes_to_count = [2, 3, 5, 7]
    # Init Object Counter
counterLeft = solutions.RegionCounter(
    show=False,
    region=line_points_left,
    draw_tracks=False,
    line_width=1,
    model="yolo11n.pt",
    verbose=False,
    classes=classes_to_count
)

counterRight = solutions.RegionCounter(
    show=False,
    region=line_points_right,
    draw_tracks=False,
    line_width=1,
    model="yolo11n.pt",
    verbose=False,
    classes=classes_to_count
)

print(counterLeft.names)


@app.route('/image-data', methods=['GET'])
def image_data():
    data = process_frame()
    return jsonify(data)


def process_frame():
    """Process video frame, return image in base64 and class counts."""
    vc = cv2.VideoCapture(full_uri, cv2.CAP_FFMPEG)
    # vc = cv2.VideoCapture('./video.mp4')
    assert vc.isOpened(), "Error reading video file"
    
    # Initialize frame data
    classwise_counts = {}
    base64_image = None

    if vc.isOpened():
        rval, frame = vc.read()
        if rval and frame is not None:
            # Process the frame with YOLO
            left_frame = counterLeft.count(frame)
            all_frame = counterRight.count(left_frame)
            
            count_left = counterLeft.clss
            count_right = counterRight.clss
            # print(counter.counting_regions)
            # Encode the frame to JPEG
            _, encodedImage = cv2.imencode('.jpg', all_frame)
            
            # Convert the image to Base64
            base64_image = base64.b64encode(encodedImage).decode('utf-8')

    vc.release()

    # Return both the base64-encoded image and class counts
    return {
        "image": base64_image,
        "counts_left": count_left,
        "counts_right": count_right
    }


if __name__ == '__main__':
    host = "127.0.0.1"
    port = 8000
    debug = False
    options = None
    app.run(host, port, debug, options)
