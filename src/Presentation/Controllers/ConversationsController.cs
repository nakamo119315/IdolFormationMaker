using IdolManagement.Application.Conversations.Commands;
using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Application.Conversations.Queries;
using Microsoft.AspNetCore.Mvc;

namespace IdolManagement.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConversationsController : ControllerBase
{
    private readonly GetAllConversationsHandler _getAllHandler;
    private readonly GetConversationHandler _getHandler;
    private readonly CreateConversationHandler _createHandler;
    private readonly UpdateConversationHandler _updateHandler;
    private readonly DeleteConversationHandler _deleteHandler;
    private readonly AddMessageHandler _addMessageHandler;

    public ConversationsController(
        GetAllConversationsHandler getAllHandler,
        GetConversationHandler getHandler,
        CreateConversationHandler createHandler,
        UpdateConversationHandler updateHandler,
        DeleteConversationHandler deleteHandler,
        AddMessageHandler addMessageHandler)
    {
        _getAllHandler = getAllHandler;
        _getHandler = getHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _addMessageHandler = addMessageHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ConversationSummaryDto>>> GetAll(
        [FromQuery] Guid? memberId = null,
        CancellationToken cancellationToken = default)
    {
        var conversations = await _getAllHandler.HandleAsync(
            new GetAllConversationsQuery(memberId),
            cancellationToken
        );
        return Ok(conversations);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ConversationDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var conversation = await _getHandler.HandleAsync(
            new GetConversationQuery(id),
            cancellationToken
        );
        if (conversation == null)
            return NotFound();
        return Ok(conversation);
    }

    [HttpPost]
    public async Task<ActionResult<ConversationDto>> Create(
        [FromBody] CreateConversationDto dto,
        CancellationToken cancellationToken)
    {
        var conversation = await _createHandler.HandleAsync(
            new CreateConversationCommand(dto),
            cancellationToken
        );
        return CreatedAtAction(nameof(Get), new { id = conversation.Id }, conversation);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ConversationDto>> Update(
        Guid id,
        [FromBody] UpdateConversationDto dto,
        CancellationToken cancellationToken)
    {
        var conversation = await _updateHandler.HandleAsync(
            new UpdateConversationCommand(id, dto),
            cancellationToken
        );
        if (conversation == null)
            return NotFound();
        return Ok(conversation);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _deleteHandler.HandleAsync(
            new DeleteConversationCommand(id),
            cancellationToken
        );
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<ActionResult<MessageDto>> AddMessage(
        Guid id,
        [FromBody] AddMessageDto dto,
        CancellationToken cancellationToken)
    {
        var message = await _addMessageHandler.HandleAsync(
            new AddMessageCommand(id, dto),
            cancellationToken
        );
        if (message == null)
            return NotFound();
        return Created($"/api/conversations/{id}/messages/{message.Id}", message);
    }
}
