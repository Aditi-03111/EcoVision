# EcoVision

EcoVision is a full-stack platform for endangered wildlife monitoring from camera-trap images. It features image upload, OpenCV CLAHE contrast preprocessing, model-backed YOLOv8 object detection with normalized bounding boxes, Siamese animal re-identification, threat classification, and an interactive review dashboard.

## Directory Structure

```
├── backend/                  # Node.js Express REST API & ML Services
│   ├── config/              # Threshold configurations by species & camera
│   ├── db/                  # MongoDB & JSON persistence stores
│   ├── ml/                  # Machine learning pipeline & weights
│   │   ├── weights/         # YOLOv8 model weights (yolov8n.pt)
│   │   └── pipeline.py      # OpenCV CLAHE & YOLOv8 inference service
│   ├── schemas/             # Event and animal schema definitions & versioning
│   ├── services/            # Preprocess, detection, and re-identification services
│   ├── utils/               # Geometry validation & bbox normalization
│   └── index.js             # API server entry point
├── frontend/                 # React + Vite web application
│   ├── index.html           # Single-page HTML entry point
│   └── src/
│       ├── components/      # Modular UI components (Header, Sidebar, EventCard, etc.)
│       ├── utils/           # Frontend formatters and helpers
│       ├── styles.css       # Clean dashboard styling
│       ├── App.jsx          # Root application component
│       └── main.jsx         # React DOM mount point
├── test/                     # Automated test suites (API, schemas, geometry, store, threat)
├── data/                     # Seeded JSON dataset fallback (.gitkeep)
├── uploads/                  # Uploaded camera-trap images (.gitkeep)
├── ROADMAP.md                # 6-phase development roadmap and exit criteria
└── package.json              # Project scripts and dependencies
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Start Development Servers

Runs both the backend API (`http://127.0.0.1:4000`) and the frontend client (`http://127.0.0.1:5173`):

```bash
npm run dev
```

You can also run them independently:
- **Backend API**: `npm run backend` (port 4000)
- **Frontend Client**: `npm run frontend` (port 5173)

### Run Tests

Run the test suite:

```bash
npm test
```

## Production Model Integration

The ML adapter boundaries in `backend/services/` connect directly to real models:
1. **OpenCV CLAHE Preprocessing** (`backend/services/preprocess.js` -> `backend/ml/pipeline.py`): Performs contrast-limited adaptive histogram equalization.
2. **YOLOv8 Detection Service** (`backend/services/detection.js` -> `backend/ml/pipeline.py`): Real inference returning normalized coordinates and confidence scores.
3. **Re-Identification Service** (`backend/services/reid.js`): ReID embeddings matching against registered animal identities.
4. **Data Persistence** (`backend/db/store.js`): MongoDB collections for `events` and `animals` (or JSON fallback). Set `MONGODB_URI` and `MONGODB_DB=ecovision` to persist with MongoDB.

## Development Roadmap & Phases

See [ROADMAP.md](file:///Users/aditi/Desktop/mini%20proj/ROADMAP.md) for the complete engineering phases, milestones, current status, and exit criteria:
- **Phase 0: Prototype Hardening** (Completed ✅)
- **Phase 1: Real Inference Integration** (Completed ✅)
- **Phase 2: Identity and Review Workflow** (Next Up ⏳)
- **Phase 3: Alerting and Operational Dashboard** (Planned ⏳)
- **Phase 4: Data Quality and Model Evaluation** (Planned ⏳)
- **Phase 5: Pilot Deployment** (Planned ⏳)
