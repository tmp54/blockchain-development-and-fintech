// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.24;

library MappingStorageSlot {
    struct AddressToUint256MappingSlot {
        mapping(address => uint256) value;
    }

    struct AddressToAddressToUint256MappingSlot {
        mapping(address => mapping(address => uint256)) value;
    }

    function getAddressToUint256MappingSlot(
        bytes32 slot
    ) internal pure returns (AddressToUint256MappingSlot storage r) {
        assembly {
            r.slot := slot
        }
    }

    function getAddressToAddressToUint256MappingSlot(
        bytes32 slot
    ) internal pure returns (AddressToAddressToUint256MappingSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}
