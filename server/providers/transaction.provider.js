const { ethers } = require('ethers');

const transactionAbi = [
  'function contractState() view returns (uint8)',
  'function realtor() view returns (address)',
  'function seller() view returns (address)',
  'function buyer() view returns (address)',
  'function homeAddress() view returns (string)',
  'function zip() view returns (string)',
  'function city() view returns (string)',
  'function realtorFee() view returns (uint256)',
  'function price() view returns (uint256)',
  'function deposit() view returns (uint256)',
  'function finalizeDeadline() view returns (uint256)',
  'function sellerSignContract() payable',
  'function buyerSignContractAndPayDeposit() payable',
  'function realtorReviewedClosingConditions(bool accepted)',
  'function buyerFinalizeTransaction() payable',
  'function anyWithdrawFromTransaction()',
];

const stateMap = {
  0: 'WaitingSellerSignature',
  1: 'WaitingBuyerSignature',
  2: 'WaitingRealtorReview',
  3: 'WaitingFinalization',
  4: 'Finalized',
  5: 'Rejected',
};

const getProvider = () => {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

const getContract = (contractAddress, signerOrProvider) => {
  return new ethers.Contract(contractAddress, transactionAbi, signerOrProvider);
};

const getWalletFromEnv = (keyName, provider) => {
  const privateKey = process.env[keyName];
  if (!privateKey) {
    throw new Error(`${keyName} is required in environment variables`);
  }

  return new ethers.Wallet(privateKey, provider);
};

module.exports = {
  stateMap,
  getProvider,
  getContract,
  getWalletFromEnv,
  parseEth: ethers.utils.parseEther,
  formatEth: ethers.utils.formatEther,
};
