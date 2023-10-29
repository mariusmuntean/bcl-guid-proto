using ProtoBuf;

namespace Tester.CLI;

class Program
{
    static void Main(string[] args)
    {
        // args = new[] {"--byteArray", "ChIJMyIRAFVEd2YRiJmqu8zd7v8="};

        // Parse command-line arguments
        string byteArrayBase64 = null;
        for (int i = 0; i < args.Length; i++)
        {
            if (args[i] == "--byteArray" && i + 1 < args.Length)
            {
                byteArrayBase64 = args[i + 1];
                break;
            }
        }

        if (byteArrayBase64 != null)
        {
            // Decode the Base64-encoded byte array
            byte[] byteArray = Convert.FromBase64String(byteArrayBase64);
            var memoryStream = new MemoryStream(byteArray);
            memoryStream.Seek(0, SeekOrigin.Begin);
            var recoveredDto = Serializer.Deserialize<Dto>(memoryStream);

            var destStream = new MemoryStream();
            Serializer.Serialize(destStream, recoveredDto);
            destStream.Seek(0, SeekOrigin.Begin);
            var base64Response = Convert.ToBase64String(destStream.ToArray());
            Console.Write(base64Response);
        }
        else
        {
            Console.WriteLine("No byteArray provided.");
        }
    }
}

[ProtoContract]
internal class Dto
{
    [ProtoMember(1)] public Guid Id { get; set; }
}