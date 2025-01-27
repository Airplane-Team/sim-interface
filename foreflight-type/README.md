# ForeFlight to Shirley Bridge

## Overview

This script **bridges [ForeFlight simulator data](https://support.foreflight.com/hc/en-us/articles/204115005)**
(XGPS / XATT) into a **WebSocket server** that Shirley can connect to.

### Key Features

- **UDP Listener** on port 49002: Receives ForeFlight data from a flight simulator.
- **WebSocket Server** on `ws://0.0.0.0:2992/api/v1`: Broadcasts the latest data to all connected clients at about 4 Hz.
- **Shared `SimData`** object that holds references to the most recent `XGPSData` and `XATTData`.

---

## Installation

### 1. Python Version

This script is designed to run on **Python 3.8+** (tested with 3.9+). Check your Python version with:

```bash
python --version
```

### 2. Dependencies

- The `websockets` package is **not included** in the Python standard library. Install it with:

```bash
pip install websockets
```

- (Optional) Ensure your Python installation includes `asyncio` (available by default in Python 3.8+).

## Usage

### 1. Run the Script

```bash
python foreflight-bridge.py
```

### 2. Configure Your Simulator

Configure your flight simulator (or data source) to send ForeFlight-compatible XGPS and XATT messages via **UDP** to **port 49002** on the machine running this script.

- Make sure the IP address matches the machine running the bridge.
- Make sure the port matches the UDP port in the script (default: 49002).

Example UDP messages:

- `XGPSMySim,-80.11,34.55,1200.1,359.05,55.6`
- `XATTMySim,180.2,0.1,0.2`

### 3. Connect Shirley

Adding `?aerofly` or `?generic` to the end of any Shirley URL will enable 3rd party sim mode.

Example: `https://airplane.team/fly?aerofly` (or the equivalent for private beta users). Instead of 'X-Plane Websocket disconnected', you should see 'Sim Websocket disconnected'.

**Once the bridge is running, press 'Connect to Sim'.**

#### Technical Details

- Point Shirley to **`ws://[HOST_IP]:2992/api/v1`**.
- The script will broadcast JSON data in the following format:
  ```jsonc
  {
  "position": {
    "latitudeDeg": ..., # Latitude in degrees
    "longitudeDeg": ..., # Longitude in degrees
    "mslAltitudeFt": ..., # Altitude above mean sea level in feet
    "gpsGroundSpeedKts": ..., # Groundspeed in knots
  },
  "attitude": {
    "rollAngleDegRight": ..., # Roll angle, positive = right wing down
    "pitchAngleDegUp": ..., # Pitch angle, positive = nose up
    "trueHeadingDeg": ... # True heading in degrees
    }
  }
  ```
- Data updates ~4 times per second.

### 4. Verify Logs in the Bridge CLI

- The console will show when it receives UDP messages (`[ForeFlightUDPServer]` ...).
- You’ll see logs for WebSocket connections (`[ShirleyWebSocketServer]` ...).

---

## Modifications and Extensions

### Change Ports

- Edit the default ports and WebSocket path in the `ForeFlightToShirleyBridge` class:
  - `udp_port=49002` - UDP port for ForeFlight data
  - `ws_port=2992` - WebSocket port for Shirley
  - `ws_path="/api/v1"` - WebSocket path for Shirley

### Add XTRAFFIC Support

- Extend the `ForeFlightParser` class to parse XTRAFFIC messages into a new `XTRAFFICData` dataclass.
- Update the `SimData` object to hold references to XTRAFFIC data and include it in `get_data_snapshot()`.

### Extend Data Fields

- If your simulator can supply additional fields (e.g., AGL altitude, indicated airspeed), add them to XGPS/XATT messages and transform them in `SimData`.
- It's possible to compute vertical speed from altitude changes over time.
- You might be able to implement AGL altitude by subtracting terrain elevation, or starting the bridge while on the ground.

---

## Example JSON Output

```json
{
  "position": {
    "latitudeDeg": 34.55,
    "longitudeDeg": -80.11,
    "mslAltitudeFt": 3937.0,
    "gpsGroundSpeedKts": 108.0
  },
  "attitude": {
    "rollAngleDegRight": 0.2,
    "pitchAngleDegUp": 0.1,
    "trueHeadingDeg": 180.2
  }
}
```

**Enjoy using the ForeFlight Protocol to Shirley bridge!**
