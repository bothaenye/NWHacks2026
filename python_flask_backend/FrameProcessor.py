import cv2
import mediapipe as mp
import numpy as np
import base64
from frameData import frame_data

# -------------------------------
# Decode base64 frame from frontend
# -------------------------------
if "," in frame_data:
    frame_data = frame_data.split(",")[1]

frame_bytes = base64.b64decode(frame_data)
nparr = np.frombuffer(frame_bytes, np.uint8)
frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)  # BGR format

# -------------------------------
# MediaPipe Pose setup
# -------------------------------
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

pose = mp_pose.Pose(
    static_image_mode=True,
    model_complexity=1,
    enable_segmentation=False,
    min_detection_confidence=0.5
)

# Convert BGR to RGB for MediaPipe
image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
results = pose.process(image_rgb)

if not results.pose_landmarks:
    raise ValueError("No person detected")

landmarks = results.pose_landmarks.landmark

# -------------------------------
# Helper: convert normalized landmarks to pixel coordinates
# -------------------------------
def lm_to_vec(lm, w, h):
    return np.array([lm.x * w, lm.y * h, lm.z])

h, w, _ = frame.shape

# Head (nose)
H = lm_to_vec(landmarks[mp_pose.PoseLandmark.NOSE], w, h)

# Shoulders
LS = lm_to_vec(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER], w, h)
RS = lm_to_vec(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER], w, h)

# Neck (midpoint of shoulders)
N = (LS + RS) / 2

# Choose right shoulder for example
S = RS

# -------------------------------
# Compute vectors
# -------------------------------
v_head_to_neck = N - H
v_neck_to_right_shoulder = S - N
v_head_to_right_shoulder = S - H
v_neck_to_left_shoulder = LS - N
v_head_to_left_shoulder = LS - H

# -------------------------------
# Draw vectors on frame
# -------------------------------
def draw_vector(img, start, vec, color):
    end = start[:2] + vec[:2]
    cv2.arrowedLine(
        img,
        tuple(start[:2].astype(int)),
        tuple(end.astype(int)),
        color,
        2
    )

draw_vector(frame, H, v_head_to_neck, (0, 255, 0))
draw_vector(frame, N, v_neck_to_right_shoulder, (255, 0, 0))
draw_vector(frame, H, v_head_to_right_shoulder, (0, 0, 255))

# Optional: draw left shoulder vector
draw_vector(frame, N, v_neck_to_left_shoulder, (255, 255, 0))
draw_vector(frame, H, v_head_to_left_shoulder, (0, 255, 255))

# -------------------------------
# Show frame
# -------------------------------
cv2.imshow("Frame with Vectors", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()

# -------------------------------
# Output vectors dictionary
# -------------------------------
vectors_dict = {
    "head_to_neck": (tuple(H[:2]), tuple(N[:2])),
    "neck_to_right_shoulder": (tuple(N[:2]), tuple(S[:2])),
    "head_to_right_shoulder": (tuple(H[:2]), tuple(S[:2])),
    "neck_to_left_shoulder": (tuple(N[:2]), tuple(LS[:2])),
    "head_to_left_shoulder": (tuple(H[:2]), tuple(LS[:2])),
}
