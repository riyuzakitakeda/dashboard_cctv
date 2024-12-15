import asyncio
import json
import os
from tabnanny import verbose
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer, MediaRelay
from aiortc.rtcrtpsender import RTCRtpSender
from aiortc import MediaStreamTrack
import av
import aiohttp_cors
import datetime
import gc

from sympy import im
from ultralytics import YOLO, solutions
import cv2
import numpy as np
# from dotenv import load_dotenv

# Load environment variables
ROOT = os.path.dirname(__file__)
# load_dotenv()

# Load RTSP credentials and URI
username = 'admin'
password = 'makassar12'
uri = '10.50.12.200/ISAPI/Streaming/Channels/102/httpPreview'
full_uri = f'rtsp://{username}:{password}@{uri}'  # Ensure you're using rtsp:// for RTSP streams

# Create a MediaPlayer with TCP transport and network caching options
player = MediaPlayer(full_uri, options={
    'video_size': '704x576',
    'rtsp_transport': 'tcp',           # Force TCP transport
    'fflags': 'nobuffer',              # Disable buffer optimizations
    'max_delay': '5000000',            # Maximum delay (in microseconds) -> 5 seconds
    'rtbufsize': '10000000',            # Buffer size (in bytes)
    'vcodec': 'h264'
})
# player = MediaPlayer('./video.mp4', options={
#     'video_size': '704x576',
#     'rtsp_transport': 'tcp' 
# })
relay = MediaRelay()

# Load YOLOv8 model
model = YOLO("best.pt")  # You can choose other YOLOv8 models as needed
# model = YOLO("yolo11n.pt")

# Setup ObjectCounter with points for the counting line
line_points_left = [(150, 250), (400, 250), (600, 400), (150, 400)]
line_points_right = [(300, 150), (500, 140), (700, 200), (600, 300)]

classes_to_count = [1, 2, 5, 7]

try:
    counterleft = solutions.RegionCounter(
        show=False,
        region=line_points_left,
        # names=model.names,
        # classes=classes_to_count,
        draw_tracks=False,
        line_width=1,
        model="best.pt",
        verbose=False
    )

    counterright = solutions.ObjectCounter(
        show=False,
        region=line_points_right,
        # names=model.names,
        # classes=classes_to_count,
        draw_tracks=False,
        line_width=1,
        model="best.pt",
        verbose=False
    )

    print("ObjectCounter initialized successfully.")
except Exception as e:
    print(f"Failed to initialize ObjectCounter: {e}")
    raise

# Define classes to count (modify as needed)
  # Example: classes corresponding to cars, buses, trucks, etc.

async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print(f"Connection state is {pc.connectionState}")
        if pc.connectionState == "failed":
            await pc.close()
            pcs.discard(pc)
    
    # Relay the video track
    video_track = relay.subscribe(player.video, buffered=True)

    # Process the video track using YOLOv8
    processed_track = VideoProcessorTrack(video_track)

    # Add the processed track to the peer connection
    pc.addTrack(processed_track)

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    #Clear all variable
    processed_track = None
    params = None
    offer = None
    video_track = None
    answer = None

    # gc.collect()

    return web.Response(
        content_type="application/json",
        text=json.dumps({"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}),
    )


class VideoProcessorTrack(MediaStreamTrack):
    kind = "video"
    def __init__(self, track):
        super().__init__()
        self.track = track
        self.frame_skip = 5  # Skip every 5 frames
        self.frame_count = 0

    async def recv(self):
        frame = await self.track.recv()
        self.frame_count += 1

        # Skip some frames to reduce processing load
        if self.frame_count % self.frame_skip != 0:
            return frame

        # Convert frame to numpy array for YOLOv8
        img = frame.to_ndarray(format="bgr24")

        # Run YOLOv8 tracking on the image
        # tracks = model.track(img, persist=True, classes=classes_to_count, verbose=False)
        # counted_img = counter.start_counting(img, tracks)
        # counted_img_left = counterleft.count(img)
        # counted_img = counterright.count(counted_img_left)
        counted_img = counterleft.count(img)

        # Convert processed image back to video frame
        new_frame = av.VideoFrame.from_ndarray(counted_img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base

        # Clear all var
        frame = None
        img = None
        counted_img = None
        counted_img_left = None
        
        # gc.collect()

        return new_frame

pcs = set()

async def data_offer(request):
    params = await request.json()
    offer_sdp = params['sdp']
    offer_type = params['type']

    pc = RTCPeerConnection()
    pcs.add(pc)

    # Create a DataChannel if the role is offer
    channel = pc.createDataChannel("chat")
    # Inside the run_answer or run_offer functions, wherever the data channel is initialized

    @pc.on("datachannel")
    def on_datachannel(channel):
        print(f"DataChannel {channel.label} is open")
        datenow = datetime.datetime.now()

        @channel.on("open")
        def on_open():
            channel.send(counterleft.classwise_counts)

        @channel.on("message")
        def on_message(message):
            print(f"Received message: {message}")

            # Check for 'ping' message and send 'pong' back
            if message.startswith("ping"):
                # Send back 'pong'
                # reply = f"pong {message}"
                counterleft_result = counterleft.classwise_counts
                # counterright_result = counterright.classwise_counts

                channel.send(json.dumps({"data_left": counterleft_result, "data_time": str(datenow)}))
                # channel.send(json.dumps({"data_left": counterleft_result, "data_right": counterright_result, "data_time": str(datenow)}))
                print("counter sended")
                # print(f"Sent reply: {reply}")

    await pc.setRemoteDescription(RTCSessionDescription(sdp=offer_sdp, type=offer_type))

    # Create answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        'sdp': pc.localDescription.sdp,
        'type': pc.localDescription.type
    })


async def on_shutdown(app):
    # Close all peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()

if __name__ == "__main__":
    app = web.Application()

    # Setup CORS
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            max_age=3600,
        )
    })

    # Add the offer route and apply CORS to it
    offer_route = app.router.add_post("/offer", offer)
    cors.add(offer_route)

    offer_route = app.router.add_post("/dataoffer", data_offer)
    cors.add(offer_route)


    app.on_shutdown.append(on_shutdown)

    # Run the app
    web.run_app(app, host="localhost", port=3005)
