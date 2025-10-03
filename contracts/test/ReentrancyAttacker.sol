// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../SmartWalletV2.sol";

contract ReentrancyAttacker {
    SmartWalletV2 public smartWallet;
    uint256 public count;

    constructor(address payable _smartWallet) {
        smartWallet = SmartWalletV2(_smartWallet);
    }

    // Função de fallback para tentar reentrância
    receive() external payable {
        if (count < 10) {
            count++;
            // Tenta reentrar
            smartWallet.transferNative(payable(address(this)), "");
        }
    }

    function attack() external payable {
        // Cria carteira
        smartWallet.createWallet(1 ether, 1);
        
        // Tenta transferência para iniciar ataque
        smartWallet.transferNative(payable(address(this)), "");
    }
}
