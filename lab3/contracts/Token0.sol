// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Token0 is ERC20, ERC20Burnable {
    constructor() ERC20("Token0", "TK0") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
