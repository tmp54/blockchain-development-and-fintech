// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Censorship Token
/// @author CSY54
contract CensorshipToken is ERC20 {
    /// @dev Address that has ability to censor.
    address public censor;

    /// @dev One with administrative privilege.
    address public master;

    /// @dev Blacklisted addresses.
    mapping(address => bool) public blacklist;

    uint256 private constant INITIAL_MINT = 100_000_000;

    constructor() ERC20("Censorship", "CENS") {
        censor = _msgSender();
        master = _msgSender();
        _mint(_msgSender(), INITIAL_MINT);
    }

    /// @dev Check whether the sender is master.
    modifier isMaster() {
        require(master == _msgSender(), "CENS: You are not the master");

        _;
    }

    /// @dev Check whether the address is not 0.
    modifier isValidAddress(address _address) {
        require(_address != address(0), "CENS: Address should not be 0");

        _;
    }

    /// @dev Change `master` to a new one.
    ///
    /// Require sender to be master.
    /// Require address not 0.
    /// @param newMaster New master to be set.
    function changeMaster(address newMaster) external isMaster isValidAddress(newMaster) {
        master = newMaster;
    }

    /// @dev Change `censor` to a new one.
    ///
    /// Require sender to be master.
    /// Require address not 0.
    /// @param newCensor New censor to be set.
    function changeCensor(address newCensor) external isMaster isValidAddress(newCensor) {
        censor = newCensor;
    }

    /// @dev Blacklist `target` address according to `blacklisted`.
    /// @param target Address to be blacklist/unblacklist.
    /// @param blacklisted Whether to be blacklisted.
    function setBlacklist(address target, bool blacklisted) external {
        require(msg.sender == master || msg.sender == censor, "CENS: You are not the master nor the censor");

        if (blacklisted) {
            blacklist[target] = true;
        } else {
            delete blacklist[target];
        }
    }

    /// @dev Override `_update` to check wherther the address is blacklisted before updating
    function _update(address from, address to, uint256 value) internal override {
        require(!blacklist[from], "CENS: Invalid sender");
        require(!blacklist[to], "CENS: Invalid receiver");

        super._update(from, to, value);
    }

    /// @dev Claw back `amount` tokens from `target` address.
    ///
    /// Require sender to be master.
    /// @param target Address to be clawed back.
    /// @param amount Amount to be clawed back.
    function clawBack(address target, uint256 amount) external isMaster {
        _transfer(target, _msgSender(), amount);
    }

    /// @dev Mint `amount` tokens to `target` address.
    ///
    /// Require sender to be master.
    /// @param target Address to mint.
    /// @param amount Amount to mint.
    function mint(address target, uint256 amount) public isMaster {
        _mint(target, amount);
    }

    /// @dev Burn `amount` tokens from `target` address.
    ///
    /// Require sender to be master.
    /// @param target Address to burn.
    /// @param amount Amount to burn.
    function burn(address target, uint256 amount) public isMaster {
        _burn(target, amount);
    }
}
