// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyOwnSafeUpgradeable {
    address public owner;
    uint256 counter;
    bool init;

    modifier onlyOwner() {
        require(msg.sender == owner, "!owner");
        _;
    }

    function initialize(address _owner) external {
        require(!init, "initialized");
        owner = _owner;
        init = true;
    }

    function withdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }

    function count() external onlyOwner {
        counter++;
    }
}
