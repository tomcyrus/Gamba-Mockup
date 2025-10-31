// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GambaBetting
 * @dev Secure betting contract for multi-game platform with provably fair outcomes
 * @notice This contract handles bets, payouts, and house edge management for various casino-style games
 */
contract GambaBetting is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Bet {
        address player;
        address token;
        uint256 wager;
        uint256[] betArray;
        uint256 nonce;
        uint256 timestamp;
        bool settled;
        uint256 resultIndex;
        uint256 payout;
    }

    struct Pool {
        uint256 liquidity;
        uint256 maxPayout;
        uint256 minWager;
        uint256 houseEdge;
    }

    mapping(bytes32 => Bet) public bets;
    mapping(address => Pool) public tokenPools;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public playerNonces;

    uint256 public platformFee = 100;
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MAX_BET_ARRAY_LENGTH = 100;
    
    address public platformWallet;
    address public randomProvider;

    event BetPlaced(
        bytes32 indexed betId,
        address indexed player,
        address indexed token,
        uint256 wager,
        uint256 nonce
    );

    event BetSettled(
        bytes32 indexed betId,
        address indexed player,
        uint256 resultIndex,
        uint256 payout,
        bool won
    );

    event PoolLiquidityAdded(
        address indexed token,
        uint256 amount,
        uint256 newLiquidity
    );

    event PoolLiquidityRemoved(
        address indexed token,
        uint256 amount,
        uint256 newLiquidity
    );

    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
        
        supportedTokens[address(0)] = true;
        tokenPools[address(0)] = Pool({
            liquidity: 0,
            maxPayout: 10 ether,
            minWager: 0.001 ether,
            houseEdge: 200
        });
    }

    function placeBet(
        address token,
        uint256 wager,
        uint256[] calldata betArray,
        bytes32 clientSeed
    ) external payable whenNotPaused nonReentrant returns (bytes32 betId) {
        require(supportedTokens[token], "Token not supported");
        require(betArray.length > 0 && betArray.length <= MAX_BET_ARRAY_LENGTH, "Invalid bet array");
        require(wager >= tokenPools[token].minWager, "Wager too low");

        Pool storage pool = tokenPools[token];
        
        uint256 maxMultiplier = _getMaxMultiplier(betArray);
        uint256 maxPossiblePayout = (wager * maxMultiplier) / FEE_DENOMINATOR;
        require(maxPossiblePayout <= pool.maxPayout, "Payout exceeds pool limit");
        require(maxPossiblePayout <= pool.liquidity, "Insufficient pool liquidity");

        if (token == address(0)) {
            require(msg.value == wager, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted for token bets");
            IERC20(token).safeTransferFrom(msg.sender, address(this), wager);
        }

        uint256 nonce = playerNonces[msg.sender]++;
        betId = keccak256(
            abi.encodePacked(
                msg.sender,
                token,
                wager,
                nonce,
                block.timestamp,
                clientSeed
            )
        );

        bets[betId] = Bet({
            player: msg.sender,
            token: token,
            wager: wager,
            betArray: betArray,
            nonce: nonce,
            timestamp: block.timestamp,
            settled: false,
            resultIndex: 0,
            payout: 0
        });

        emit BetPlaced(betId, msg.sender, token, wager, nonce);
        
        _settleBet(betId, clientSeed);
        
        return betId;
    }

    function _settleBet(bytes32 betId, bytes32 clientSeed) internal {
        Bet storage bet = bets[betId];
        require(!bet.settled, "Bet already settled");
        require(bet.player != address(0), "Bet does not exist");

        uint256 resultIndex = _generateRandomResult(
            betId,
            clientSeed,
            bet.betArray.length
        );

        bet.resultIndex = resultIndex;
        bet.settled = true;

        uint256 multiplier = bet.betArray[resultIndex];
        uint256 grossPayout = (bet.wager * multiplier) / FEE_DENOMINATOR;
        
        uint256 fee = (grossPayout * platformFee) / FEE_DENOMINATOR;
        uint256 netPayout = grossPayout > fee ? grossPayout - fee : 0;

        bet.payout = netPayout;

        Pool storage pool = tokenPools[bet.token];
        
        if (netPayout > bet.wager) {
            uint256 profit = netPayout - bet.wager;
            require(pool.liquidity >= profit, "Insufficient pool liquidity");
            pool.liquidity -= profit;
        } else if (bet.wager > netPayout) {
            uint256 loss = bet.wager - netPayout;
            pool.liquidity += loss;
        }

        if (netPayout > 0) {
            _transferPayout(bet.token, bet.player, netPayout);
        }

        if (fee > 0) {
            _transferPayout(bet.token, platformWallet, fee);
        }

        emit BetSettled(
            betId,
            bet.player,
            resultIndex,
            netPayout,
            netPayout > bet.wager
        );
    }

    function _generateRandomResult(
        bytes32 betId,
        bytes32 clientSeed,
        uint256 arrayLength
    ) internal view returns (uint256) {
        bytes32 randomHash = keccak256(
            abi.encodePacked(
                betId,
                clientSeed,
                block.prevrandao,
                block.timestamp,
                blockhash(block.number - 1)
            )
        );
        
        return uint256(randomHash) % arrayLength;
    }

    function _getMaxMultiplier(uint256[] calldata betArray) internal pure returns (uint256 max) {
        max = 0;
        for (uint256 i = 0; i < betArray.length; i++) {
            if (betArray[i] > max) {
                max = betArray[i];
            }
        }
        return max;
    }

    function _transferPayout(
        address token,
        address recipient,
        uint256 amount
    ) internal {
        if (token == address(0)) {
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }
    }

    function addLiquidity(address token, uint256 amount) 
        external 
        payable 
        onlyOwner 
    {
        require(supportedTokens[token], "Token not supported");
        
        Pool storage pool = tokenPools[token];
        
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
            pool.liquidity += amount;
        } else {
            require(msg.value == 0, "ETH not accepted");
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            pool.liquidity += amount;
        }
        
        emit PoolLiquidityAdded(token, amount, pool.liquidity);
    }

    function removeLiquidity(address token, uint256 amount) 
        external 
        onlyOwner 
    {
        Pool storage pool = tokenPools[token];
        require(pool.liquidity >= amount, "Insufficient liquidity");
        
        pool.liquidity -= amount;
        _transferPayout(token, msg.sender, amount);
        
        emit PoolLiquidityRemoved(token, amount, pool.liquidity);
    }

    function addSupportedToken(
        address token,
        uint256 maxPayout,
        uint256 minWager,
        uint256 houseEdge
    ) external onlyOwner {
        require(!supportedTokens[token], "Token already supported");
        require(houseEdge <= 1000, "House edge too high");
        
        supportedTokens[token] = true;
        tokenPools[token] = Pool({
            liquidity: 0,
            maxPayout: maxPayout,
            minWager: minWager,
            houseEdge: houseEdge
        });
    }

    function updatePoolSettings(
        address token,
        uint256 maxPayout,
        uint256 minWager,
        uint256 houseEdge
    ) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        require(houseEdge <= 1000, "House edge too high");
        
        Pool storage pool = tokenPools[token];
        pool.maxPayout = maxPayout;
        pool.minWager = minWager;
        pool.houseEdge = houseEdge;
    }

    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 500, "Fee too high");
        platformFee = _platformFee;
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid address");
        platformWallet = _platformWallet;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getBet(bytes32 betId) external view returns (Bet memory) {
        return bets[betId];
    }

    function getPoolInfo(address token) external view returns (Pool memory) {
        return tokenPools[token];
    }

    receive() external payable {
        tokenPools[address(0)].liquidity += msg.value;
    }
}
