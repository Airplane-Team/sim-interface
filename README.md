# Sim Interface

Contains information and examples on connecting any sim to Shirley.

## Background

Shirley connects to a sim via WebSocket to receive `SimData` and send `SetSimData` messages.

## ForeFlight Bridge

See [foreflight-type/README.md](foreflight-type/README.md) for more information.

## Example Supported Sims

From [ForeFlight Documentation](https://support.foreflight.com/hc/en-us/articles/204114965):

- AeroFly FS 4
- X-Plane 11 (Shirley natively supports X-Plane 12)
- Microsoft Flight Simulator 2020 & 2024
- Infinite Flight

## Schemas Available Upon Request

A schema is available in the `schemas` directory. It is up-to-date as of the Shirley version in the [Changelog](CHANGELOG.md). Shirley version numbers are listed at [https://airplane.team/changelog](https://airplane.team/changelog).

- `SimData` is sent from the sim to Shirley (e.g. position and attitude). Any fields that are present are used by Shirley. So, it is very easy to gradually add more support for Shirley by sending additional fields. No specific support is required on Shirley's end.
- `SetSimData` is sent from Shirley to the sim: it requires prior knowledge of the sim's supported settable data.

These schemas are subject to change as Shirley evolves.

Please [contact us on Discord](https://airplane.team/discord) for the latest schemas for `SimData` and `SetSimData`, and for support in connecting your sim to Shirley!
