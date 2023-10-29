import Long from 'long';

export interface Guid {
  lo: Long;
  hi: Long;
}

/**
 * Takes a GUID string and produces a Guid instance that can be serialized properly by protobufjs in a way that protobuf-net will understand it as a .NET Guid.
 * @param guid A GUID string, e.g. '0CBFD489-DDFA-4E4B-B096-58133E61F15F'
 * @returns A Guid instance that can be protobuf-serialized with protobufjs
 */
export const toBclGuidProto = (guid: string): Guid => {
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

// ToDo: add roundtrip tst
// ToDo: expose raw bytes to allow other libraries to send the Guid
