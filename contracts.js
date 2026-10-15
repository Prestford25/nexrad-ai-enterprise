/**
 * Integration contracts for NEXRAD.AI platform adapters.
 * These adapters are intentionally disconnected until a secure backend is configured.
 */

export const INTEGRATION_STATUS = Object.freeze({
  NOT_CONNECTED: "NOT CONNECTED",
  SIMULATED: "SIMULATED DATA",
  CONNECTED: "CONNECTED",
});

export class IntegrationNotConnectedError extends Error {
  constructor(adapterName) {
    super(`${adapterName} adapter is not connected. Configure the secure backend integration first.`);
    this.name = "IntegrationNotConnectedError";
    this.adapterName = adapterName;
  }
}

const unavailable = adapterName => ({
  status: INTEGRATION_STATUS.NOT_CONNECTED,
  connect: async () => {
    throw new IntegrationNotConnectedError(adapterName);
  },
});

export const PLATFORM_ADAPTERS = Object.freeze({
  dicom: unavailable("DICOM/PACS"),
  inference: unavailable("AI inference"),
  equipmentTelemetry: unavailable("equipment telemetry"),
  oxygenTelemetry: unavailable("oxygen plant telemetry"),
  fhir: unavailable("FHIR/HL7"),
});
