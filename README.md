# Sim Interface

Contains information and examples on connecting any sim to Shirley.

## Background

Shirley connects to a sim via WebSocket to receive `SimData` and send `SetSimData` messages.

## ForeFlight Bridge

See [foreflight-type/README.md](foreflight-type/README.md) for more information.

## Schemas Available Upon Request

Please [contact us on Discord](https://airplane.team/discord) for the latest schemas for `SimData` and `SetSimData`.
These schemas are subject to change as Shirley evolves.

- `SimData` is sent from the sim to Shirley (e.g. position and attitude). Any fields that are present are used by Shirley. So, it is very easy to gradually add more support for Shirley by sending additional fields. No specific support is required on Shirley's end.
- `SetSimData` is sent from Shirley to the sim: it requires prior knowledge of the sim's supported settable data.
