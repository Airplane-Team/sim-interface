import { z } from "zod";

/** Describes the sim platform that Shirley can connect to. */
export enum SimPlatform {
  /** X-Plane 12 */
  Xplane12 = "xplane12",
  /** Microsoft Flight Simulator 2020 */
  Msfs2020 = "msfs2020",
  /** Generic sim platform. */
  Generic = "generic",
}

/** Whether & when Shirley can see a data value. */
export enum Visibility {
  /** Always visible in Shirley state XML. */
  Always = "always",
  /** Visible in Shirley state XML when value is truthy, always accessible by tool call. */
  ToolAndAlwaysWhenTrue = "toolAndAlwaysWhenTrue",
  /** Returned by a tool call when Shirley requests it. */
  Tool = "tool",
  /** Visible in Shirley state XML when enabled by a challenge state or requested by tool call. */
  State = "state",
  /** Usable by system tools, but not visible in Shirley state XML or by Shirley tools. */
  System = "system",
  /** Not available anywhere. Might not even be sent to the server. */
  Never = "never",
}

/** Whether & when Shirley can write a data value. */
export enum Writability {
  /** Shirley can always write the data value via a tool call. */
  Always = "always",
  /** Shirley can write the data value after the data value has been read at least once.
   * @remark If used with `Visibility.Never`, the data value will never be writable.
   * @remark Otherwise the data value will be writable after it has been received by the Shirley system,
   *         even if it has not been present in any challenge state or tool call.
   */
  AfterRead = "afterRead",
  /** Usable by tool calls, but not visible/usable by the `SetSimSetpoints` function. */
  System = "system",
  /** Shirley cannot write the data value. */
  Never = "never",
}

/** Type of data that Shirley can access for a specific `DataName`. */
export enum ValueType {
  Number = "number",
  NumberMap = "numberMap",
  Boolean = "boolean",
  BooleanMap = "booleanMap",
  String = "string",
  StringMap = "stringMap",
}

/** Types of the values that Shirley can access for a specific `DataName`. */
export type ValueTypes =
  | number
  | Record<string, number>
  | boolean
  | Record<string, boolean>
  | string
  | Record<string, string>;

/** Schema describing properties of `DataName` that Shirley needs to access for a specific aircraft. */
export const DataDescriptorSchema = z
  .object({
    /** Type of the data value. */
    type: z.nativeEnum(ValueType),

    /** Short (1 line max) description to help Shirley understand the dataref and its values. */
    description: z.string().optional(),

    /** `toFixed` precision to use when Shirley reading/displaying the value.
     * @default 0 (integer). */
    precision: z.number().optional(),

    /** Range of values that are inclusively valid for this data `[min, max]`.
     *
     * E.g. `[-180, 180]` for degrees longitude.
     *
     * @remark Data outside this range will be rejected prior to delivery to Shirley.
     * @remark Range is not overridable by a profile.
     * */
    range: z.tuple([z.number(), z.number()]).readonly().optional(),

    /** Whether & when Shirley can see the dataref value.
     * @default `Visibility.Always`. */
    visibility: z.nativeEnum(Visibility).optional(),

    /** Whether Shirley can write the dataref.
     * @default `Writability.Never`.
     * @remark If undefined, not even a profile override can make the data writable.
     * @remark If desirable to enable writability in an AircraftProfile override, you must set
     *         non-undefined (e.g. `{}`).
     * */
    writableByPlatform: z.record(z.nativeEnum(SimPlatform), z.nativeEnum(Writability)).optional(),

    /** If ValueType is (Number|Boolean|String)Map, this defines the indexes of the map.
     * Shirley will see the data in the `mapKeys` order.
     *
     * E.g. `['LeftEngine', 'RightEngine']`
     *
     * @remark If defined empty (`[]`), Shirley will not see the map.
     * @remark If undefined, default `kDefaultMapIndexKeys` keys are utilized (e.g. `[0]`).
     * @see XplaneDescriptorSchema.arrayIndexMap for the X-Plane implementation.
     * */
    mapKeys: z.array(z.string()).readonly().optional(),

    /** If ValueType is `String` or `StringMap`, this defines the allowed values for the string. */
    enumValues: z.array(z.string()).readonly().optional(),
  })
  .strict();

/** Describes properties of `DataName` that Shirley needs to access for a specific aircraft.
 * @see DataDescriptorSchema
 */
export type DataDescriptor = z.infer<typeof DataDescriptorSchema>;
