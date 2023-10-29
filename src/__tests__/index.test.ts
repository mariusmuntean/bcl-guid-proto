import { toBclGuidProto } from '../index';
import { load } from 'protobufjs';
import { request } from 'http';
import path from 'path';

test('Dummy GUID serialized correctly', async () => {
  const guid = toBclGuidProto('00112233-4455-6677-8899-AABBCCDDEEFF');

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
 * Make sure to have the ASP.NETCore project running
 */
test('Sent Dto is the same as the received one', async () => {
  const dto = {
    Id: toBclGuidProto('00112233-4455-6677-8899-AABBCCDDEEFF'),
  };

  // Obtain the root
  const root = await load(path.join(__dirname, 'types.proto'));

  // Load Dto message
  const dtoMessageType = root.lookupType('Dto');

  // The protobufable GUID should match the schema
  const errorMsg = dtoMessageType.verify(dto);
  expect(errorMsg).toBeNull();

  // Create a dto message instance and serialize it
  const dtoMessage = dtoMessageType.create(dto);
  const dtoMessageUint8Array = dtoMessageType.encode(dtoMessage).finish();

  // Send to the AP.NET Core app
  const req = request({
    origin: ' http://localhost',
    port: '5069',
    path: '/dto',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/protobuf',
      'Content-length': dtoMessageUint8Array.length,
    },
  });

  req.on('error', (e) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, no-console
    console.error(`Request failed: ${e}`);
  });
  req.write(Buffer.from(dtoMessageUint8Array));

  req.end();
});
