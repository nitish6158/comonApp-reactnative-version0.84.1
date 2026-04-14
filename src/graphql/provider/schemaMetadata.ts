import _mapValues from "lodash/mapValues";
import _omitBy from "lodash/omitBy";
import _isUndefined from "lodash/isUndefined";

import schemaMetadataJson from "./schemaMetadata.json";

interface SchemaMetadataEntry {
  keyFields: string[] | null;
  possibleTypes?: string[];
}

const schemaMetadata: { [s: string]: SchemaMetadataEntry } = schemaMetadataJson;

export const typePolicies = _mapValues(schemaMetadata, ({ keyFields }) => ({
  keyFields: keyFields ?? undefined,
  merge: true,
}));

export const possibleTypes = _omitBy(
  _mapValues(schemaMetadata, (d) => d?.possibleTypes),
  _isUndefined
) as { [s: string]: string[] };
