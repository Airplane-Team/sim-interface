# X-Plane 12 Plugin for Shirley: Points of Interest System

**Author:** Jugac64 (with Claude)
**Date:** 2026-03-05
**Status:** Proposal for Alex / Airplane Team review

---

## 1. Overview

Build an **X-Plane 12 plugin** that maintains a database of Points of Interest (POIs) and communicates proximity information to Shirley through **custom datarefs**. When the aircraft flies near a POI, the plugin writes relevant data into custom datarefs that Shirley reads via the existing `CustomSimData` system.

### Goal

> "I could have a point of interests database app, that reads the aircraft sim location, and when it is close to a point of interest, I inject something in the custom field, to make aware of this to Shirley, so it can say something."

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      X-Plane 12                         │
│                                                         │
│  ┌─────────────────┐    reads     ┌──────────────────┐  │
│  │ sim/flightmodel/ │◄────────────│                  │  │
│  │ position/lat,lon │             │  POI Plugin      │  │
│  └─────────────────┘             │  (XPPython3)     │  │
│                                   │                  │  │
│  ┌─────────────────┐    writes    │  - POI database  │  │
│  │ Custom Datarefs  │◄────────────│  - Haversine     │  │
│  │ jugac64/poi/*    │             │  - Flight loop   │  │
│  └────────┬────────┘             └──────────────────┘  │
│           │                                             │
└───────────┼─────────────────────────────────────────────┘
            │ Shirley reads custom datarefs
            ▼
┌─────────────────────────────────────────────────────────┐
│                    Shirley (Web)                         │
│                                                         │
│  Aircraft Profile maps custom datarefs:                 │
│    customSwitch1 → jugac64/poi/is_nearby                │
│    customIndicator1 → jugac64/poi/distance_nm           │
│    customControl1 → jugac64/poi/bearing_deg             │
│                                                         │
│  Shirley sees POI proximity → announces to student      │
└─────────────────────────────────────────────────────────┘
```

---

## 2. How It Integrates with Shirley's CustomSimData

Based on the `CustomSimData` system Alex shared, the plugin would use these slots:

| Shirley Custom Slot | Plugin Dataref | Purpose |
|---|---|---|
| `customSwitch1` (Boolean) | `jugac64/poi/is_nearby` | `true` when aircraft is within detection radius |
| `customIndicator1` (Number) | `jugac64/poi/distance_nm` | Distance to nearest POI in nautical miles |
| `customControl1` (Number) | `jugac64/poi/bearing_deg` | Bearing to nearest POI (0-360) |
| `customButton1` (Boolean) | `jugac64/poi/new_poi_entered` | Momentary pulse when entering a NEW poi zone |

### Aircraft Profile Configuration (Shirley side)

This is what the aircraft profile would look like to "activate" these custom slots:

```typescript
xplane: {
  custom: {
    // Latching flag: true while near any POI
    customSwitch1: {
      dataref: 'jugac64/poi/is_nearby',
      descriptor: {
        visibility: Visibility.Always,
        writableByPlatform: { xplane12: Writability.Never },
        description: 'Aircraft is near a point of interest',
      },
    },
    // Distance gauge: NM to closest POI
    customIndicator1: {
      dataref: 'jugac64/poi/distance_nm',
      ratio: 1,
      descriptor: {
        visibility: Visibility.Always,
        writableByPlatform: { xplane12: Writability.Never },
        description: 'Distance to nearest POI in nautical miles',
        range: [0, 999],
      },
    },
    // Bearing to nearest POI
    customControl1: {
      dataref: 'jugac64/poi/bearing_deg',
      descriptor: {
        visibility: Visibility.Tool,
        writableByPlatform: { xplane12: Writability.Never },
        description: 'Bearing to nearest POI 0-360 degrees',
        range: [0, 360],
      },
    },
    // Momentary trigger on entering a new POI zone
    customButton1: {
      dataref: 'jugac64/poi/new_poi_entered',
      descriptor: {
        visibility: Visibility.ToolAndAlwaysWhenTrue,
        writableByPlatform: { xplane12: Writability.Never },
        description: 'Momentary: just entered a new POI zone',
      },
    },
  },
}
```

> **Question for Alex:** Is this the correct way to reference custom datarefs from an aircraft profile? Does Shirley need any additional configuration to "discover" the POI name/description text, or would that need a `customString` slot type that doesn't exist yet?

---

## 3. Plugin Technical Design

### 3.1 Technology Choice: XPPython3

| Consideration | Decision |
|---|---|
| **Language** | Python 3 via XPPython3 |
| **Why** | Fast to develop, easy JSON/CSV parsing, good math libraries, active community |
| **Dependency** | XPPython3 must be installed in X-Plane 12 |
| **Performance** | Flight loop at 1 Hz is more than sufficient for POI detection |

### 3.2 File Structure

```
X-Plane 12/
└── Resources/
    └── plugins/
        └── XPPython3/
            └── PythonPlugins/
                └── PI_ShirleyPOI.py          # Main plugin file
                └── shirley_poi/
                    ├── __init__.py
                    ├── poi_database.py        # POI loading and spatial lookup
                    ├── haversine.py           # Distance/bearing calculations
                    └── data/
                        └── poi_default.json   # Default POI database
```

### 3.3 Plugin Lifecycle

```python
# PI_ShirleyPOI.py — Simplified structure

class PythonInterface:
    def __init__(self):
        self.poi_db = None
        self.flight_loop_id = None

        # Dataref accessors we create
        self.dr_is_nearby = None
        self.dr_distance_nm = None
        self.dr_bearing_deg = None
        self.dr_new_poi_entered = None

        # State
        self.current_nearby_poi = None
        self.is_nearby_value = 0
        self.distance_nm_value = 0.0
        self.bearing_deg_value = 0.0
        self.new_poi_entered_value = 0

    def XPluginStart(self):
        # Register the plugin with X-Plane
        return ('Shirley POI', 'jugac64.shirley.poi', 'Points of Interest for Shirley')

    def XPluginEnable(self):
        # 1. Load POI database from JSON
        # 2. Register custom datarefs via xp.registerDataAccessor()
        # 3. Create flight loop callback at 1 Hz
        # 4. Find sim position datarefs (lat, lon, alt)
        return 1

    def XPluginDisable(self):
        # 1. Destroy flight loop
        # 2. Unregister custom datarefs
        pass

    def XPluginStop(self):
        pass

    def flight_loop_callback(self, sinceLastCall, sinceLastFlightLoop, counter, refCon):
        # 1. Read aircraft lat/lon from sim datarefs
        # 2. Find nearest POI using haversine
        # 3. Update custom dataref values
        # 4. Handle "new POI entered" momentary pulse
        return 1.0  # Call again in 1 second
```

### 3.4 Custom Dataref Registration

```python
def register_datarefs(self):
    # Boolean: is aircraft near a POI?
    self.dr_is_nearby = xp.registerDataAccessor(
        'jugac64/poi/is_nearby',
        readInt=self.get_is_nearby,     # returns 0 or 1
        writeInt=None,                   # read-only
    )

    # Float: distance to nearest POI in nautical miles
    self.dr_distance_nm = xp.registerDataAccessor(
        'jugac64/poi/distance_nm',
        readFloat=self.get_distance_nm,
        writeFloat=None,
    )

    # Float: bearing to nearest POI
    self.dr_bearing_deg = xp.registerDataAccessor(
        'jugac64/poi/bearing_deg',
        readFloat=self.get_bearing_deg,
        writeFloat=None,
    )

    # Boolean: momentary pulse when entering new POI zone
    self.dr_new_poi_entered = xp.registerDataAccessor(
        'jugac64/poi/new_poi_entered',
        readInt=self.get_new_poi_entered,
        writeInt=None,
    )
```

### 3.5 Haversine Distance Calculation

```python
import math

EARTH_RADIUS_NM = 3440.065  # Earth radius in nautical miles

def haversine_nm(lat1, lon1, lat2, lon2):
    """Returns distance in nautical miles between two lat/lon points."""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    return 2 * EARTH_RADIUS_NM * math.asin(math.sqrt(a))

def bearing_deg(lat1, lon1, lat2, lon2):
    """Returns initial bearing in degrees (0-360) from point 1 to point 2."""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    x = math.sin(dlon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    bearing = math.degrees(math.atan2(x, y))
    return (bearing + 360) % 360
```

### 3.6 Flight Loop Logic

```python
def flight_loop_callback(self, sinceLastCall, sinceLastFlightLoop, counter, refCon):
    # Read aircraft position
    lat = xp.getDatad(self.sim_lat_ref)   # sim/flightmodel/position/latitude
    lon = xp.getDatad(self.sim_lon_ref)   # sim/flightmodel/position/longitude

    # Find nearest POI
    nearest = None
    min_dist = float('inf')

    for poi in self.poi_db:
        dist = haversine_nm(lat, lon, poi['lat'], poi['lon'])
        if dist < min_dist:
            min_dist = dist
            nearest = poi

    # Update state
    self.distance_nm_value = round(min_dist, 1)
    self.bearing_deg_value = bearing_deg(lat, lon, nearest['lat'], nearest['lon'])

    detection_radius = nearest.get('radius_nm', 5.0)  # default 5 NM
    was_nearby = self.is_nearby_value
    self.is_nearby_value = 1 if min_dist <= detection_radius else 0

    # Momentary pulse: went from not-nearby to nearby for a NEW poi
    if self.is_nearby_value and not was_nearby:
        if nearest != self.current_nearby_poi:
            self.new_poi_entered_value = 1  # will be cleared next cycle
            self.current_nearby_poi = nearest
    else:
        self.new_poi_entered_value = 0

    return 1.0  # call again in 1 second
```

---

## 4. POI Database Format

Simple JSON file that users can edit:

```json
{
  "version": 1,
  "detection_radius_nm_default": 5.0,
  "pois": [
    {
      "id": "golden_gate",
      "name": "Golden Gate Bridge",
      "description": "Iconic suspension bridge in San Francisco Bay",
      "lat": 37.8199,
      "lon": -122.4783,
      "radius_nm": 3.0,
      "altitude_hint_ft": 500,
      "category": "landmark"
    },
    {
      "id": "ksfo",
      "name": "San Francisco International Airport",
      "description": "Major international airport, Class B airspace",
      "lat": 37.6213,
      "lon": -122.3790,
      "radius_nm": 5.0,
      "category": "airport"
    },
    {
      "id": "alcatraz",
      "name": "Alcatraz Island",
      "description": "Former federal prison in San Francisco Bay",
      "lat": 37.8267,
      "lon": -122.4230,
      "radius_nm": 1.5,
      "category": "landmark"
    }
  ]
}
```

### Future: Community POI Packs

Users could share and download regional POI packs:
- `poi_california.json`
- `poi_europe_landmarks.json`
- `poi_flight_training_maneuvers.json`

---

## 5. What Shirley Sees

When the aircraft enters a POI zone, Shirley would see state changes like:

```
customSwitch1: false → true      (is_nearby)
customIndicator1: 47.2 → 3.1    (distance getting closer)
customButton1: false → true      (just entered zone — momentary)
customControl1: 0 → 245          (bearing to POI)
```

Shirley could then react conversationally:
> "Hey, we're approaching the Golden Gate Bridge — about 3 miles out, off our left wing!"

---

## 6. Open Questions for Alex

These are things we'd need Alex's input on before building:

### 6.1 POI Name/Description Text

**Problem:** The current `CustomSimData` slots are Boolean and Number types only. There's no string-type custom slot to pass the **POI name** or **description** to Shirley.

**Options:**
1. **Add a `customString1` slot** to `CustomSimData` — this would let the plugin write the POI name directly to a dataref that Shirley can read.
2. **Use a convention-based approach** — encode POI IDs as numbers in `customIndicator1`, and have a lookup table in the aircraft profile.
3. **Shirley-side POI awareness** — Shirley maintains its own POI database and only uses the plugin for the "is_nearby" trigger + lat/lon matching.

> **Recommended: Option 1** — a `customString1` slot would be the cleanest approach and would make the system much more flexible for other use cases too.

### 6.2 How Does Shirley Discover Custom Datarefs?

- Does the aircraft profile need to be published/approved, or can users define custom profiles locally?
- Is there a way to test custom dataref mappings without a published profile?

### 6.3 Multiple Simultaneous POIs

- Should the plugin report only the **nearest** POI, or could it report multiple (e.g., closest 3)?
- This affects how many `CustomSimData` slots we'd need.

### 6.4 Triggering the "Wakeup"

Alex mentioned: _"we have a few custom datarefs right now... but as of today no way to trigger that wakeup"_

- What mechanism would trigger Shirley to notice and announce the POI change?
- Would `customButton1` (momentary) going `true` be enough to get Shirley's attention?
- Or does this need a new event system on Shirley's side?

---

## 7. Implementation Phases

### Phase 1 — Proof of Concept (Plugin Only)
- [ ] Basic XPPython3 plugin structure
- [ ] Register 4 custom datarefs
- [ ] Load POI database from JSON
- [ ] Haversine distance/bearing calculation
- [ ] Flight loop at 1 Hz reading position and updating datarefs
- [ ] Test with X-Plane's DataRef Editor to verify values

### Phase 2 — Shirley Integration
- [ ] Work with Alex to configure aircraft profile for custom datarefs
- [ ] Resolve the POI name/string question (§6.1)
- [ ] Resolve the "wakeup" trigger question (§6.4)
- [ ] Test end-to-end: plugin writes → Shirley reads → Shirley announces

### Phase 3 — Polish & Features
- [ ] In-sim menu to reload POI database without restarting
- [ ] Performance optimization for large POI sets (spatial indexing / grid bucketing)
- [ ] Support for altitude-based filtering (only trigger for POIs relevant to current altitude)
- [ ] POI category filtering (landmarks, airports, airspaces, training areas)
- [ ] User-configurable detection radius multiplier

### Phase 4 — Community & Expansion
- [ ] POI database editor (simple web tool or in-sim UI)
- [ ] Shareable POI packs
- [ ] Integration with real-world aviation databases (optional)
- [ ] Support for dynamic POIs (e.g., other multiplayer aircraft positions)

---

## 8. Performance Considerations

| Concern | Mitigation |
|---|---|
| Large POI database (1000+ entries) | Use grid-based spatial indexing: divide world into 1°×1° cells, only check POIs in nearby cells |
| Flight loop frequency | 1 Hz is more than sufficient — POI detection doesn't need 30 FPS |
| Memory usage | POI database loaded once at startup; typical JSON file < 1 MB |
| X-Plane main thread blocking | Haversine math is O(n) per frame with n=nearby POIs; negligible for <100 candidates after spatial filtering |

---

## 9. Dependencies & Requirements

- **X-Plane 12** (any version)
- **XPPython3** plugin installed (free, open source)
- **Shirley** v2.14+ (for `CustomSimData` support)
- **Python standard library only** — no pip packages needed (`math`, `json`, `os`)

---

## 10. Summary

The idea is absolutely feasible with today's tools. The X-Plane plugin side is straightforward — registering custom datarefs and computing distances is well-supported by XPPython3. The main unknowns are on Shirley's side:

1. **String data for POI names** — needs a `customString` slot or alternative
2. **The "wakeup" mechanism** — how Shirley notices and reacts to custom dataref changes
3. **Aircraft profile setup** — how to map custom datarefs in practice

Once Alex confirms the Shirley-side approach, the plugin itself could be prototyped quickly.

---

*This plan is for review by Alex (alist) and the Airplane Team. Feedback welcome on the [Discord](https://airplane.team/discord)!*
