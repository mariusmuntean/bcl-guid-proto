using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ProtoBuf;

namespace tester.net.Controllers;

[ApiController]
[Route("[controller]")]
public class DtoController : ControllerBase
{
    private readonly ILogger<DtoController> _logger;

    public DtoController(ILogger<DtoController> logger)
    {
        _logger = logger;
    }

    [HttpGet("/dto")]
    public async Task Get()
    {
        var responseDto = new Dto
        {
            Id = Guid.NewGuid()
        };
        _logger.LogInformation("Sending: {ReceivedDtoJson}", JsonSerializer.Serialize(responseDto));
        
        await WriteToResponseBody(responseDto);
    }

    private async Task WriteToResponseBody(Dto responseDto)
    {
        using var ms = new MemoryStream();
        Serializer.Serialize(ms, responseDto);
        ms.Seek(0, SeekOrigin.Begin);

        await HttpContext.Response.BodyWriter.WriteAsync(ms.ToArray());
    }

    [HttpPut("/dto")]
    public async Task Put()
    {
        using var ms = new MemoryStream();
        await Request.Body.CopyToAsync(ms);
        ms.Seek(0, SeekOrigin.Begin);
        var receivedDto = Serializer.Deserialize<Dto>(ms);
        _logger.LogInformation("Received: {ReceivedDtoJson}", JsonSerializer.Serialize(receivedDto));

        var responseDto = new Dto {Id = receivedDto.Id};
        _logger.LogInformation("Sending: {ResponseDtoJson}", JsonSerializer.Serialize(responseDto));
        await WriteToResponseBody(responseDto);
    }
}

[ProtoContract]
public class Dto
{
    [ProtoMember(1)] public Guid Id { get; set; }
}