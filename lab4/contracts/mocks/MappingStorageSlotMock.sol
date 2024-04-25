// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.24;

import "../libs/MappingStorageSlot.sol";

contract MappingStorageSlotMock {
    using MappingStorageSlot for *;

    function setAddressToUint256MappingSlot(bytes32 slot, address key, uint256 value) public {
        slot.getAddressToUint256MappingSlot().value[key] = value;
    }

    function getAddressToUint256MappingSlot(bytes32 slot, address key) public view returns (uint256) {
        return slot.getAddressToUint256MappingSlot().value[key];
    }

    function setAddressToAddressToUint256MappingSlot(bytes32 slot, address key1, address key2, uint256 value) public {
        slot.getAddressToAddressToUint256MappingSlot().value[key1][key2] = value;
    }

    function getAddressToAddressToUint256MappingSlot(
        bytes32 slot,
        address key1,
        address key2
    ) public view returns (uint256) {
        return slot.getAddressToAddressToUint256MappingSlot().value[key1][key2];
    }
}
