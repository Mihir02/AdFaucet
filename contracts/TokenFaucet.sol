// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/Pausable.sol";

// /**
//  * @title TokenFaucet
//  * @dev Rate-limited token faucet with ad verification for Sepolia testnet
//  */
// contract TokenFaucet is Ownable, ReentrancyGuard, Pausable {
//     IERC20 public immutable token;

//     // Faucet configuration
//     uint256 public tokensPerRequest = 100 * 10 ** 18; // 100 tokens
//     uint256 public cooldownPeriod = 24 hours;
//     uint256 public maxDailyLimit = 1000 * 10 ** 18; // 1000 tokens per day total
//     uint256 public dailyDistributed;
//     uint256 public lastResetTime;

//     // User tracking
//     mapping(address => uint256) public lastRequestTime;
//     mapping(address => uint256) public totalClaimed;

//     // Ad verification
//     mapping(bytes32 => bool) public verifiedAds;
//     mapping(address => bytes32) public userAdHashes;

//     // Events
//     event TokensRequested(address indexed user, uint256 amount, bytes32 adHash);
//     event AdVerified(address indexed user, bytes32 adHash);
//     event FaucetConfigUpdated(uint256 tokensPerRequest, uint256 cooldownPeriod);
//     event EmergencyWithdraw(address indexed owner, uint256 amount);

//     // Errors
//     error InsufficientBalance();
//     error CooldownNotMet(uint256 timeRemaining);
//     error DailyLimitExceeded();
//     error AdNotVerified();
//     error InvalidAdHash();
//     error AlreadyClaimedToday();

//     constructor(address _token) Ownable(msg.sender) {
//         require(_token != address(0), "Invalid token address");
//         token = IERC20(_token);
//         lastResetTime = block.timestamp;
//     }

//     /**
//      * @dev Check if user can request tokens
//      */
//     function canRequestTokens(address user) external view returns (bool) {
//         if (paused()) return false;
//         if (block.timestamp < lastRequestTime[user] + cooldownPeriod)
//             return false;
//         if (dailyDistributed + tokensPerRequest > maxDailyLimit) return false;
//         if (token.balanceOf(address(this)) < tokensPerRequest) return false;
//         return true;
//     }

//     /**
//      * @dev Get time until user can make next request
//      */
//     function getNextRequestTime(address user) external view returns (uint256) {
//         uint256 nextTime = lastRequestTime[user] + cooldownPeriod;
//         return nextTime > block.timestamp ? nextTime : block.timestamp;
//     }

//     /**
//      * @dev Verify ad viewing and generate hash
//      */
//     function verifyAd(
//         address user,
//         uint256 timestamp,
//         uint256 duration
//     ) external returns (bytes32) {
//         require(duration >= 10, "Ad duration too short"); // Minimum 10 seconds
//         require(timestamp <= block.timestamp, "Invalid timestamp");
//         require(timestamp > block.timestamp - 300, "Timestamp too old"); // 5 minutes max

//         bytes32 adHash = keccak256(
//             abi.encodePacked(user, timestamp, duration, block.number)
//         );
//         verifiedAds[adHash] = true;
//         userAdHashes[user] = adHash;

//         emit AdVerified(user, adHash);
//         return adHash;
//     }

//     /**
//      * @dev Request tokens after ad verification
//      */
//     function requestTokens(bytes32 adHash) external nonReentrant whenNotPaused {
//         address user = msg.sender;

//         // Reset daily limit if needed
//         if (block.timestamp >= lastResetTime + 1 days) {
//             dailyDistributed = 0;
//             lastResetTime = block.timestamp;
//         }

//         // Validation checks
//         if (token.balanceOf(address(this)) < tokensPerRequest) {
//             revert InsufficientBalance();
//         }

//         if (block.timestamp < lastRequestTime[user] + cooldownPeriod) {
//             revert CooldownNotMet(
//                 lastRequestTime[user] + cooldownPeriod - block.timestamp
//             );
//         }

//         if (dailyDistributed + tokensPerRequest > maxDailyLimit) {
//             revert DailyLimitExceeded();
//         }

//         if (!verifiedAds[adHash] || userAdHashes[user] != adHash) {
//             revert AdNotVerified();
//         }

//         // Update state
//         lastRequestTime[user] = block.timestamp;
//         totalClaimed[user] += tokensPerRequest;
//         dailyDistributed += tokensPerRequest;

//         // Clear ad verification (one-time use)
//         verifiedAds[adHash] = false;
//         delete userAdHashes[user];

//         // Transfer tokens
//         require(
//             token.transfer(user, tokensPerRequest),
//             "Token transfer failed"
//         );

//         emit TokensRequested(user, tokensPerRequest, adHash);
//     }

//     /**
//      * @dev Update faucet configuration (owner only)
//      */
//     function updateConfig(
//         uint256 _tokensPerRequest,
//         uint256 _cooldownPeriod,
//         uint256 _maxDailyLimit
//     ) external onlyOwner {
//         require(_tokensPerRequest > 0, "Invalid tokens per request");
//         require(_cooldownPeriod >= 1 hours, "Cooldown too short");
//         require(_maxDailyLimit >= _tokensPerRequest, "Daily limit too low");

//         tokensPerRequest = _tokensPerRequest;
//         cooldownPeriod = _cooldownPeriod;
//         maxDailyLimit = _maxDailyLimit;

//         emit FaucetConfigUpdated(_tokensPerRequest, _cooldownPeriod);
//     }

//     /**
//      * @dev Pause/unpause faucet (owner only)
//      */
//     function pause() external onlyOwner {
//         _pause();
//     }

//     function unpause() external onlyOwner {
//         _unpause();
//     }

//     /**
//      * @dev Emergency withdraw tokens (owner only)
//      */
//     function emergencyWithdraw(uint256 amount) external onlyOwner {
//         require(
//             amount <= token.balanceOf(address(this)),
//             "Insufficient balance"
//         );
//         require(token.transfer(owner(), amount), "Transfer failed");
//         emit EmergencyWithdraw(owner(), amount);
//     }

//     /**
//      * @dev Get faucet statistics
//      */
//     function getFaucetStats()
//         external
//         view
//         returns (
//             uint256 balance,
//             uint256 distributed,
//             uint256 limit,
//             uint256 resetTime
//         )
//     {
//         return (
//             token.balanceOf(address(this)),
//             dailyDistributed,
//             maxDailyLimit,
//             lastResetTime + 1 days
//         );
//     }
// }
