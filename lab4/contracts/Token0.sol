// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IToken.sol";

contract Token0 is IToken, ERC20 {
    constructor() ERC20("Token0", "TK0") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
