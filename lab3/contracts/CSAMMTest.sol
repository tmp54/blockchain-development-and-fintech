// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.20;

import "./CSAMM.sol";

contract CSAMMTest is CSAMM {
    constructor(address _token0, address _token1, uint256 _conversionRate) CSAMM(_token0, _token1, _conversionRate) {}

    function exposed_min(uint256 lhs, uint256 rhs) external pure returns (uint256) {
        return _min(lhs, rhs);
    }

    function exposed_gcd(uint256 lhs, uint256 rhs) external pure returns (uint256) {
        return _gcd(lhs, rhs);
    }

    function exposed_capWithFixedRatio(
        uint256 _amount0,
        uint256 _amount1,
        uint256 _providedAmount0,
        uint256 _providedAmount1
    ) external pure returns (uint256, uint256) {
        return _capWithFixedRatio(_amount0, _amount1, _providedAmount0, _providedAmount1);
    }

    function exposed_normalizeAmount(
        uint256 _amount0,
        uint256 _amount1,
        uint256 _conversionRate
    ) external pure returns (uint256) {
        return _normalizeAmount(_amount0, _amount1, _conversionRate);
    }
}
