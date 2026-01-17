import cv2
import mediapipe as mp
import numpy as np
import base64

## will be updated based on how frontend sends data and other factors

# frame_data is a string received from the frontend
# Example: frame_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhE..."

# Remove header if exists
if "," in frame_data:
    frame_data = frame_data.split(",")[1]

# Decode base64
frame_bytes = base64.b64decode(frame_data)

# Convert to numpy array
nparr = np.frombuffer(frame_bytes, np.uint8)

# Decode image
frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)  # BGR format


mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)

# frame is a single BGR image (e.g., from cv2.imread or a video)
image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) # frame is given from frontend
results = pose.process(image_rgb)

if not results.pose_landmarks:
    raise ValueError("No person detected")



landmarks = results.pose_landmarks.landmark

def lm_to_vec(lm, w, h):
    return np.array([lm.x * w, lm.y * h, lm.z])

h, w, _ = frame.shape

# Head (nose as proxy)
H = lm_to_vec(landmarks[mp_pose.PoseLandmark.NOSE], w, h)

# Shoulders
LS = lm_to_vec(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER], w, h)
RS = lm_to_vec(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER], w, h)

# Neck = midpoint of shoulders
N = (LS + RS) / 2

# Choose one shoulder (e.g., right)
S = RS


v_head_to_neck = abs(N - H)
v_neck_to_right_shoulder = abs(S - N)
v_head_to_right_shoulder = abs(S - H)
v_neck_to_left_shoulder = abs(LS - N)
v_nose_to_left_shoulder = abs(LS - H)


def draw_vector(img, start, vec, color):
    end = start + vec[:2]
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

cv2.imshow("Frame with Vectors", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()
# Now v_head_to_neck, v_neck_to_shoulder, and v_head_to_shoulder contain the desired vectors
vectors_dict = {
	"head_to_neck": (tuple(H[:2]), tuple(N[:2])),
	"neck_to_right_shoulder": (tuple(N[:2]), tuple(S[:2])),
	"head_to_right_shoulder": (tuple(H[:2]), tuple(S[:2])),
    "neck_to_left_shoulder": (tuple(N[:2]), tuple(LS[:2])),
	"head_to_left_shoulder": (tuple(H[:2]), tuple(LS[:2])),
}