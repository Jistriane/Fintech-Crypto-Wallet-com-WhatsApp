// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title LiquidityPool
 * @dev Contrato para gerenciamento de pools de liquidez
 */
contract LiquidityPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Eventos
    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    event Swap(
        address indexed user,
        uint256 amountIn,
        uint256 amountOut,
        address tokenIn,
        address tokenOut
    );

    // Estruturas
    struct Pool {
        IERC20 tokenA;
        IERC20 tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalSupply;
        uint256 fee; // em base 10000 (0.3% = 30)
    }

    // Estado
    Pool public pool;
    mapping(address => uint256) public balances;
    uint256 private constant MINIMUM_LIQUIDITY = 1000;

    // Modificadores
    modifier enoughLiquidity(uint256 amount) {
        require(amount > 0, "Insufficient liquidity");
        _;
    }

    /**
     * @dev Construtor
     * @param _tokenA Endereço do token A
     * @param _tokenB Endereço do token B
     * @param _fee Taxa da pool (base 10000)
     */
    constructor(
        address _tokenA,
        address _tokenB,
        uint256 _fee
    ) Ownable(msg.sender) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid tokens");
        require(_fee <= 1000, "Fee too high"); // Max 10%

        pool.tokenA = IERC20(_tokenA);
        pool.tokenB = IERC20(_tokenB);
        pool.fee = _fee;
    }

    /**
     * @dev Adiciona liquidez à pool
     * @param amountADesired Quantidade desejada do token A
     * @param amountBDesired Quantidade desejada do token B
     * @param amountAMin Quantidade mínima do token A
     * @param amountBMin Quantidade mínima do token B
     */
    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant whenNotPaused returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(amountADesired >= amountAMin && amountBDesired >= amountBMin, "Insufficient desired amount");
        require(amountADesired > 0 && amountBDesired > 0, "Invalid amounts");
        
        // Verificar saldos dos usuários
        require(pool.tokenA.balanceOf(msg.sender) >= amountADesired, "Insufficient tokenA balance");
        require(pool.tokenB.balanceOf(msg.sender) >= amountBDesired, "Insufficient tokenB balance");
        
        // Verificar allowances
        require(pool.tokenA.allowance(msg.sender, address(this)) >= amountADesired, "Insufficient tokenA allowance");
        require(pool.tokenB.allowance(msg.sender, address(this)) >= amountBDesired, "Insufficient tokenB allowance");

        if (pool.totalSupply == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
            liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            uint256 amountBOptimal = quote(amountADesired, pool.reserveA, pool.reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient B amount");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = quote(amountBDesired, pool.reserveB, pool.reserveA);
                require(amountAOptimal <= amountADesired, "Excessive A amount");
                require(amountAOptimal >= amountAMin, "Insufficient A amount");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
            liquidity = min(
                (amountA * pool.totalSupply) / pool.reserveA,
                (amountB * pool.totalSupply) / pool.reserveB
            );
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        pool.tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        pool.tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        pool.reserveA += amountA;
        pool.reserveB += amountB;
        _mint(msg.sender, liquidity);

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Remove liquidez da pool
     * @param liquidity Quantidade de tokens LP a queimar
     * @param amountAMin Quantidade mínima do token A
     * @param amountBMin Quantidade mínima do token B
     */
    function removeLiquidity(
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant whenNotPaused enoughLiquidity(liquidity) returns (uint256 amountA, uint256 amountB) {
        require(balances[msg.sender] >= liquidity, "Insufficient balance");
        require(liquidity > 0, "Invalid liquidity amount");
        require(amountAMin > 0 && amountBMin > 0, "Invalid minimum amounts");

        amountA = (liquidity * pool.reserveA) / pool.totalSupply;
        amountB = (liquidity * pool.reserveB) / pool.totalSupply;

        require(amountA >= amountAMin && amountB >= amountBMin, "Insufficient amounts");

        _burn(msg.sender, liquidity);
        pool.tokenA.safeTransfer(msg.sender, amountA);
        pool.tokenB.safeTransfer(msg.sender, amountB);

        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Executa swap de tokens
     * @param amountIn Quantidade de entrada
     * @param amountOutMin Quantidade mínima de saída
     * @param tokenIn Token de entrada
     * @param tokenOut Token de saída
     */
    function swap(
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(
            tokenIn == address(pool.tokenA) || tokenIn == address(pool.tokenB),
            "Invalid input token"
        );
        require(
            tokenOut == address(pool.tokenA) || tokenOut == address(pool.tokenB),
            "Invalid output token"
        );
        require(tokenIn != tokenOut, "Same tokens");
        require(amountIn > 0, "Invalid input amount");
        require(amountOutMin > 0, "Invalid minimum output");
        
        // Verificar saldo do usuário
        require(IERC20(tokenIn).balanceOf(msg.sender) >= amountIn, "Insufficient balance");
        
        // Verificar allowance
        require(IERC20(tokenIn).allowance(msg.sender, address(this)) >= amountIn, "Insufficient allowance");

        bool isTokenA = tokenIn == address(pool.tokenA);
        (uint256 reserveIn, uint256 reserveOut) = isTokenA
            ? (pool.reserveA, pool.reserveB)
            : (pool.reserveB, pool.reserveA);

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 amountInWithFee = amountIn * (10000 - pool.fee);
        amountOut = (amountInWithFee * reserveOut) / ((reserveIn * 10000) + amountInWithFee);

        require(amountOut >= amountOutMin, "Insufficient output amount");

        if (isTokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
            pool.tokenB.safeTransfer(msg.sender, amountOut);
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
            pool.tokenA.safeTransfer(msg.sender, amountOut);
        }

        emit Swap(msg.sender, amountIn, amountOut, tokenIn, tokenOut);
    }

    /**
     * @dev Calcula preço baseado nas reservas
     */
    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) public pure returns (uint256 amountB) {
        require(amountA > 0, "Insufficient amount");
        require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");
        amountB = (amountA * reserveB) / reserveA;
    }

    /**
     * @dev Calcula raiz quadrada (otimizado para gas)
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /**
     * @dev Retorna o menor valor
     */
    function min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }

    /**
     * @dev Mint de tokens LP
     */
    function _mint(address to, uint256 value) private {
        pool.totalSupply += value;
        balances[to] += value;
    }

    /**
     * @dev Burn de tokens LP
     */
    function _burn(address from, uint256 value) private {
        balances[from] -= value;
        pool.totalSupply -= value;
    }

    /**
     * @dev Pausa o contrato
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Despausa o contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
