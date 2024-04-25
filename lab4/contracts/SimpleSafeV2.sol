// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";
import "./libs/MappingStorageSlot.sol";

/**
 * @dev This contract is a safe where you can deposit and withdraw funds.
 */
contract SimpleSafeV2 {
    /// @dev The amount required to withdraw is larger than the amount could be withdrawn.
    error SimpleSafeInsufficientBalance(uint256 balanceRequired, uint256 totalBalance);

    /// @dev The user is not admin.
    error ImplementationUnauthorizedError();

    /// @dev This slot stores balances.
    /// It is in type of `mapping(address => mapping(address => uint256))`.
    /// Meaning: token => account => amount.
    bytes32 internal constant BALANCES_SLOT = bytes32(uint256(keccak256("SimpleSafe.balances")) - 1);

    /// @dev Getter for `SimpleSafe.balances` slot.
    function balances() internal pure returns (MappingStorageSlot.AddressToAddressToUint256MappingSlot storage) {
        return MappingStorageSlot.getAddressToAddressToUint256MappingSlot(BALANCES_SLOT);
    }

    /// @dev Deposit `amount` of `token` into the contract.
    function deposit(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances().value[token][msg.sender] += amount;
    }

    /// @dev Withdraw `amount` of `token` from the contract.
    function withdraw(address token, uint256 amount) external {
        if (amount > balances().value[token][msg.sender]) {
            revert SimpleSafeInsufficientBalance(amount, balances().value[token][msg.sender]);
        }
        IERC20(token).transfer(msg.sender, amount);
        balances().value[token][msg.sender] -= amount;
    }
}
