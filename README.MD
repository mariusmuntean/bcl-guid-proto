# BCL GUID Proto

[![npm](https://img.shields.io/npm/v/bcl-guid-proto)](https://www.npmjs.com/package/bcl-guid-proto)

<iframe src="https://github.com/sponsors/mariusmuntean/button" title="Sponsor mariusmuntean" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>

A helper library that allows exchanging Protobuf-serialized GUIDs between a Node application and a .NET application that uses Protobuf-net.

## What is even the problem?

Basically the way that a .NET GUID is Protobuf-serialized is insane.The bytes of a GUID are produces with no recognizable endianness.
On top of that, those 16 bytes are sent over the wire as an object with two properties, called `lo` and `hi`, each being a 64 bit long.

Here's a graphical representation of how protobuf-net serializes a GUID
![Mapping](./Media/Crazy%20Bytes.drawio.png)

## Solution

Use the `toProtobufNetGuid` method to package your GUID string into the form of that aforementioned object.

```javascript
const protobufNetGuid: ProtobufNetGuid = toProtobufNetGuid('00112233-4455-6677-8899-AABBCCDDEEFF');
```

Then just serialize it with protobufjs and send it over the wire.

Use `fromProtobufNetGuid` to convert such an object back into a GUID string.

```javascript
const recoveredGuid: string = fromProtobufNetGuid(protobufNetGuid);
```

I warmly recommend having a look at the handful of tests. There's even one with a full roundtrip to a .NET application.

### Detailed example

Let's say you have to send a dto from your NodeJs application to your .NET application. The dto has a field containing a GUID.
Your code might look like this

```typescript
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

const command = `dotnet run --force --project ./src/__tests__/tester/Tester.CLI/Tester.CLI.csproj --byteArray ${base64String}`;
const stdOut = execSync(command).toString();

const decodedDto = dtoMessageType.decode(Buffer.from(stdOut, 'base64')) as unknown as Dto;
const decodedGuid = fromProtobufNetGuid(decodedDto.Id);
```

The relevant proto file looks like this

```proto
syntax = "proto3";

message Guid {
    fixed64 lo = 1;
    fixed64 hi = 2;
  }

  message Dto {
    Guid Id = 1;
  }
```

## Note

If you're setting up a new .NET project with protobuf-net, please read this https://protobuf-net.github.io/protobuf-net/compatibilitylevel.html

## Note #2

Buy me a coffee if the library helped you!
As always, you can have fun with my code. MIT baby!
