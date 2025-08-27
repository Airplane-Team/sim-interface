# Sim Interface Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Version numbers are assigned in Github Releases using `worker`'s version number from the [Shirley Changelog](https://airplane.team/changelog).

## [v2.13.0] - 2025-08-13

### Added

- Added `SetSimData` for Shirley `v2.13.0` via `schemas/set_simdata_schemas_xplane.ts`. These are the only `SetSimData` messages that are supported by Shirley. Currently these are X-Plane 12-specific (see [README.md](README.md)).

## [v2.12.0] - 2025-07-17

### Added

- Added `SimData` for Shirley `v2.12.0`:
  - `verticalSpeedUpFpm` is now used instead of `verticalSpeedFpm`.
  - `slipSkidBallRightDeflectionPercent` and `yawStringRightSideslipDeg` now exist.
  - `flapsHandlePercentDown` and `speedBrakesHandlePercentDeployed` now allow for negative percent values.
  - New fields `isFlightDirectorEngaged`, `targetVerticalSpeedFpm`.

### Changed

- Unified `SimData` schemas in `schemas/` to always be the most recent. This changelog will be updated with the most recent version of the schema.
