// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EventHubRegistry {
    struct EventItem {
        address owner;
        string title;
        string dateISO;
        string location;
        string details;
    }
    mapping(bytes32 => EventItem) private eventsById;

    event EventUpsert(bytes32 indexed eventId, address indexed owner, string title);
    event EventDeleted(bytes32 indexed eventId, address indexed owner);

    function computeId(string memory title, string memory dateISO, string memory location) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(title, "|", dateISO, "|", location));
    }

    function upsertEvent(string calldata title, string calldata dateISO, string calldata location, string calldata details) external returns (bytes32 eventId) {
        eventId = computeId(title, dateISO, location);
        eventsById[eventId] = EventItem(msg.sender, title, dateISO, location, details);
        emit EventUpsert(eventId, msg.sender, title);
    }

    function getEvent(bytes32 eventId) external view returns (address, string memory, string memory, string memory, string memory) {
        EventItem storage e = eventsById[eventId];
        return (e.owner, e.title, e.dateISO, e.location, e.details);
    }

    function deleteEvent(bytes32 eventId) external {
        EventItem storage e = eventsById[eventId];
        require(e.owner != address(0), "Not found");
        require(e.owner == msg.sender, "Not owner");
        delete eventsById[eventId];
        emit EventDeleted(eventId, msg.sender);
    }
}
