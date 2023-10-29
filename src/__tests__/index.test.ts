import { load } from 'protobufjs';
import path from 'path';
import Long from 'long';

import { fromProtobufNetGuid, toProtobufNetGuid } from '../index';

test('Dummy GUID serialized correctly', async () => {
  const guid = toProtobufNetGuid('00112233-4455-6677-8899-AABBCCDDEEFF');

  // Obtain the root
  const root = await load(path.join(__dirname, 'types.proto'));

  // Load GUID message type
  const guidMessageType = root.lookupType('Guid');

  // The protobufable GUID should match the schema
  const errorMsg = guidMessageType.verify(guid);
  expect(errorMsg).toBeNull();

  // Create a GUID protobuf message instance and serialize it
  const guidMessage = guidMessageType.create(guid);
  const guidMessageUint8Array = guidMessageType.encode(guidMessage).finish();

  // The first 8 bytes have the field header '09' and the remaining 8 bytes have the field header '11'
  const hexMessage = Array.from(guidMessageUint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  expect(hexMessage).toBe('093322110055447766118899aabbccddeeff');
});

/**
 * Integration test that converts a string GUID to ProtobufNetGuid and then recovers it.
 */
test.each(['00000000-0000-0000-0000-000000000000', '00112233-4455-6677-8899-AABBCCDDEEFF', '3F2504E0-4F89-11D3-9A0C-0305E82C3301', 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF'])(
  'To and from ProtobufNetGuid with %s',
  (expectedGuid) => {
    const protobufNetGuid = toProtobufNetGuid(expectedGuid);
    const recoveredGuid = fromProtobufNetGuid(protobufNetGuid);

    expect(recoveredGuid).toEqual<string>(expectedGuid);
  },
);

test('Input Validation', () => {
  // Test null input for toProtobufNetGuid
  expect(() => toProtobufNetGuid(null as unknown as string)).toThrow();

  // Test empty string input for toProtobufNetGuid
  expect(() => toProtobufNetGuid('')).toThrow();

  // Test incomplete ProtobufNetGuid for fromProtobufNetGuid
  expect(() =>
    fromProtobufNetGuid({
      lo: new Long(123),
      hi: null as unknown as Long,
    }),
  ).toThrow();

  // Add more input validation tests here...
});
