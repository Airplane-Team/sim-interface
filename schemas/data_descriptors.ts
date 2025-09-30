import { DataDescriptor, ValueType, Visibility, Writability } from "./data_descriptor.js";

const PositionSimData = {
  latitudeDeg: {
    type: ValueType.Number,
    writableByPlatform: { xplane12: Writability.System },
    precision: 4,
    range: [-90, 90],
  },
  longitudeDeg: {
    type: ValueType.Number,
    writableByPlatform: { xplane12: Writability.System },
    precision: 4,
    range: [-180, 180],
  },
  aglAltitudeFt: {
    type: ValueType.Number,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  mslAltitudeFt: {
    type: ValueType.Number,
    writableByPlatform: { xplane12: Writability.System },
  },
  indicatedAirspeedKts: {
    type: ValueType.Number,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  gpsGroundSpeedKts: {
    type: ValueType.Number,
  },
  verticalSpeedUpFpm: {
    type: ValueType.Number,
  },
} as const;

const AttitudeSimData = {
  rollAngleDegRight: {
    type: ValueType.Number,
    range: [-180, 180],
  },
  pitchAngleDegUp: {
    type: ValueType.Number,
    writableByPlatform: { xplane12: Writability.System },
    range: [-90, 90],
  },
  magneticHeadingDeg: {
    type: ValueType.Number,
    range: [0, 360],
  },
  trueHeadingDeg: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    writableByPlatform: { xplane12: Writability.System },
    range: [0, 360],
  },
  trueGroundTrackDeg: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    range: [0, 360],
  },
} as const;

const LightSwitchesSimData = {
  landingLightsSwitchOn: {
    type: ValueType.Boolean,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  taxiLightsSwitchOn: {
    type: ValueType.Boolean,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  navigationLightsSwitchOn: {
    type: ValueType.Boolean,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  strobeLightsSwitchOn: {
    type: ValueType.Boolean,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
} as const;

const IndicatorsSimData = {
  engineRpm: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  rotorRpm: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  propellerRpm: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  engineN1Percent: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  manifoldPressureInchesMercury: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  engineTorqueFtLb: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  turbineGasTemperatureDegC: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  engineIttDegC: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  exhaustGasDegC: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
  },
  lowRotorRPMWarningOn: {
    type: ValueType.Boolean,
    visibility: Visibility.Never,
    description: "true if rotor RPM too low, false otherwise",
  },
  totalEnergyVariometerFpm: {
    type: ValueType.Number,
    visibility: Visibility.Never,
    description: "estimate rate energy change in feet per minute",
  },
  stallWarningOn: {
    type: ValueType.Boolean,
    visibility: Visibility.Always,
    description: "true if stall warning is active",
  },
  altimeterSettingInchesMercury: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    description: "pilot side",
    precision: 2,
    range: [24, 35],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  slipSkidBallRightDeflectionPercent: {
    type: ValueType.Number,
    visibility: Visibility.Always,
    description: "-100 is full left",
    range: [-200, 200], // ±200% to account for over-deflection
  },
  yawStringRightSideslipDeg: {
    type: ValueType.Number,
    visibility: Visibility.Never,
    description: "negative for left",
    range: [-180, 180],
  },
} as const;

const LeversSimData = {
  flapsHandlePercentDown: {
    type: ValueType.Number,
    description: "100 full down deployed",
    range: [-100, 100],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  speedBrakesHandlePercentDeployed: {
    type: ValueType.Number,
    visibility: Visibility.Never,
    range: [-100, 100],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  landingGearHandlePercentDown: {
    type: ValueType.Number,
    range: [0, 100],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  throttlePercentOpen: {
    type: ValueType.NumberMap,
    // there are some planes with "overthrottle" capability
    range: [-200, 200],
  },
  collectivePercentUp: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
    range: [0, 100],
  },
  conditionLeverPercentHigh: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
    description: "0 low idle/feather/cutoff, 100 high idle/full",
    range: [0, 100],
  },
  mixtureLeverPercentRich: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
    range: [0, 100],
  },
  carburetorHeatLeverPercentHot: {
    type: ValueType.NumberMap,
    visibility: Visibility.Never,
    range: [0, 100],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  propellerLeverPercentCoarse: {
    visibility: Visibility.Never,
    type: ValueType.NumberMap,
    range: [0, 100],
  },
  propBetaEnabled: {
    type: ValueType.Boolean,
    visibility: Visibility.ToolAndAlwaysWhenTrue,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
} as const;

/** All `mapKeys` for supported radios. */
export const AllComMapKeys = ["com1", "com2", "nav1", "nav2"] as const;

const RadiosNavSimData = {
  frequencyHz: {
    type: ValueType.NumberMap,
    range: [108000, 136975],
    mapKeys: AllComMapKeys,
  },
  standbyFrequencyHz: {
    type: ValueType.NumberMap,
    writableByPlatform: { xplane12: Writability.AfterRead },
    range: [108000, 136975],
    mapKeys: AllComMapKeys,
  },
  comShouldSwapFrequencies: {
    type: ValueType.BooleanMap,
    visibility: Visibility.Never,
    description: "simultaneous with standbyFrequencyHz to change active",
    writableByPlatform: { xplane12: Writability.Always },
    mapKeys: AllComMapKeys,
  },
  transponderCode: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
} as const;

/** Contains all supported modes that the autopilot can use to control the aircraft's altitude. */
export const AutopilotAltitudeModes = [
  "disabled",
  "pitch",
  "verticalSpeed",
  "levelChange",
  "altitudeHold",
  "terrain",
  "glideSlope",
  "VNAV",
  "TOGA",
  "flightPathAngle",
  "VNAVSpeed",
] as const;

const AutoPilotSimData = {
  isAutopilotEngaged: {
    type: ValueType.Boolean,
    visibility: Visibility.Always,
    description: "don't forget isHeadingSelectEnabled and targetVerticalSpeedUpFpm",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  isFlightDirectorEngaged: {
    type: ValueType.Boolean,
    visibility: Visibility.ToolAndAlwaysWhenTrue,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  isHeadingSelectEnabled: {
    type: ValueType.Boolean,
    visibility: Visibility.ToolAndAlwaysWhenTrue,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  altitudeMode: {
    type: ValueType.String,
    visibility: Visibility.Tool,
    description:
      "allows setting altitudeHold and verticalSpeed modes only - also engages autopilot",
    enumValues: AutopilotAltitudeModes,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  targetVerticalSpeedUpFpm: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    description: "also enables verticalSpeed mode - don't forget altitudeBugFt",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  shouldLevelWings: {
    type: ValueType.Boolean,
    visibility: Visibility.Never,
    description: "also engages autopilot",
    writableByPlatform: { xplane12: Writability.Always },
  },
  magneticHeadingBugDeg: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    range: [0, 360],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  altitudeBugFt: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    range: [0, 70000],
    description: "level-off altitude when in verticalSpeed mode",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
} as const;

const SystemsSimData = {
  batteryOn: {
    type: ValueType.BooleanMap,
    visibility: Visibility.Tool,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  pitotHeatSwitchOn: {
    type: ValueType.Boolean,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  parkingBrakeOn: {
    type: ValueType.Boolean,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  governorSwitchOn: {
    type: ValueType.BooleanMap,
    visibility: Visibility.Never,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  totalEnergyAudioSwitchOn: {
    type: ValueType.Boolean,
    visibility: Visibility.Never,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  propHeatSwitchOn: {
    type: ValueType.Boolean,
    visibility: Visibility.Never,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
} as const;

/** Keys supported for failures - engines start with 0 for farthest left */
export const AllFailureMapKeys = [
  "LeftEngineSeize",
  "RightEngineSeize",
  "EngineSeize",
  "AliaPusherSeize",
  "PitotBlockage",
  "StaticBlockage",
  "Gps1Failure",
  "Bus1Failure",
  "Battery1Failure",
  "Generator1Failure",
  "Navigation1Failure",
  "Navigation2Failure",
] as const;

/** Type for supported failure keys.
 * @see AllFailureMapKeys
 */
export type FailureMapKey = (typeof AllFailureMapKeys)[number];

const FailuresSimData = {
  scheduledAtAltitudeFtAgl: {
    type: ValueType.NumberMap,
    visibility: Visibility.Always,
    description: "fails at next cross then clears - setting 0 clears",
    writableByPlatform: { xplane12: Writability.Always },
    mapKeys: AllFailureMapKeys,
  },
  scheduledAtAirspeedKias: {
    type: ValueType.NumberMap,
    visibility: Visibility.Always,
    description: "fails at next cross then clears - setting 0 clears",
    writableByPlatform: { xplane12: Writability.Always },
    mapKeys: AllFailureMapKeys,
  },
  isFailed: {
    type: ValueType.BooleanMap,
    visibility: Visibility.Always,
    writableByPlatform: { xplane12: Writability.Always },
    mapKeys: AllFailureMapKeys,
  },
};

/** All cloud layer keys that shirley can see & use. */
export const AllCloudLayerKeys = ["1", "2", "3"] as const;
/** All wind layer keys that shirley can see & use. */
export const AllWindLayerKeys = ["1", "2", "3"] as const;

/** All supported cloud types. */
export const AllCloudTypes = ["cirrus", "stratus", "cumulus", "cumulonimbus"] as const;
/** All supported runway conditions. */
export const RunwayConditions = [
  "dry",
  "lightlyWet",
  "wet",
  "veryWet",
  "lightlyPuddly",
  "puddly",
  "veryPuddly",
  "lightlySnowy",
  "snowy",
  "verySnowy",
  "lightlyIcy",
  "icy",
  "veryIcy",
  "lightlySnowyAndIcy",
  "snowyAndIcy",
  "verySnowyAndIcy",
] as const;

/** All supported weather evolutions. */
export const WeatherEvolutions = [
  "improvingRapidly",
  "improving",
  "improvingSlowly",
  "static",
  "deterioratingSlowly",
  "deteriorating",
  "deterioratingRapidly",
  "realWorldWeather",
] as const;

const EnvironmentSimData = {
  aircraftWindHeadingDeg: {
    type: ValueType.Number,
    visibility: Visibility.State, // for charting
    description: "wind heading at aircraft",
    range: [0, 360],
    writableByPlatform: { xplane12: Writability.Never },
  },
  aircraftWindSpeedKts: {
    type: ValueType.Number,
    visibility: Visibility.State, // for charting
    description: "wind speed at aircraft",
    writableByPlatform: { xplane12: Writability.Never },
  },
  zuluTimeHours: {
    type: ValueType.Number,
    description: "hours UTC",
    precision: 2,
    range: [0, 24],
    writableByPlatform: { xplane12: Writability.Always },
  },
  dayOfYear: {
    type: ValueType.Number,
    description: "0-364",
    range: [0, 365],
    visibility: Visibility.Tool,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  cloudLayerEnabled: {
    type: ValueType.BooleanMap,
    visibility: Visibility.Tool,
    mapKeys: AllCloudLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  cloudLayerBasesAltitudeFtMsl: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "don't forget tops",
    mapKeys: AllCloudLayerKeys,
    range: [0, 70000],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  cloudLayerTopsAltitudeFtMsl: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "don't forget bases",
    range: [0, 70000],
    mapKeys: AllCloudLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  cloudLayerCoveragePercent: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "100 for overcast",
    range: [0, 100],
    mapKeys: AllCloudLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  cloudLayerType: {
    type: ValueType.StringMap,
    visibility: Visibility.Tool,
    enumValues: AllCloudTypes,
    mapKeys: AllCloudLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  windLayerEnabled: {
    type: ValueType.BooleanMap,
    visibility: Visibility.Tool,
    mapKeys: AllWindLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  windLayerAltitudeFt: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "enable wind layer first",
    range: [0, 70000],
    mapKeys: AllWindLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  windLayerDirectionDeg: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "0 enable wind layer first",
    range: [0, 360],
    mapKeys: AllWindLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  windLayerSpeedKts: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "enable wind layer first",
    mapKeys: AllWindLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  windLayerTurbulencePercent: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "calm to extreme, enable wind layer first",
    range: [0, 100],
    mapKeys: AllWindLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  windLayerGustIncreaseKts: {
    type: ValueType.NumberMap,
    visibility: Visibility.Tool,
    description: "enable wind layer first",
    mapKeys: AllWindLayerKeys,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  visibilityMiles: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    description: "in region; statute miles",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  seaLevelPressureInchesMercury: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    description: "in region",
    precision: 2,
    range: [24, 35],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  runwayFriction: {
    type: ValueType.String,
    visibility: Visibility.Tool,
    enumValues: RunwayConditions,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  rainPercent: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    description: "rain requires clouds",
    range: [0, 100],
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  groundTemperatureDegC: {
    type: ValueType.Number,
    visibility: Visibility.Always,
    description: "in region",
    precision: 1,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  thermalClimbRateFpm: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    precision: 1,
    description: "ft/min where thermals present",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  weatherEvolution: {
    type: ValueType.String,
    visibility: Visibility.Tool,
    description: "static best for custom weather",
    enumValues: WeatherEvolutions,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  shouldUseCurrentWeather: {
    type: ValueType.Boolean,
    visibility: Visibility.Tool,
    description: "true to use current date, time and weather conditions",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  shouldRegenerateWeather: {
    type: ValueType.Boolean,
    visibility: Visibility.Never,
    description: "applies weather changes immediately",
    writableByPlatform: { xplane12: Writability.Always },
  },
} as const;

const SimulationSimData = {
  aircraftName: {
    type: ValueType.String,
    visibility: Visibility.Tool,
    description: "sim name of the aircraft being flown",
  },
  isPaused: {
    type: ValueType.Boolean,
    visibility: Visibility.ToolAndAlwaysWhenTrue,
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  simSpeedRatio: {
    type: ValueType.Number,
    visibility: Visibility.Tool,
    description: "setting toggles between 1x 2x 4x; pause/unpause for 1x",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  isCrashed: {
    type: ValueType.Boolean,
    visibility: Visibility.ToolAndAlwaysWhenTrue,
    description: "can be used to uncrash",
    writableByPlatform: { xplane12: Writability.AfterRead },
  },
  shouldResetFlight: {
    type: ValueType.Boolean,
    visibility: Visibility.Never,
    writableByPlatform: { xplane12: Writability.System },
  },
} as const;

const FreezesSimData = {
  positionFreezeEnabled: {
    type: ValueType.Boolean,
    visibility: Visibility.ToolAndAlwaysWhenTrue,
    writableByPlatform: { xplane12: Writability.Always },
  },
} as const;

/** All Shirley data descriptors.
 *  Typed as map from category to an arbitrary DataDescriptor. */
export const SimDataDescriptors = {
  position: PositionSimData as Record<keyof typeof PositionSimData, DataDescriptor>,
  attitude: AttitudeSimData as Record<keyof typeof AttitudeSimData, DataDescriptor>,
  radiosNavigation: RadiosNavSimData as Record<keyof typeof RadiosNavSimData, DataDescriptor>,
  lights: LightSwitchesSimData as Record<keyof typeof LightSwitchesSimData, DataDescriptor>,
  indicators: IndicatorsSimData as Record<keyof typeof IndicatorsSimData, DataDescriptor>,
  levers: LeversSimData as Record<keyof typeof LeversSimData, DataDescriptor>,
  autopilot: AutoPilotSimData as Record<keyof typeof AutoPilotSimData, DataDescriptor>,
  systems: SystemsSimData as Record<keyof typeof SystemsSimData, DataDescriptor>,
  failures: FailuresSimData as Record<keyof typeof FailuresSimData, DataDescriptor>,
  environment: EnvironmentSimData as Record<keyof typeof EnvironmentSimData, DataDescriptor>,
  simulation: SimulationSimData as Record<keyof typeof SimulationSimData, DataDescriptor>,
  freezes: FreezesSimData as Record<keyof typeof FreezesSimData, DataDescriptor>,
} as const;
