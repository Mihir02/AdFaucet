// 'use client'

// import { useState } from 'react'
// import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
// import { parseEther, formatEther } from 'viem'
// import { Coins, Clock, AlertCircle } from 'lucide-react'
// import { FAUCET_ABI, TOKEN_ABI } from '@/lib/contracts'
// import { FAUCET_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS } from '@/lib/wagmi'

// interface TokenFaucetProps {
//   adVerified: boolean
// }

// export function TokenFaucet({ adVerified }: TokenFaucetProps) {
//   const { address } = useAccount()
//   const [isRequesting, setIsRequesting] = useState(false)

//   const { writeContract, data: hash, error } = useWriteContract()
//   const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
//     hash,
//   })

//   // Check if user can request tokens
//   const { data: canRequest } = useReadContract({
//     address: FAUCET_CONTRACT_ADDRESS,
//     abi: FAUCET_ABI,
//     functionName: 'canRequestTokens',
//     args: address ? [address] : undefined,
//   })

//   // Get user's token balance
//   const { data: balance } = useReadContract({
//     address: TOKEN_CONTRACT_ADDRESS,
//     abi: TOKEN_ABI,
//     functionName: 'balanceOf',
//     args: address ? [address] : undefined,
//   })

//   // Get token symbol
//   const { data: symbol } = useReadContract({
//     address: TOKEN_CONTRACT_ADDRESS,
//     abi: TOKEN_ABI,
//     functionName: 'symbol',
//   })

//   const requestTokens = async () => {
//     if (!address || !adVerified) return

//     setIsRequesting(true)
//     try {
//       await writeContract({
//         address: FAUCET_CONTRACT_ADDRESS,
//         abi: FAUCET_ABI,
//         functionName: 'requestTokens',
//         args: [address],
//       })
//     } catch (err) {
//       console.error('Error requesting tokens:', err)
//     } finally {
//       setIsRequesting(false)
//     }
//   }

//   if (!address) {
//     return (
//       <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg text-center">
//         <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
//         <p className="text-gray-700">Please connect your wallet first</p>
//       </div>
//     )
//   }

//   if (!adVerified) {
//     return (
//       <div className="p-6 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
//         <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
//         <p className="text-yellow-800">Please watch the ad to continue</p>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6 bg-white border border-gray-300 rounded-lg">
//       <div className="text-center mb-6">
//         <Coins className="w-12 h-12 text-blue-600 mx-auto mb-4" />
//         <h3 className="text-xl font-semibold text-gray-800 mb-2">Claim Test Tokens</h3>

//         {balance && (
//           <p className="text-gray-600 mb-4">
//             Current Balance: {formatEther(balance as bigint)} {symbol || 'TEST'}
//           </p>
//         )}
//       </div>

//       {isSuccess && (
//         <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg">
//           <p className="text-green-800 text-center">
//             ✅ Tokens successfully sent to your wallet!
//           </p>
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
//           <p className="text-red-800 text-center">
//             ❌ Error: {error.message}
//           </p>
//         </div>
//       )}

//       <div className="text-center">
//         <button
//           onClick={requestTokens}
//           disabled={!canRequest || isRequesting || isConfirming}
//           className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//         >
//           {isRequesting || isConfirming ? (
//             'Processing...'
//           ) : canRequest === false ? (
//             'Rate Limited - Try Again Later'
//           ) : (
//             'Claim 100 TEST Tokens'
//           )}
//         </button>

//         <p className="text-sm text-gray-600 mt-3">
//           Limit: 1 request per 24 hours per address
//         </p>
//       </div>
//     </div>
//   )
// }
