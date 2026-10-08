#!/usr/bin/env python3
"""
EcoVision ML Service: OpenCV CLAHE Preprocessing & YOLOv8 Inference.
Can be executed as a CLI utility returning structured JSON to stdout.
"""

import sys
import os
import time
import json
import hashlib
import argparse
import cv2
import numpy as np

# Map COCO classes to EcoVision high-level domain labels
HUMAN_CLASSES = {'person'}
VEHICLE_CLASSES = {'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat'}
ANIMAL_CLASSES = {
    'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'
}

def compute_image_hash(image_path):
    hasher = hashlib.sha256()
    with open(image_path, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def run_clahe_preprocessing(image_path, output_path=None, clip_limit=2.0, tile_grid=8):
    """
    Applies OpenCV CLAHE enhancement to an image.
    Works on color images in LAB space (equalizing L channel) or grayscale images.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    start_time = time.perf_counter()
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not decode image at {image_path}")

    h, w = img.shape[:2]
    img_hash = compute_image_hash(image_path)

    # Compute luminance metrics
    if len(img.shape) == 2 or img.shape[2] == 1:
        gray = img
        mean_lum = float(np.mean(gray))
        var_lum = float(np.var(gray))
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid, tile_grid))
        enhanced = clahe.apply(gray)
    else:
        # Convert BGR to LAB color space
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        mean_lum = float(np.mean(l_channel))
        var_lum = float(np.var(l_channel))

        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid, tile_grid))
        cl = clahe.apply(l_channel)
        enhanced_lab = cv2.merge((cl, a_channel, b_channel))
        enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # Determine mode based on illumination
    mode = 'night_infrared_normalized' if mean_lum < 100 else 'daylight_normalized'
    contrast_score = round(min(1.0, float(np.sqrt(var_lum)) / 96.0), 3)

    saved_path = None
    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        cv2.imwrite(output_path, enhanced)
        saved_path = output_path

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "method": "OpenCV-CLAHE",
        "mode": mode,
        "clipLimit": clip_limit,
        "tileGridSize": [tile_grid, tile_grid],
        "contrastScore": contrast_score,
        "meanLuminance": round(mean_lum, 2),
        "imageHash": img_hash,
        "imageDims": {"width": w, "height": h},
        "enhancedPath": saved_path,
        "processingTimeMs": elapsed_ms
    }

def resolve_model_path(model_path="yolov8n.pt"):
    if os.path.exists(model_path):
        return model_path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    weights_path = os.path.join(current_dir, "weights", os.path.basename(model_path))
    if os.path.exists(weights_path):
        return weights_path
    workspace_path = os.path.join(current_dir, "..", "..", os.path.basename(model_path))
    if os.path.exists(workspace_path):
        return os.path.abspath(workspace_path)
    return model_path

def run_yolo_detection(image_path, model_path="yolov8n.pt", conf_threshold=0.25, threshold_overrides=None):
    """
    Runs YOLOv8 object detection on the image.
    Extracts humans, vehicles, and wildlife/animals with normalized coordinates.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    from ultralytics import YOLO
    import ultralytics

    start_time = time.perf_counter()
    resolved_model = resolve_model_path(model_path)
    model = YOLO(resolved_model)
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")
    img_h, img_w = img.shape[:2]

    # Run inference with lowest base threshold to capture candidates
    base_conf = min(conf_threshold, 0.15)
    results = model(image_path, conf=base_conf, verbose=False)
    result = results[0]

    detections = []
    raw_inference = []

    names = model.names # COCO class names dict
    boxes = result.boxes

    if boxes is not None and len(boxes) > 0:
        for idx, box in enumerate(boxes):
            cls_id = int(box.cls[0].item())
            raw_label = names.get(cls_id, f"class_{cls_id}").lower()
            confidence = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist() # [x1, y1, x2, y2] in pixels

            x1, y1, x2, y2 = xyxy

            # Normalized percentage coordinates [0, 100]
            norm_x = round(max(0.0, min(99.0, (x1 / img_w) * 100.0)), 2)
            norm_y = round(max(0.0, min(99.0, (y1 / img_h) * 100.0)), 2)
            norm_w = round(max(0.5, min(100.0 - norm_x, ((x2 - x1) / img_w) * 100.0)), 2)
            norm_h = round(max(0.5, min(100.0 - norm_y, ((y2 - y1) / img_h) * 100.0)), 2)

            raw_item = {
                "rawClassId": cls_id,
                "rawLabel": raw_label,
                "confidence": round(confidence, 4),
                "pixelBbox": [round(v, 1) for v in xyxy],
                "bbox": {"x": norm_x, "y": norm_y, "width": norm_w, "height": norm_h}
            }
            raw_inference.append(raw_item)

            # Map to EcoVision taxonomy
            if raw_label in HUMAN_CLASSES:
                canonical_label = 'human'
                species = 'Homo sapiens'
            elif raw_label in VEHICLE_CLASSES:
                canonical_label = 'vehicle'
                species = raw_label.capitalize()
            elif raw_label in ANIMAL_CLASSES:
                canonical_label = 'animal'
                species = raw_label.capitalize()
            else:
                # Other COCO objects
                canonical_label = 'other'
                species = raw_label.capitalize()

            # Check threshold for this label / species
            active_thresh = conf_threshold
            if threshold_overrides:
                if canonical_label in threshold_overrides:
                    active_thresh = threshold_overrides[canonical_label]
                elif raw_label in threshold_overrides:
                    active_thresh = threshold_overrides[raw_label]

            if confidence >= active_thresh:
                detections.append({
                    "id": f"{canonical_label}-{idx + 1}",
                    "label": canonical_label,
                    "species": species,
                    "rawLabel": raw_label,
                    "confidence": round(confidence, 3),
                    "bbox": {
                        "x": norm_x,
                        "y": norm_y,
                        "width": norm_w,
                        "height": norm_h
                    },
                    "pixelBbox": [round(v, 1) for v in xyxy],
                    "model": f"YOLOv8n-{ultralytics.__version__}"
                })

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "modelVersion": f"yolov8n-{ultralytics.__version__}",
        "confidenceThreshold": conf_threshold,
        "processingTimeMs": elapsed_ms,
        "imageDims": {"width": img_w, "height": img_h},
        "detections": detections,
        "rawInference": raw_inference
    }

def run_video_pipeline(video_path, model_path="yolov8n.pt", keyframe_output=None, conf_threshold=0.25, threshold_overrides=None, sample_fps=2.0):
    """
    Processes video by sampling frames, running YOLOv8 detection,
    and saving the best representative keyframe with detected bounding boxes.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found at {video_path}")

    from ultralytics import YOLO
    import ultralytics

    start_time = time.perf_counter()
    resolved_model = resolve_model_path(model_path)
    model = YOLO(resolved_model)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file at {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    duration_s = round(total_frames / video_fps, 2) if video_fps > 0 else 0
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480

    frame_interval = max(1, int(video_fps / sample_fps))
    current_frame = 0

    best_frame = None
    best_detections = []
    best_score = -1.0
    sighting_timestamps = []
    all_sighted_species = set()
    raw_inference = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if current_frame % frame_interval == 0:
            frame_time_s = round(current_frame / video_fps, 2)
            results = model(frame, conf=min(conf_threshold, 0.15), verbose=False)
            frame_dets = []
            frame_score = 0.0

            for r in results:
                for idx, box in enumerate(r.boxes):
                    cls_id = int(box.cls[0].item())
                    confidence = float(box.conf[0].item())
                    raw_label = model.names[cls_id]
                    canonical_label = map_label_to_domain(raw_label)
                    species = map_species_name(raw_label)

                    if canonical_label:
                        req_thresh = get_species_threshold(canonical_label, species, conf_threshold, threshold_overrides)
                        if confidence >= req_thresh:
                            xyxy = box.xyxy[0].tolist()
                            norm_x = round(max(0.0, min(100.0, (xyxy[0] / w) * 100)), 2)
                            norm_y = round(max(0.0, min(100.0, (xyxy[1] / h) * 100)), 2)
                            norm_w = round(max(0.1, min(100.0, ((xyxy[2] - xyxy[0]) / w) * 100)), 2)
                            norm_h = round(max(0.1, min(100.0, ((xyxy[3] - xyxy[1]) / h) * 100)), 2)

                            det_item = {
                                "id": f"{canonical_label}-{idx + 1}",
                                "label": canonical_label,
                                "species": species,
                                "rawLabel": raw_label,
                                "confidence": round(confidence, 3),
                                "bbox": {
                                    "x": norm_x,
                                    "y": norm_y,
                                    "width": norm_w,
                                    "height": norm_h
                                },
                                "videoTimestamp": frame_time_s,
                                "model": f"YOLOv8n-{ultralytics.__version__}"
                            }
                            frame_dets.append(det_item)
                            frame_score += confidence
                            all_sighted_species.add(species)
                            raw_inference.append({
                                "rawLabel": raw_label,
                                "confidence": round(confidence, 3),
                                "videoTimestamp": frame_time_s
                            })

            if frame_dets:
                sighting_timestamps.append(frame_time_s)
                if frame_score > best_score:
                    best_score = frame_score
                    best_detections = frame_dets
                    best_frame = frame.copy()
            elif best_frame is None and current_frame == 0:
                best_frame = frame.copy()

        current_frame += 1

    cap.release()

    saved_keyframe = None
    if best_frame is not None and keyframe_output:
        cv2.imwrite(keyframe_output, best_frame)
        saved_keyframe = keyframe_output

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "mediaType": "video",
        "duration": duration_s,
        "videoFps": video_fps,
        "totalFrames": total_frames,
        "imageDims": {"width": w, "height": h},
        "keyframePath": saved_keyframe,
        "modelVersion": f"yolov8n-{ultralytics.__version__}",
        "confidenceThreshold": conf_threshold,
        "processingTimeMs": elapsed_ms,
        "detections": best_detections,
        "rawInference": raw_inference,
        "sightedSpecies": list(all_sighted_species),
        "sightingTimestamps": sighting_timestamps
    }

def main():
    parser = argparse.ArgumentParser(description="EcoVision ML Preprocessing & Detection Pipeline")
    parser.add_argument("--action", choices=["preprocess", "detect", "pipeline", "video"], required=True)
    parser.add_argument("--image", required=True, help="Input image or video file path")
    parser.add_argument("--enhanced-output", default=None, help="Output path for CLAHE enhanced image or video keyframe")
    parser.add_argument("--model", default="yolov8n.pt", help="Path or name of YOLO model")
    parser.add_argument("--threshold", type=float, default=0.25, help="Confidence threshold")
    parser.add_argument("--clip-limit", type=float, default=2.0, help="CLAHE clip limit")
    parser.add_argument("--tile-grid", type=int, default=8, help="CLAHE tile grid size")
    parser.add_argument("--overrides", type=str, default=None, help="JSON string of threshold overrides")

    args = parser.parse_args()

    threshold_overrides = None
    if args.overrides:
        try:
            threshold_overrides = json.loads(args.overrides)
        except Exception:
            pass

    try:
        if args.action == "preprocess":
            res = run_clahe_preprocessing(
                args.image,
                output_path=args.enhanced_output,
                clip_limit=args.clip_limit,
                tile_grid=args.tile_grid
            )
            print(json.dumps(res))

        elif args.action == "detect":
            res = run_yolo_detection(
                args.image,
                model_path=args.model,
                conf_threshold=args.threshold,
                threshold_overrides=threshold_overrides
            )
            print(json.dumps(res))

        elif args.action == "video":
            res = run_video_pipeline(
                args.image,
                model_path=args.model,
                keyframe_output=args.enhanced_output,
                conf_threshold=args.threshold,
                threshold_overrides=threshold_overrides
            )
            print(json.dumps(res))

        elif args.action == "pipeline":
            # 1. Preprocess
            prep = run_clahe_preprocessing(
                args.image,
                output_path=args.enhanced_output,
                clip_limit=args.clip_limit,
                tile_grid=args.tile_grid
            )
            # 2. Detect (pass CLAHE enhanced image if available, else original)
            inference_input = prep.get("enhancedPath") or args.image
            det = run_yolo_detection(
                inference_input,
                model_path=args.model,
                conf_threshold=args.threshold,
                threshold_overrides=threshold_overrides
            )
            total_time = round(prep["processingTimeMs"] + det["processingTimeMs"], 2)
            output = {
                "preprocessing": prep,
                "detection": det,
                "totalProcessingTimeMs": total_time
            }
            print(json.dumps(output))

    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
