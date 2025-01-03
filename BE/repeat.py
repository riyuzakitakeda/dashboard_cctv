import requests
import asyncio
import time

# Define the Flask app URL
BASE_URL = "http://127.0.0.1:8000/image-data"

# List of camera IDs
CAMERA_IDS = ["pettarani", "barombong", "alauddin", "mtos"]

# Function to fetch image data from a single camera
async def fetch_camera_data(camera_id):
    try:
        url = f"{BASE_URL}/{camera_id}"
        print(f"Fetching data for camera: {camera_id}")
        response = requests.get(url, timeout=10)  # Adjust timeout as needed
        response.raise_for_status()  # Raise an error for bad status codes
        data = response.json()
        print(f"Data for {camera_id}: {data}")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {camera_id}: {e}")

# Function to fetch data from all cameras
async def fetch_all_cameras():
    tasks = [fetch_camera_data(camera_id) for camera_id in CAMERA_IDS]
    await asyncio.gather(*tasks)

# Periodic function to fetch data every 3 minutes
async def periodic_task(interval=180):
    while True:
        await fetch_all_cameras()
        print("Waiting for the next interval...")
        await asyncio.sleep(interval)

# Entry point for the script
if __name__ == "__main__":
    print("Starting camera data fetcher...")
    try:
        asyncio.run(periodic_task())
    except KeyboardInterrupt:
        print("Exiting camera data fetcher...")
