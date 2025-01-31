#!/usr/bin/env python3

################################################################################
# ForeFlight Protocol to Shirley Bridge
# Usable with any simulator that can send ForeFlight-compatible UDP data.
# Reference: https://support.foreflight.com/hc/en-us/articles/204115005
# See README.md for more information.
################################################################################

import asyncio
import socket
import json
from dataclasses import dataclass
import time

################################################################################
# Constants & Utilities
################################################################################

METERS_TO_FEET = 3.28084
MPS_TO_KTS = 1.94384

################################################################################
# Data Classes for Parsed ForeFlight Messages
################################################################################

@dataclass
class XGPSData:
    """
    Represents ForeFlight XGPS data.
    e.g. XGPS<sim_name>,<longitude>,<latitude>,<altitude_msl_meters>,<track_true_north>,<groundspeed_m/s>
    """
    sim_name: str
    longitude: float
    latitude: float
    alt_msl_meters: float
    track_deg: float
    ground_speed_mps: float

@dataclass
class XATTData:
    """
    Represents ForeFlight XATT data.
    e.g. XATT<sim_name>,<true_heading>,<pitch_degrees>,<roll_degrees>
    """
    sim_name: str
    heading_deg: float
    pitch_deg: float
    roll_deg: float

@dataclass
class UnknownData:
    """
    Returned if we fail to parse or data type is not recognized.
    """
    raw_line: str

################################################################################
# Main SimData Model (for Shirley)
################################################################################

class SimData:
    """
    Holds references to the latest XGPSData and XATTData from the simulator
    and transforms them into the format Shirley expects.
    """
    def __init__(self):
        # Store references to the most recent XGPSData and XATTData
        # Initialize them to defaults
        self.xgps: XGPSData | None = None
        self.xatt: XATTData | None = None

        # For concurrency control
        self._lock = asyncio.Lock()

    async def update_from_xgps(self, xgps: XGPSData):
        """Replace the reference to the latest XGPSData."""
        async with self._lock:
            self.xgps = xgps

    async def update_from_xatt(self, xatt: XATTData):
        """Replace the reference to the latest XATTData."""
        async with self._lock:
            self.xatt = xatt

    async def get_data_snapshot(self):
        """
        Produce a dictionary of position and attitude in the format Shirley expects.
        We do the unit conversions (e.g. M -> ft) here, using the references to XGPSData and XATTData.
        """
        async with self._lock:
            # Local copies for clarity
            xgps = self.xgps
            xatt = self.xatt

            # Defaults in case we have no data yet
            latitude = 0.0
            longitude = 0.0
            msl_alt_ft = 0.0
            ground_speed_kts = 0.0
            heading_deg = 0.0
            pitch_deg = 0.0
            roll_deg = 0.0

            if xgps:
                latitude = xgps.latitude
                longitude = xgps.longitude
                msl_alt_ft = xgps.alt_msl_meters * METERS_TO_FEET
                ground_speed_kts = xgps.ground_speed_mps * MPS_TO_KTS
                heading_deg = xgps.track_deg % 360.0  # if no XATT is available

            if xatt:
                # If we do have XATT, prefer that heading
                heading_deg = xatt.heading_deg % 360.0
                pitch_deg = xatt.pitch_deg
                roll_deg = xatt.roll_deg

            # Build final object for Shirley
            return {
                "position": {
                    "latitudeDeg": latitude,
                    "longitudeDeg": longitude,
                    # "aglAltitudeFt": 0.0,  # We don't have AGL from XGPS directly
                    "mslAltitudeFt": msl_alt_ft,
                    # "indicatedAirspeedKts": 0.0,  # Not provided by XGPS or XATT
                    "gpsGroundSpeedKts": ground_speed_kts,
                    # "verticalSpeedFpm": 0.0,      # Not provided by these messages
                },
                "attitude": {
                    "rollAngleDegRight": roll_deg,
                    "pitchAngleDegUp": pitch_deg,
                    # "magneticHeadingDeg": 0.0,  # Not provided by XATT
                    "trueHeadingDeg": heading_deg,
                }
            }

################################################################################
# ForeFlight Data Parser
################################################################################

class ForeFlightParser:
    """
    Parses strings in ForeFlight's XGPS / XATT (and optionally XTRAFFIC) formats,
    returning typed objects: XGPSData, XATTData, or UnknownData.
    """

    @staticmethod
    def parse_line(line: str):
        """
        Identify the data type (XGPS, XATT, etc.) and parse accordingly.
        Returns one of:
          - XGPSData
          - XATTData
          - UnknownData
        """
        line = line.strip()
        if line.startswith("XGPS"):
            return ForeFlightParser._parse_xgps(line)
        elif line.startswith("XATT"):
            return ForeFlightParser._parse_xatt(line)
        else:
            return UnknownData(raw_line=line)

    @staticmethod
    def _parse_xgps(line: str) -> XGPSData | UnknownData:
        """
        Example XGPS line:
        XGPSMySim,-80.11,34.55,1200.1,359.05,55.6
        => XGPS<sim_name>,<longitude>,<latitude>,<alt_msl_meters>,<track_deg_true>,<groundspeed_m/s>
        """
        try:
            raw = line[4:]  # remove 'XGPS'
            parts = raw.split(",")
            sim_name = parts[0].strip()
            longitude = float(parts[1])
            latitude = float(parts[2])
            alt_msl_meters = float(parts[3])
            track_deg = float(parts[4])
            ground_speed_mps = float(parts[5])

            return XGPSData(
                sim_name=sim_name,
                longitude=longitude,
                latitude=latitude,
                alt_msl_meters=alt_msl_meters,
                track_deg=track_deg,
                ground_speed_mps=ground_speed_mps
            )
        except (ValueError, IndexError):
            return UnknownData(raw_line=line)

    @staticmethod
    def _parse_xatt(line: str) -> XATTData | UnknownData:
        """
        Example XATT line:
        XATTMySim,180.2,0.1,0.2
        => XATT<sim_name>,<true_heading_deg>,<pitch_deg>,<roll_deg>
        """
        try:
            raw = line[4:]
            parts = raw.split(",")
            sim_name = parts[0].strip()
            heading_deg = float(parts[1])
            pitch_deg = float(parts[2])
            roll_deg = float(parts[3])

            return XATTData(
                sim_name=sim_name,
                heading_deg=heading_deg,
                pitch_deg=pitch_deg,
                roll_deg=roll_deg
            )
        except (ValueError, IndexError):
            return UnknownData(raw_line=line)

################################################################################
# ForeFlight UDP Client
################################################################################

class ForeFlightUDPServer:
    """
    Listens for ForeFlight-compatible data on UDP port 49002.
    Parses lines and updates the shared SimData.
    """
    def __init__(self, sim_data: SimData, parser: ForeFlightParser, port: int = 49002):
        self.sim_data = sim_data
        self.parser = parser
        self.port = port
        self.socket = None
        self.lastDataReceivedTime = None

    async def run(self):
        """
        Main loop: bind to UDP port, receive data, parse, update sim_data.
        We'll do a blocking recv in a background thread so we don't block the event loop.
        """
        # Create UDP socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        # Enable broadcast
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        # Allow port/address reuse on Windows and Unix
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        # NOTE: On Unix, also enable SO_REUSEPORT to allow multiple listeners on the same port
        # Comment out on Windows, as it doesn't support SO_REUSEPORT
        # self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)

        # Set blocking to True for our simple loop
        self.socket.setblocking(True)

        # Bind to all interfaces on the specified port:
        self.socket.bind(('', self.port))

        print(f"[ForeFlightUDPServer] Listening on UDP port {self.port}...")

        while True:
            data, _ = await asyncio.to_thread(self.socket.recvfrom, 1024)
            line = data.decode('utf-8', errors='ignore').strip()
            parsed_obj = self.parser.parse_line(line)

            # If we haven't received data in a while, print a message
            if self.lastDataReceivedTime is None or \
               time.time() - self.lastDataReceivedTime > 5.0:
                print(f"[ForeFlightUDPServer] Starting to receive data (e.g.): {parsed_obj}")
            self.lastDataReceivedTime = time.time()

            if isinstance(parsed_obj, XGPSData):
                await self.sim_data.update_from_xgps(parsed_obj)
            elif isinstance(parsed_obj, XATTData):
                await self.sim_data.update_from_xatt(parsed_obj)
            else:
                # Unknown or not handled
                pass

################################################################################
# Shirley WebSocket Server
################################################################################

import websockets
import websockets.exceptions

class ShirleyWebSocketServer:
    """
    Hosts a WebSocket server on a specified port & path.
    - When clients connect, we hold onto their connections.
    - We periodically broadcast the latest `SimData` to every connected client.
    """
    def __init__(self, sim_data: SimData, host="0.0.0.0", port=2992, path="/api/v1"):
        self.sim_data = sim_data
        self.host = host
        self.port = port
        self.path = path
        self.send_interval = 0.25  # seconds (4 Hz)
        self.connections = set()

    async def handler(self, websocket):
        """
        Called for every new client connection. We can optionally listen for messages,
        but here we primarily just broadcast out.
        """
        self.connections.add(websocket)
        print(f"[ShirleyWebSocketServer] WebSocket Client connected: {websocket.remote_address}")

        # if the suffix is not the expected path, print a warning
        if not websocket.request.path.endswith(self.path):
            print(f"[ShirleyWebSocketServer] Warning: WS Connected to {websocket.request.path}, not {self.path}")

        try:
            # Keep reading messages in case the client sends anything
            async for setSimData in websocket:
                # We ignore incoming messages in this example
                print(f"[ShirleyWebSocketServer] WebSocket Received SetSimData message: {setSimData}")

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connections.remove(websocket)
            print(f"[ShirleyWebSocketServer] WebSocket Client disconnected: {websocket.remote_address}")

    async def broadcast_loop(self):
        """
        Periodically broadcast the latest SimData to all connected clients.
        """
        while True:
            data = await self.sim_data.get_data_snapshot()
            message = json.dumps(data)
            stale_connections = []

            for ws in self.connections:
                try:
                    await ws.send(message)
                except websockets.exceptions.ConnectionClosed:
                    stale_connections.append(ws)
                except Exception as e:
                    print(f"[ShirleyWebSocketServer] Send error: {e}")
                    stale_connections.append(ws)

            # Remove any closed connections
            for ws in stale_connections:
                self.connections.remove(ws)

            await asyncio.sleep(self.send_interval)

    async def run(self):
        # Start the websockets server
        server = await websockets.serve(self.handler, self.host, self.port)
        print(f"[ShirleyWebSocketServer] Serving at ws://{self.host}:{self.port}{self.path}")
        # Run forever, simultaneously:
        # 1) Accept client connections
        # 2) Broadcast data in a loop
        await asyncio.gather(
            server.wait_closed(),
            self.broadcast_loop()
        )

################################################################################
# Main Bridge Application
################################################################################

class ForeFlightToShirleyBridge:
    """
    High-level orchestrator that sets up:
    1) A SimData object
    2) A ForeFlightUDPServer (listens on 49002)
    3) A ShirleyWebSocketServer (hosts on 2992/api/v1)
    4) Runs them concurrently with asyncio.
    """
    def __init__(self, udp_port=49002, ws_host="0.0.0.0", ws_port=2992, ws_path="/api/v1"):
        self.sim_data = SimData()
        self.parser = ForeFlightParser()
        self.udp_server = ForeFlightUDPServer(self.sim_data, self.parser, port=udp_port)
        self.ws_server = ShirleyWebSocketServer(self.sim_data, host=ws_host, port=ws_port, path=ws_path)

    async def run(self):
        await asyncio.gather(
            self.udp_server.run(),
            self.ws_server.run()
        )

################################################################################
# Entry Point
################################################################################

if __name__ == "__main__":
    bridge = ForeFlightToShirleyBridge(
        udp_port=49002,        # Listen for XGPS/XATT
        ws_host="0.0.0.0",     # Host WebSocket server on all interfaces
        ws_port=2992,          # Port for Shirley to connect
        ws_path="/api/v1"      # Path for the WebSocket
    )

    try:
        asyncio.run(bridge.run())
    except KeyboardInterrupt:
        print("\nBridge shutting down.")
