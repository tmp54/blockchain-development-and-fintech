// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CSAMM {
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint256 public immutable conversionRate;

    // @dev store the liquidity the sender provided in the amount of token0
    // TODO: store the larger one to minimize error
    mapping(address => uint256) public liquidityProvided;

    uint256 public amount0;
    uint256 public amount1;

    constructor(address _token0, address _token1, uint256 _conversionRate) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        conversionRate = _conversionRate;
    }

    modifier isTradableToken(address tokenAddress) {
        require(tokenAddress == address(token0) || tokenAddress == address(token1), "CSAMM: Token address not valid");

        _;
    }

    modifier hasSenderProvidedLiquidity() {
        require(liquidityProvided[msg.sender] != 0, "CSAMM: Have no liquidity to be withdrew");

        _;
    }

    function _min(uint256 lhs, uint256 rhs) internal pure returns (uint256) {
        return lhs <= rhs ? lhs : rhs;
    }

    /// @dev None of `lhs` and `rhs` should be 0.
    function _gcd(uint256 lhs, uint256 rhs) internal pure returns (uint256) {
        while (rhs != 0) {
            (lhs, rhs) = (rhs, lhs % rhs);
        }
        return lhs;
    }

    /// @dev Require none of the argument is 0.
    function _capWithFixedRatio(
        uint256 _amount0,
        uint256 _amount1,
        uint256 _providedAmount0,
        uint256 _providedAmount1
    ) internal pure returns (uint256, uint256) {
        uint256 gcd = _gcd(_amount0, _amount1);

        uint256 ratio0 = _amount0 / gcd;
        uint256 ratio1 = _amount1 / gcd;

        uint256 n = _min((_providedAmount0 * gcd) / _amount0, (_providedAmount1 * gcd) / _amount1);

        uint256 provide0 = ratio0 * n;
        uint256 provide1 = ratio1 * n;
        return (provide0, provide1);
    }

    /// @dev Normalize the amount of token in term of token0
    function _normalizeAmount(
        uint256 _amount0,
        uint256 _amount1,
        uint256 _conversionRate
    ) internal pure returns (uint256) {
        return _amount0 + (_amount1 * _conversionRate) / 10000;
    }

    function trade(address tokenFrom, uint256 fromAmount) public isTradableToken(tokenFrom) {
        bool isToken0 = tokenFrom == address(token0);

        (IERC20 tokenIn, IERC20 tokenOut, uint256 amountIn, uint256 amountOut) = isToken0
            ? (token0, token1, amount0, amount1)
            : (token1, token0, amount1, amount0);

        tokenIn.transferFrom(msg.sender, address(this), fromAmount);
        uint256 transferredAmount = tokenIn.balanceOf(address(this)) - amountIn;

        // calculate the amount to be transferred out based on the amount being transferred in
        uint256 toAmount = isToken0
            ? (transferredAmount * 10000) / conversionRate
            : (transferredAmount * conversionRate) / 10000;
        require(toAmount <= amountOut, "CSAMM: Invalid amount");

        (amount0, amount1) = isToken0
            ? (amountIn + fromAmount, amountOut - toAmount)
            : (amountOut - toAmount, amountIn + fromAmount);
        tokenOut.transfer(msg.sender, toAmount);
    }

    function provideLiquidity(uint256 _token0Amount, uint256 _token1Amount) public {
        (uint256 provideAmount0, uint256 provideAmount1) = amount0 == 0 || amount1 == 0
            ? (_token0Amount, _token1Amount)
            : _capWithFixedRatio(amount0, amount1, _token0Amount, _token1Amount);

        token0.transferFrom(msg.sender, address(this), provideAmount0);
        token1.transferFrom(msg.sender, address(this), provideAmount1);

        uint256 amountProvided0 = token0.balanceOf(address(this)) - amount0;
        uint256 amountProvided1 = token1.balanceOf(address(this)) - amount1;
        amount0 += amountProvided0;
        amount1 += amountProvided1;
        liquidityProvided[msg.sender] += _normalizeAmount(amountProvided0, amountProvided1, conversionRate);
    }

    function withdrawLiquidity() public hasSenderProvidedLiquidity {
        if (amount0 == 0 || amount1 == 0) {
            bool isToken0 = amount0 == 0;

            (IERC20 tokenOut, uint256 amountOut, uint256 withdrawAmount) = isToken0
                ? (token1, amount1, (liquidityProvided[msg.sender] * 10000) / conversionRate)
                : (token0, amount0, liquidityProvided[msg.sender]);
            // should not be triggered
            require(withdrawAmount <= amountOut, "CSAMM: Not enough tokens to be withdrawn");

            tokenOut.transfer(msg.sender, withdrawAmount);

            uint256 amountWithdrawn = amountOut - tokenOut.balanceOf(address(this));
            // could not use tokenOut here, as it won't write back
            if (isToken0) {
                amount1 -= amountWithdrawn;
            } else {
                amount0 -= amountWithdrawn;
            }
            liquidityProvided[msg.sender] -= isToken0
                ? _normalizeAmount(0, amountWithdrawn, conversionRate)
                : _normalizeAmount(amountWithdrawn, 0, conversionRate);

            return;
        }

        uint256 gcd = _gcd(amount0, amount1);

        uint256 ratio0 = amount0 / gcd;
        uint256 ratio1 = amount1 / gcd;

        // multiplier
        uint256 n = liquidityProvided[msg.sender] / (ratio0 + (conversionRate * ratio1) / 10000);

        uint256 withdrawAmount0 = ratio0 * n;
        uint256 withdrawAmount1 = ratio1 * n;
        token0.transfer(msg.sender, withdrawAmount0);
        token1.transfer(msg.sender, withdrawAmount1);

        uint256 amountWithdrawn0 = amount0 - token0.balanceOf(address(this));
        uint256 amountWithdrawn1 = amount1 - token1.balanceOf(address(this));
        amount0 -= amountWithdrawn0;
        amount1 -= amountWithdrawn1;
        liquidityProvided[msg.sender] -= _normalizeAmount(amountWithdrawn0, amountWithdrawn1, conversionRate);
    }
}
