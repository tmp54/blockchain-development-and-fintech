// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./safes/MyOwnSafe.sol";
import "./safes/MyOwnSafeUpgradeable.sol";

contract SafeFactory {
    event SafeDeployed(address indexed owner, address contractAddress);
    event SafeWithCreate2Deployed(address indexed owner, address contractAddress);
    event SafeUpgradeableDeployed(address indexed owner, address contractAddress);
    event SafeUpgradeableWithCreate2Deployed(address indexed owner, address contractAddress);

    address public immutable safeUpgradeableAddress;

    constructor(address _safeUpgradeable) {
        safeUpgradeableAddress = _safeUpgradeable;
    }

    function deploySafe(address _owner) external {
        MyOwnSafe myOwnSafe = new MyOwnSafe(_owner);
        emit SafeDeployed(_owner, address(myOwnSafe));
    }

    function deploySafeWithCreate2(address _owner, bytes32 salt) external {
        bytes memory initCode = abi.encodePacked(type(MyOwnSafe).creationCode, abi.encode(_owner));
        address addr = Create2.deploy(0, salt, initCode);
        emit SafeWithCreate2Deployed(_owner, addr);
    }

    function deploySafeUpgradeable(address _owner) external {
        address addr = Clones.clone(safeUpgradeableAddress);
        MyOwnSafeUpgradeable myOwnSafeUpgradeable = MyOwnSafeUpgradeable(addr);
        myOwnSafeUpgradeable.initialize(_owner);
        emit SafeUpgradeableDeployed(_owner, addr);
    }

    function deploySafeUpgradeableWithCreate2(address _owner, bytes32 salt) external {
        address addr = Clones.cloneDeterministic(safeUpgradeableAddress, salt);
        MyOwnSafeUpgradeable myOwnSafeUpgradeable = MyOwnSafeUpgradeable(addr);
        myOwnSafeUpgradeable.initialize(_owner);
        emit SafeUpgradeableWithCreate2Deployed(_owner, addr);
    }
}
