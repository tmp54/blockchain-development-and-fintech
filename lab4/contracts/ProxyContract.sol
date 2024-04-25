// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

contract ProxyContract is ERC1967Proxy {
    /// @dev The user is not admin.
    error ProxyUnauthorizedError();

    /// @dev Initialize the proxy with an implementation.
    /// If `_data` is not empty, it is used as the data in delegatecall to the `_implementation`.
    constructor(address _implementation, bytes memory _data) ERC1967Proxy(_implementation, _data) {
        ERC1967Utils.changeAdmin(msg.sender);
    }

    /// @dev Check if `msg.sender` is admin.
    modifier onlyAdmin() {
        if (msg.sender != ERC1967Utils.getAdmin()) {
            revert ProxyUnauthorizedError();
        }

        _;
    }

    /// @dev Upgrade the implementation to a new one, only admin could call it.
    function upgradeToAndCall(address newImplementation, bytes memory data) external onlyAdmin {
        ERC1967Utils.upgradeToAndCall(newImplementation, data);
    }

    receive() external payable {}
}
