# EcoVision Camera Trap Development Roadmap

This document outlines the multi-phase engineering and machine learning roadmap for the **EcoVision** endangered wildlife monitoring and camera-trap platform.

---

## Roadmap Overview & Status

| Phase | Title | Primary Focus | Status |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Prototype Hardening** | Schema contracts, geometry normalization, upload validation, error states & automated testing | **Completed** ✅ |
| **Phase 1** | **Real Inference Integration** | YOLOv8 object detection service, OpenCV CLAHE preprocessing, metadata traceability & threshold controls | **Completed** ✅ |
| **Phase 2** | **Identity & Review Workflow** | Trained ReID embeddings, vector similarity search, reviewer reconciliation & animal profile history | **Next Up** ⏳ |
| **Phase 3** | **Alerting & Operational Dashboard** | Camera registry & health, rule-based threat alerts (poaching/intrusion), incident escalation queues | **Planned** ⏳ |
| **Phase 4** | **Data Quality & Model Evaluation** | Benchmark evaluation datasets, precision/recall metrics, shadow evaluation, privacy & retention | **Planned** ⏳ |
| **Phase 5** | **Pilot Deployment** | MongoDB production cluster, object storage, auth/RBAC, containerization, asynchronous batch queues | **Planned** ⏳ |

---

## Detailed Phase Breakdown

### Phase 0: Prototype Hardening
**Status:** Completed ✅

#### Objectives & Implementation
- **Schema Contracts & Versioning**: Defined formal event and animal schema models (`schemaVersion: 1.0.0`) enforcing data integrity, timestamps, confidence scores, and review lifecycles.
  - Implementation: [event.js](file:///Users/aditi/Desktop/mini%20proj/server/schemas/event.js), [animal.js](file:///Users/aditi/Desktop/mini%20proj/server/schemas/animal.js)
- **Bounding-Box Normalization & Validation**: Sanitized and clamped bounding-box geometries (handling negative offsets, unit-ratio conversions, pixel coordinates, and boundary clamping) to eliminate invalid geometry bugs.
  - Implementation: [geometry.js](file:///Users/aditi/Desktop/mini%20proj/server/utils/geometry.js)
- **API & Upload Validation**: Added comprehensive request validation for image files (format/MIME, size limits), camera types, and ISO timestamps with error handling.
  - Implementation: [server/index.js](file:///Users/aditi/Desktop/mini%20proj/server/index.js)
- **Threat Classification Rules**: Structured logic for categorizing sightings into `high` (animal + human or vehicle present), `medium` (unauthorized human/vehicle without animals), and `low` (wildlife only).
  - Implementation: [classifyThreat](file:///Users/aditi/Desktop/mini%20proj/server/index.js#L270-L279)
- **Automated Test Suite**: Built 40 passing tests using Node.js native test runner covering API endpoints, store operations, threat classification, geometry normalization, and schema validation.
  - Test suites: [api.test.js](file:///Users/aditi/Desktop/mini%20proj/test/api.test.js), [geometry.test.js](file:///Users/aditi/Desktop/mini%20proj/test/geometry.test.js), [schemas.test.js](file:///Users/aditi/Desktop/mini%20proj/test/schemas.test.js), [store.test.js](file:///Users/aditi/Desktop/mini%20proj/test/store.test.js), [threat.test.js](file:///Users/aditi/Desktop/mini%20proj/test/threat.test.js)

#### Exit Criteria
> **Achieved**: Reliable demo with reproducible seeded data, strictly validated data contracts, and zero invalid event geometries.

---

### Phase 1: Real Inference Integration
**Status:** Completed ✅

#### Objectives & Implementation
- **OpenCV CLAHE Preprocessing**: Integrated real Contrast Limited Adaptive Histogram Equalization (CLAHE) on LAB color channels (for color images) and grayscale (for nighttime infrared captures) via Python/OpenCV bridge.
  - Implementation: [pipeline.py](file:///Users/aditi/Desktop/mini%20proj/server/ml/pipeline.py), [preprocess.js](file:///Users/aditi/Desktop/mini%20proj/server/services/preprocess.js)
- **YOLOv8 Inference Service**: Integrated YOLOv8 model inference executing on enhanced images, mapping model detections into standard labels (`animal`, `human`, `vehicle`, specific species) with normalized bounding boxes.
  - Model weights: [yolov8n.pt](file:///Users/aditi/Desktop/mini%20proj/yolov8n.pt)
  - Bridge service: [detection.js](file:///Users/aditi/Desktop/mini%20proj/server/services/detection.js)
- **Traceable Inference Metadata**: Captured execution metadata per event including model version (`yolov8n-1.0.0`), applied confidence threshold, inference latency in ms, preprocessing contrast scores, and raw model output.
- **Configurable Detection Thresholds**: Added dynamic multi-tier threshold resolution (Species > Camera Type > Global) with REST endpoints (`GET /api/config/thresholds` and `PATCH /api/config/thresholds`).
  - Configuration: [thresholds.js](file:///Users/aditi/Desktop/mini%20proj/server/config/thresholds.js)
  - Automated tests: [thresholds.test.js](file:///Users/aditi/Desktop/mini%20proj/test/thresholds.test.js)

#### Exit Criteria
> **Achieved**: Uploaded camera-trap images produce genuine model-backed detections with traceable metadata and configurable sensitivity per camera and species.

---

### Phase 2: Identity and Review Workflow
**Status:** Next Up ⏳

#### Objectives & Scope
- **Trained ReID Embedding Model**:
  - Replace heuristic hash embeddings with a specialized Siamese / Triplet loss re-identification neural network (e.g. MegaDetector / Wildlife ReID).
  - Implement vector similarity search (cosine distance / Euclidean L2) to match individual animal coat patterns, stripes, and markings.
- **Reviewer Workflow & Reconciliation**:
  - Enable field reviewers to confirm or correct predicted species and individual IDs.
  - Provide UI tooling to merge duplicate animal profiles and add observational notes.
  - Feed reviewer-confirmed corrections back into a curated dataset for continuous model fine-tuning.
- **Animal Profile Hub**:
  - View individual animal profiles with complete sighting timelines, confidence score trajectories, GPS capture locations, and last-seen statuses.

#### Exit Criteria
> A reviewer can inspect uncertain detections and transform them into trustworthy, verifiable identity records.

---

### Phase 3: Alerting and Operational Dashboard
**Status:** Planned ⏳

#### Objectives & Scope
- **Camera Trap Registry & Health**:
  - Manage camera metadata: GPS coordinates, deployment zone, battery level, operational status, and ingestion history.
  - Interactive map visualization showing camera placement and threat hot spots.
- **Actionable Alert Engine**:
  - Trigger high-priority alerts on poaching risk (simultaneous human/vehicle + wildlife presence).
  - Detect repeat perimeter intrusions and sightings of critically endangered / red-list species.
- **Incident Management & Audit Trails**:
  - Triage queue for field rangers: alert acknowledgement, assignment, severity escalation, and resolution logs.
  - Multi-dimensional filtering by camera site, time range, species, threat level, and review state.

#### Exit Criteria
> Field teams receive prioritized, actionable incident queues rather than manually sifting through thousands of raw images.

---

### Phase 4: Data Quality and Model Evaluation
**Status:** Planned ⏳

#### Objectives & Scope
- **Curated Benchmark Evaluation Dataset**:
  - Establish a golden validation set capturing diverse environmental challenges: daylight glare, nighttime infrared flash, heavy foliage occlusion, inclement weather, and species variation.
- **Performance & Reliability Metrics**:
  - Systematically track Precision, Recall, F1 score, False-Alert Rate, ReID top-1 and top-5 accuracy, and human-inter-reviewer agreement.
- **Model Lifecycle & Governance**:
  - Safe rollout controls: shadow evaluation against live traffic, A/B canary testing, and instant rollback mechanism.
  - Privacy policy controls: redaction/blurring for human faces and vehicle license plates, data retention boundaries, and role-based access.

#### Exit Criteria
> Model quality and reliability are rigorously measured, benchmarked, and vetted for real-world field deployment.

---

### Phase 5: Pilot Deployment
**Status:** Planned ⏳

#### Objectives & Scope
- **Production Infrastructure**:
  - Primary persistence on MongoDB Atlas / production replica set; image assets stored in cloud object storage (S3 / GCS) with CDN delivery.
  - Security hardening: JWT/session authentication, role-based access control (Admin, Biologist, Ranger), encrypted uploads, automated backups, and structured audit logs.
- **Scalable Asynchronous Processing**:
  - Containerized API and Python inference workers (Docker / Kubernetes).
  - Background task queue (Redis / BullMQ / Celery) ensuring bulk camera-trap SD card ingestions do not block the web server.
- **Live Field Pilot & Iteration**:
  - Deploy to an initial camera-site test location, gather operational feedback from rangers and biologists, and tune site-specific detection thresholds.

#### Exit Criteria
> A monitored, highly available pilot deployment operating with real field staff and generating tangible validation for widespread reserve rollout.
