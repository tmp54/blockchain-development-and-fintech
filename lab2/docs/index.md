# Solidity API

## CensorshipToken

### censor

```solidity
address censor
```

_Address that has ability to censor._

### master

```solidity
address master
```

_One with administrative privilege._

### blacklist

```solidity
mapping(address => bool) blacklist
```

_Blacklisted addresses._

### constructor

```solidity
constructor() public
```

### isMaster

```solidity
modifier isMaster()
```

_Check whether the sender is master._

### isValidAddress

```solidity
modifier isValidAddress(address _address)
```

_Check whether the address is not 0._

### changeMaster

```solidity
function changeMaster(address newMaster) external
```

_Change `master` to a new one.

Require sender to be master.
Require address not 0._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newMaster | address | New master to be set. |

### changeCensor

```solidity
function changeCensor(address newCensor) external
```

_Change `censor` to a new one.

Require sender to be master.
Require address not 0._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newCensor | address | New censor to be set. |

### setBlacklist

```solidity
function setBlacklist(address target, bool blacklisted) external
```

_Blacklist `target` address according to `blacklisted`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address to be blacklist/unblacklist. |
| blacklisted | bool | Whether to be blacklisted. |

### _update

```solidity
function _update(address from, address to, uint256 value) internal
```

_Override `_update` to check wherther the address is blacklisted before updating_

### clawBack

```solidity
function clawBack(address target, uint256 amount) external
```

_Claw back `amount` tokens from `target` address.

Require sender to be master._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address to be clawed back. |
| amount | uint256 | Amount to be clawed back. |

### mint

```solidity
function mint(address target, uint256 amount) public
```

_Mint `amount` tokens to `target` address.

Require sender to be master._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address to mint. |
| amount | uint256 | Amount to mint. |

### burn

```solidity
function burn(address target, uint256 amount) public
```

_Burn `amount` tokens from `target` address.

Require sender to be master._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | Address to burn. |
| amount | uint256 | Amount to burn. |

## MagicPot

### constructor

```solidity
constructor() public
```

### mt

```solidity
address mt
```

### theMagicPot

```solidity
function theMagicPot(address token, uint256 amount) external
```

