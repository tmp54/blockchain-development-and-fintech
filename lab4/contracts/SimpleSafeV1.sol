// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";
import "./libs/MappingStorageSlot.sol";

/**
 * @dev This contract is a safe where you can deposit and withdraw funds.
 *
 * Note that there are 0.1% of fee being charged.
 * i.e. If deposit 1000 tokenA into it, you can only withdraw 999 at max.
 */
contract SimpleSafeV1 {
    /// @dev The amount required to withdraw is larger than the amount could be withdrawn.
    error SimpleSafeInsufficientBalance(uint256 balanceRequired, uint256 totalBalance);

    /// @dev The user is not admin.
    error ImplementationUnauthorizedError();

    /// @dev This slot stores balances.
    /// It is in type of `mapping(address => mapping(address => uint256))`.
    /// Meaning: token => account => amount.
    bytes32 internal constant BALANCES_SLOT = bytes32(uint256(keccak256("SimpleSafe.balances")) - 1);

    /// @dev This slot stores fees.
    /// It is in type of `mapping(address => uint256)`.
    /// Meaning: token => amount
    bytes32 internal constant FEES_SLOT = bytes32(uint256(keccak256("SimpleSafe.fees")) - 1);

    /// @dev Check if `msg.sender` is admin.
    modifier onlyAdmin() {
        if (msg.sender != ERC1967Utils.getAdmin()) {
            revert ImplementationUnauthorizedError();
        }

        _;
    }

    /// @dev Getter for `SimpleSafe.balances` slot.
    function balances() internal pure returns (MappingStorageSlot.AddressToAddressToUint256MappingSlot storage) {
        return MappingStorageSlot.getAddressToAddressToUint256MappingSlot(BALANCES_SLOT);
    }

    /// @dev Getter for `SimpleSafe.fees` slot.
    function fees() internal pure returns (MappingStorageSlot.AddressToUint256MappingSlot storage) {
        return MappingStorageSlot.getAddressToUint256MappingSlot(FEES_SLOT);
    }

    /// @dev Deposit `amount` of `token` into the contract.
    /// Note: There are 0.1% of fee.
    function deposit(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        uint256 feeAmount = amount / 1000;
        uint256 balanceAmount = amount - feeAmount;

        balances().value[token][msg.sender] += balanceAmount;
        fees().value[token] += feeAmount;
    }

    /// @dev Withdraw `amount` of `token` from the contract.
    function withdraw(address token, uint256 amount) external {
        if (amount > balances().value[token][msg.sender]) {
            revert SimpleSafeInsufficientBalance(amount, balances().value[token][msg.sender]);
        }
        IERC20(token).transfer(msg.sender, amount);
        balances().value[token][msg.sender] -= amount;
    }

    /// @dev Take fees of `token`, only admin could call it.
    function takeFee(address token) external onlyAdmin {
        IERC20(token).transfer(msg.sender, fees().value[token]);
        fees().value[token] = 0;
    }
}
