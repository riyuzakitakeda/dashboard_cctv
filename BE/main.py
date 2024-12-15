import cv2
import ffmpeg
import subprocess
import os
from ultralytics import YOLO, solutions

output_dir = "output"
os.makedirs(output_dir, exist_ok=True)

# Configuration
# Load RTSP credentials and URI
username = 'admin'
password = 'makassar12'
uri = '10.50.12.200/ISAPI/Streaming/Channels/102/httpPreview'
full_uri = f'rtsp://{username}:{password}@{uri}'  # Ensure you're using rtsp:// for RTSP streams
rtsp_url = full_uri  # Replace with your RTSP stream URL
rtmp_url = "rtmp://127.0.0.1/live/stream"  # Replace with your RTMP server URL

line_points_left = [(150, 250), (400, 250), (600, 400), (150, 400)]
line_points_right = [(300, 150), (500, 140), (700, 200), (600, 300)]

try:
    counterleft = solutions.RegionCounter(
        show=False,
        region=line_points_left,
        draw_tracks=False,
        line_width=1,
        model="best.pt",
        verbose=False
    )

    counterright = solutions.ObjectCounter(
        show=False,
        region=line_points_right,
        draw_tracks=False,
        line_width=1,
        model="best.pt",
        verbose=False
    )

    print("ObjectCounter initialized successfully.")
except Exception as e:
    print(f"Failed to initialize ObjectCounter: {e}")
    raise

def stream_rtsp_to_rtmp(rtsp_url, rtmp_url):
    # Open RTSP stream with OpenCV
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print("Error: Could not open RTSP stream.")
        return

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    print(f"Video properties: {width}x{height} at {fps} FPS")

    # Start FFmpeg subprocess to send video to RTMP
    ffmpeg_process = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-f", "rawvideo",
            "-vcodec", "rawvideo",
            "-pix_fmt", "bgr24",
            "-s", f"{width}x{height}",
            "-r", str(fps),
            "-i", "-",
            "-c:v", "libx264",  # Change to "h264_nvenc" if using NVIDIA GPU
            "-pix_fmt", "yuv420p",
            "-preset", "ultrafast",
            # "-f", "flv", rtmp_url,
            # "-c:v", "libx264",
            "-f", "hls",
            "-hls_time", "2",
            "-hls_list_size", "3",
            "-hls_flags", "delete_segments",
            os.path.join(output_dir, "stream.m3u8"),
        ],
        stdin=subprocess.PIPE
    )

    frame_counter = 0

    # Read frames and write to FFmpeg
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Frame capture failed.")
                break

            # frame_counter += 1

            # Skip 5 frames (process every 6th frame)
            # if frame_counter % 6 != 0:
            #     continue

            # img = frame
            # counted_img_left = counterleft.count(img)
            # counted_img = counterright.count(counted_img_left)

            try:
                flag, encodedImage = cv2.imencode(".jpg", frame)
                output_frame = encodedImage.tobytes()
                ffmpeg_process.stdin.write(output_frame)
            except Exception as e:
                print(f"Error encoding frame: {e}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Release resources
        cap.release()
        ffmpeg_process.stdin.close()
        ffmpeg_process.wait()

if __name__ == "__main__":
    stream_rtsp_to_rtmp(rtsp_url, rtmp_url)
