# EcoVision

EcoVision is a working full-stack prototype for endangered wildlife monitoring from camera-trap images. It supports image upload, contrast-preprocessing metadata, YOLOv8-style object event output, Siamese-style animal re-identification, threat scoring, and a review dashboard.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Architecture

- `server/index.js`: Express API for upload, events, review status, and dashboard summary.
- `server/services/preprocess.js`: CLAHE preprocessing interface. The demo adapter records CLAHE settings and image statistics; replace this module with OpenCV CLAHE for production.
- `server/services/detection.js`: YOLOv8 adapter boundary. The demo implementation produces deterministic animal/human/vehicle detections from image features and filename hints.
- `server/services/reid.js`: Siamese Neural Network adapter boundary. The demo implementation creates repeatable embeddings and matches against stored animal identities.
- `server/db/store.js`: MongoDB-backed persistence when `MONGODB_URI` is configured, with JSON-file fallback for local demos.
- `src/`: React dashboard.

## Production Model Integration

Use the same service boundaries and replace the demo logic with:

1. OpenCV CLAHE preprocessing, saving the processed image or passing tensors directly downstream.
2. YOLOv8 inference from exported ONNX/TensorRT/PyTorch service returning `{ bbox, label, confidence }`.
3. Siamese embedding service returning normalized vectors for animal crops.
4. MongoDB collections for `events` and `animals`.

Set `MONGODB_URI` and `MONGODB_DB=ecovision` to persist with MongoDB.

## Development Roadmap & Phases

See [ROADMAP.md](file:///Users/aditi/Desktop/mini%20proj/ROADMAP.md) for the complete engineering phases, milestones, current status, and exit criteria:
- **Phase 0: Prototype Hardening** (Completed ✅)
- **Phase 1: Real Inference Integration** (Completed ✅)
- **Phase 2: Identity and Review Workflow** (Next Up ⏳)
- **Phase 3: Alerting and Operational Dashboard** (Planned ⏳)
- **Phase 4: Data Quality and Model Evaluation** (Planned ⏳)
- **Phase 5: Pilot Deployment** (Planned ⏳)

## Testing

Run the automated test suite:
```bash
npm test
```
