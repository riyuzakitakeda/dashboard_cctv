from flask import Flask, Response
from flask_cors import CORS
import cv2, imutils
from ultralytics import YOLO, solutions
import os
import threading

app = Flask(__name__)
CORS(app)

# initialize a lock used to ensure thread-safe
# exchanges of the frames (useful for multiple browsers/tabs
# are viewing tthe stream)
lock = threading.Lock()
# model = YOLO("yolov8n.pt")

username = 'admin'
password = 'makassar12'
uri = '10.50.12.200/ISAPI/Streaming/Channels/102/httpPreview'
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport:tcp"
full_uri = f'rtsp://{username}:{password}@{uri}'
WIDTH = 700


@app.route('/stream',methods = ['GET'])
def stream():
   return Response(generate(), mimetype = "multipart/x-mixed-replace; boundary=frame")

def generate():
    # grab global references to the lock variable
    global lock
    # initialize the video stream
    vc = cv2.VideoCapture(full_uri, cv2.CAP_FFMPEG)
    assert vc.isOpened(), "Error reading video file"
    line_points = [(50, 150), (700, 150)]
    line_points_left = [(150, 250), (400, 250), (600, 400), (150, 400)]

    # Init Object Counter
    counter = solutions.RegionCounter(
        show=False,
        region=line_points_left,
        draw_tracks=False,
        line_width=1,
        model="best.pt",
        verbose=False
    )

    frame_counter = 0

    classes_to_count = [2, 3, 5, 7]
    # check camera is open
    if vc.isOpened():
        rval, frame = vc.read()
    else:
        rval = False

    # while streaming
    while rval:
        # wait until the lock is acquired
        with lock:
            # read next frame
            rval, frame = vc.read()
            # if blank frame
            if frame is None:
                continue

            # encode the frame in JPEG format
            frame = imutils.resize(frame, width=WIDTH)
            # tracks = model.track(frame, persist=True, show=False, classes=classes_to_count, verbose=False)
            frame_counter += 1

            # Skip 5 frames (process every 6th frame)
            if frame_counter % 6 != 0:
                frame = counter.count(frame)

            (flag, encodedImage) = cv2.imencode(".jpg", frame)

            # ensure the frame was successfully encoded
            if not flag:
                continue

        # yield the output frame in the byte format
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')
    # release the camera 
    vc.release()

if __name__ == '__main__':
    host = "127.0.0.1"
    port = 8000
    debug = False
    options = None
    app.run(host, port, debug, options)