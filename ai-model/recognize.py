import sys
import cv2
import numpy as np
import json
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "age_net.caffemodel")
PROTO_PATH = os.path.join(os.path.dirname(__file__), "age_deploy.prototxt")

AGE_LIST = ['(0-2)', '(4-6)', '(8-12)', '(15-20)',
            '(25-32)', '(38-43)', '(48-53)', '(60-100)']

age_net = cv2.dnn.readNetFromCaffe(PROTO_PATH, MODEL_PATH)

def predict_age(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return "Cannot read image"

    blob = cv2.dnn.blobFromImage(
        image, 1.0, (227, 227),
        (78.4263377603, 87.7689143744, 114.895847746),
        swapRB=False
    )
    age_net.setInput(blob)
    age_preds = age_net.forward()
    age = AGE_LIST[age_preds[0].argmax()]
    return age

if __name__ == "__main__":
    path = sys.argv[1]
    result = predict_age(path)
    print(json.dumps({ "age": result }))
