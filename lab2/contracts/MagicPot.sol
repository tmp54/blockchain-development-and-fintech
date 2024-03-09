// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MagicPot {
    constructor() {}

    address mt = 0xCaAF1c4DAE435Db0085BA8B1C883b3566DE1C121;

    function theMagicPot(address token, uint256 amount) external {
        require(amount >= 1000_000000_000000_000000, "not enough");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(mt).transfer(msg.sender, 1_000000_000000_000000);
    }
}
