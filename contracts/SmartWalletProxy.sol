// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title SmartWalletProxy
 * @dev Proxy para permitir upgrades do contrato SmartWallet
 */
contract SmartWalletProxy is ERC1967Proxy {
    constructor(
        address _logic,
        bytes memory _data
    ) payable ERC1967Proxy(_logic, _data) {}
}
