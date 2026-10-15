# NEXRAD.AI Platform Architecture

## Product boundary

NEXRAD.AI is currently a React/Vite prototype for clinical decision support. The visible studies, model metrics, equipment health values, and facility counters are synthetic demonstration data unless a surface explicitly says otherwise.

The platform must use this language in production:

- **AI-assisted finding requiring clinical review**
- **Not yet validated** when a metric has no approved validation source
- **Not connected** when a PACS, DICOMweb, FHIR, model-serving, or device telemetry adapter is unavailable
- **Simulated data** for synthetic fixtures and demos

NEXRAD.AI does not diagnose patients and does not replace qualified clinical judgment.

## System layers

```text
React clinical workspace
        |
Secure backend API / identity / audit boundary
        |
DICOMweb + PACS | FHIR/HL7 | model serving | device telemetry
        |
PostgreSQL + object storage + queue/cache
```

The frontend should never hold credentials or call provider APIs directly. Browser actions should call an authenticated backend that performs authorization, input validation, de-identification, malware scanning, audit logging, and rate limiting.

## Adapter contracts

`src/platform/contracts.js` provides explicit disconnected adapters for:

- DICOM/PACS and DICOMweb
- AI inference
- equipment telemetry
- oxygen plant telemetry
- FHIR/HL7 reporting

Each adapter must be replaced by a backend-backed implementation before live data is shown. Adapter failures should be surfaced as professional errors and must not be converted into fabricated readings.

## AI workflow

The intended processing pipeline is:

1. Upload and validate file type
2. De-identify and audit access
3. Preprocess and perform image quality control
4. Select a versioned model
5. Run inference and calibrate confidence
6. Localize and segment findings
7. Generate explainability outputs
8. Require clinician review
9. Produce an AI-assisted structured report
10. Persist the study, review, model version, and audit event

Confidence must remain separate from calibration, uncertainty, image quality, and out-of-distribution risk. Explainability highlights model-associated regions; it is not proof of diagnosis.

## Biomedical engineering workflow

Device adapters should normalize sensor observations into a common event shape:

```text
assetId, observedAt, source, metric, value, unit, quality, provenance
```

Predictive maintenance models must report their training/validation status, data freshness, uncertainty, and whether the result is simulated. The current Biomedical Operations view is a registry and workflow prototype; it is not live equipment monitoring.

## Next production increments

- Add a FastAPI gateway with OAuth2/JWT, RBAC, audit events, and secure upload handling.
- Connect Orthanc or another DICOMweb endpoint through the gateway.
- Add versioned model manifests and validation artifacts to the model registry.
- Implement synthetic test fixtures without patient identifiers.
- Add device and oxygen telemetry ingestion with signed source identity and alarm escalation.
- Add automated unit, API, accessibility, and end-to-end tests in CI.
