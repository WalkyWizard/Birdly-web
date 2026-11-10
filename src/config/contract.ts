export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "getPlans",
    "inputs": [],
    "outputs": [
      {
        "name": "result",
        "type": "tuple[]",
        "internalType": "struct BirdlySubscription.Plan[]",
        "components": [
          { "name": "id", "type": "uint256", "internalType": "uint256" },
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "price", "type": "uint256", "internalType": "uint256" },
          { "name": "duration", "type": "uint256", "internalType": "uint256" },
          { "name": "unlocksHistory", "type": "bool", "internalType": "bool" },
          { "name": "unlocksMultimodal", "type": "bool", "internalType": "bool" },
          { "name": "active", "type": "bool", "internalType": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSubscriptionStatus",
    "inputs": [{ "name": "user", "type": "address", "internalType": "address" }],
    "outputs": [
      { "name": "hasHistory", "type": "bool", "internalType": "bool" },
      { "name": "historyExpiresAt", "type": "uint256", "internalType": "uint256" },
      { "name": "hasMultimodal", "type": "bool", "internalType": "bool" },
      { "name": "multimodalExpiresAt", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasHistoryAccess",
    "inputs": [{ "name": "user", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasMultimodalAccess",
    "inputs": [{ "name": "user", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "subscribe",
    "inputs": [{ "name": "planId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "subscribeFor",
    "inputs": [
      { "name": "recipient", "type": "address", "internalType": "address" },
      { "name": "planId", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "cancelSubscription",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]
