import { load } from 'protobufjs';
import path from 'path';
import Long from 'long';
import { execSync } from 'child_process';

import { fromProtobufNetGuid, toProtobufNetGuid } from '../index';
import { Dto } from './Dto';

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

test('Roundtrip to .NET app and back', async () => {
  // Given that I have a DTO with a GUID field that is protobuf serialized and converted to a base64 string
  const expectedGuid = '00112233-4455-6677-8899-AABBCCDDEEFF';
  const dto: Dto = {
    Id: toProtobufNetGuid(expectedGuid),
  };

  const root = await load(path.join(__dirname, 'types.proto'));

  const dtoMessageType = root.lookupType('Dto');

  const errorMsg = dtoMessageType.verify(dto);
  expect(errorMsg).toBeNull();

  const dtoMessage = dtoMessageType.create(dto);
  const dtoMessageUint8Array = dtoMessageType.encode(dtoMessage).finish();

  const base64String = Buffer.from(dtoMessageUint8Array).toString('base64');

  // When I send it to a .NET CLI tool which deserializes and then serializes the DTO back
  const command = `dotnet run --force --project ./src/__tests__/tester/Tester.CLI/Tester.CLI.csproj --byteArray ${base64String}`;
  const stdOut = execSync(command).toString();

  // Then the returned data can be deserialized and the GUID recovered
  const decodedDto = dtoMessageType.decode(Buffer.from(stdOut, 'base64')) as unknown as Dto;
  expect(decodedDto).not.toBeFalsy();
  const decodedGuid = fromProtobufNetGuid(decodedDto.Id);
  expect(decodedGuid).not.toBeNull();
  expect(decodedGuid).toEqual(expectedGuid);
});
