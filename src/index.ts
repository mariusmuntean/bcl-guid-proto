import Long from 'long';

export interface ProtobufNetGuid {
  lo: Long;
  hi: Long;
}

/**
 * Takes a GUID string and produces a Guid instance that can be serialized properly by protobufjs in a way that protobuf-net will understand it as a .NET Guid.
 * @param guid A GUID string, e.g. '0CBFD489-DDFA-4E4B-B096-58133E61F15F'
 * @returns A Guid instance that can be protobuf-serialized with protobufjs
 */
export const toProtobufNetGuid = (guid: string): ProtobufNetGuid => {
  // ToDo: input validation

  // no hyphens
  const guidNoHyphens = guid.replace(/-/g, '');

  // get each byte
  const b0 = guidNoHyphens.slice(0, 2);
  const b1 = guidNoHyphens.slice(2, 4);
  const b2 = guidNoHyphens.slice(4, 6);
  const b3 = guidNoHyphens.slice(6, 8);
  const b4 = guidNoHyphens.slice(8, 10);
  const b5 = guidNoHyphens.slice(10, 12);
  const b6 = guidNoHyphens.slice(12, 14);
  const b7 = guidNoHyphens.slice(14, 16);
  const b8 = guidNoHyphens.slice(16, 18);
  const b9 = guidNoHyphens.slice(18, 20);
  const b10 = guidNoHyphens.slice(20, 22);
  const b11 = guidNoHyphens.slice(22, 24);
  const b12 = guidNoHyphens.slice(24, 26);
  const b13 = guidNoHyphens.slice(26, 28);
  const b14 = guidNoHyphens.slice(28, 30);
  const b15 = guidNoHyphens.slice(30, 32);

  const reassembledGuid = [
    // 4
    b0,
    b1,
    b2,
    b3,

    // 2
    b6,
    b7,

    // 2
    b4,
    b5,

    // 2
    b11,
    b10,

    // 6
    b9,
    b8,
    b15,
    b14,
    b13,
    b12,
  ].join('');

  const doubleWord1 = reassembledGuid.slice(0, 8);
  const doubleWord2 = reassembledGuid.slice(8, 16);
  const doubleWord3 = reassembledGuid.slice(16, 24);
  const doubleWord4 = reassembledGuid.slice(24, 32);

  return {
    lo: new Long(Number.parseInt(doubleWord1, 16), Number.parseInt(doubleWord2, 16)),
    hi: new Long(Number.parseInt(doubleWord3, 16), Number.parseInt(doubleWord4, 16)),
  };
};

/**
 * Takes a GUID string and produces a Guid instance that can be serialized properly by protobufjs in a way that protobuf-net will understand it as a .NET Guid.
 * @param guid A GUID string, e.g. '0CBFD489-DDFA-4E4B-B096-58133E61F15F'
 * @returns A Guid instance that can be protobuf-serialized with protobufjs
 */
export const fromProtobufNetGuid = (protobufNetGuid: ProtobufNetGuid): string => {
  // ToDo: input validation

  const { lo, hi } = protobufNetGuid;
  const loBytes = lo.toBytes();
  const doubleWord1 = loBytes.slice(4, 8);
  const doubleWord2 = loBytes.slice(0, 4);

  const hiBytes = hi.toBytes();
  const doubleWord3 = hiBytes.slice(4, 8);
  const doubleWord4 = hiBytes.slice(0, 4);

  const crazyEndianGuid = [...doubleWord1, ...doubleWord2, ...doubleWord3, ...doubleWord4];

  const b0 = crazyEndianGuid[0].toString(16).toUpperCase().padStart(2, '0');
  const b1 = crazyEndianGuid[1].toString(16).toUpperCase().padStart(2, '0');
  const b2 = crazyEndianGuid[2].toString(16).toUpperCase().padStart(2, '0');
  const b3 = crazyEndianGuid[3].toString(16).toUpperCase().padStart(2, '0');

  const b4 = crazyEndianGuid[6].toString(16).toUpperCase().padStart(2, '0');
  const b5 = crazyEndianGuid[7].toString(16).toUpperCase().padStart(2, '0');

  const b6 = crazyEndianGuid[4].toString(16).toUpperCase().padStart(2, '0');
  const b7 = crazyEndianGuid[5].toString(16).toUpperCase().padStart(2, '0');

  const b8 = crazyEndianGuid[11].toString(16).toUpperCase().padStart(2, '0');
  const b9 = crazyEndianGuid[10].toString(16).toUpperCase().padStart(2, '0');

  const b10 = crazyEndianGuid[9].toString(16).toUpperCase().padStart(2, '0');
  const b11 = crazyEndianGuid[8].toString(16).toUpperCase().padStart(2, '0');
  const b12 = crazyEndianGuid[15].toString(16).toUpperCase().padStart(2, '0');
  const b13 = crazyEndianGuid[14].toString(16).toUpperCase().padStart(2, '0');
  const b14 = crazyEndianGuid[13].toString(16).toUpperCase().padStart(2, '0');
  const b15 = crazyEndianGuid[12].toString(16).toUpperCase().padStart(2, '0');

  const crazyEndianGuidString = [b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15].join('');

  const recoveredGuid = `${crazyEndianGuidString.slice(0, 8)}-${crazyEndianGuidString.slice(8, 12)}-${crazyEndianGuidString.slice(12, 16)}-${crazyEndianGuidString.slice(16, 20)}-${crazyEndianGuidString.slice(20, 32)}`;
  return recoveredGuid;
};

// ToDo: add roundtrip tst
// ToDo: expose raw bytes to allow other libraries to send the Guid
