import cv2
import mediapipe as mp
import numpy as np
import base64
from frameDataQ import frame_data

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



# vectors_dict = {
#     "head_to_neck": (tuple(H[:2]), tuple(N[:2])),
#     "neck_to_right_shoulder": (tuple(N[:2]), tuple(S[:2])),
#     "head_to_right_shoulder": (tuple(H[:2]), tuple(S[:2])),
#     "neck_to_left_shoulder": (tuple(N[:2]), tuple(LS[:2])),
#     "head_to_left_shoulder": (tuple(H[:2]), tuple(LS[:2])),
# }

vectors_dict = {
    "head_to_neck": v_head_to_neck,
    "neck_to_right_shoulder": v_neck_to_right_shoulder,
    "head_to_right_shoulder": v_head_to_right_shoulder,
    "neck_to_left_shoulder": v_neck_to_left_shoulder,
    "head_to_left_shoulder": v_head_to_left_shoulder,
}

print(vectors_dict)

# ===============================
# Posture Classification
# ===============================

def angle_between(v1, v2):
    v1 = v1 / np.linalg.norm(v1)
    v2 = v2 / np.linalg.norm(v2)
    return np.degrees(np.arccos(np.clip(np.dot(v1, v2), -1.0, 1.0)))

# Vertical direction (downwards in image space)
VERTICAL = np.array([0, 1, 0])

# -------------------------------
# Forward head posture
# -------------------------------
forward_head_angle = angle_between(v_head_to_neck, VERTICAL)
forward_head_bad = forward_head_angle > 25  # degrees

# -------------------------------
# Head tilt (left/right)
# -------------------------------
left_dist = np.linalg.norm(v_head_to_left_shoulder[:2])
right_dist = np.linalg.norm(v_head_to_right_shoulder[:2])

head_tilt_ratio = abs(left_dist - right_dist) / max(left_dist, right_dist)
head_tilt_bad = head_tilt_ratio > 0.15  # 15%

# -------------------------------
# Shoulder imbalance
# -------------------------------
shoulder_height_diff = abs(LS[1] - RS[1])  # y-axis pixels
shoulder_imbalance = shoulder_height_diff / h
shoulder_bad = shoulder_imbalance > 0.05  # 5% of image height

# -------------------------------
# Final classification
# -------------------------------
issues = []

if forward_head_bad:
    issues.append("Forward head")

if head_tilt_bad:
    issues.append("Head tilt")

if shoulder_bad:
    issues.append("Uneven shoulders")

if not issues:
    posture = "Good posture"
    color = (0, 255, 0)
else:
    posture = "Poor posture"
    color = (0, 0, 255)

# -------------------------------
# Draw result on frame
# -------------------------------
cv2.putText(
    frame,
    posture,
    (30, 40),
    cv2.FONT_HERSHEY_SIMPLEX,
    1,
    color,
    2
)

for i, issue in enumerate(issues):
    cv2.putText(
        frame,
        f"- {issue}",
        (30, 80 + i * 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        color,
        2
    )

print("Posture:", posture)
print("Issues:", issues)


# -------------------------------
# Show frame
# -------------------------------
cv2.imshow("Frame with Vectors", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()


