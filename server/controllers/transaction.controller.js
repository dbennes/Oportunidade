const {
  stateMap,
  getProvider,
  getContract,
  getWalletFromEnv,
  parseEth,
  formatEth,
} = require('../providers/transaction.provider');

const getSummary = async (req, res) => {
  try {
    const provider = getProvider();
    const contract = getContract(req.params.contractAddress, provider);

    const [
      contractState,
      realtor,
      seller,
      buyer,
      homeAddress,
      zip,
      city,
      realtorFee,
      price,
      deposit,
      finalizeDeadline,
    ] = await Promise.all([
      contract.contractState(),
      contract.realtor(),
      contract.seller(),
      contract.buyer(),
      contract.homeAddress(),
      contract.zip(),
      contract.city(),
      contract.realtorFee(),
      contract.price(),
      contract.deposit(),
      contract.finalizeDeadline(),
    ]);

    return res.status(200).json({
      contractAddress: req.params.contractAddress,
      stateCode: Number(contractState),
      stateLabel: stateMap[Number(contractState)] || 'Unknown',
      participants: { realtor, seller, buyer },
      details: {
        homeAddress,
        zip,
        city,
        realtorFeeEth: formatEth(realtorFee),
        priceEth: formatEth(price),
        depositEth: formatEth(deposit),
        finalizeDeadline: Number(finalizeDeadline),
      },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const sellerSignContract = async (req, res) => {
  try {
    const provider = getProvider();
    const sellerWallet = getWalletFromEnv('SELLER_PRIVATE_KEY', provider);
    const contract = getContract(req.params.contractAddress, sellerWallet);

    const tx = await contract.sellerSignContract();
    const receipt = await tx.wait();
    return res.status(200).json({ message: 'Seller signed', txHash: receipt.transactionHash });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const buyerSignAndPayDeposit = async (req, res) => {
  try {
    const { depositEth } = req.body;
    if (!depositEth) {
      return res.status(400).json({ message: 'depositEth is required' });
    }

    const provider = getProvider();
    const buyerWallet = getWalletFromEnv('BUYER_PRIVATE_KEY', provider);
    const contract = getContract(req.params.contractAddress, buyerWallet);

    const tx = await contract.buyerSignContractAndPayDeposit({
      value: parseEth(String(depositEth)),
    });
    const receipt = await tx.wait();
    return res.status(200).json({ message: 'Buyer signed and paid deposit', txHash: receipt.transactionHash });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const realtorReview = async (req, res) => {
  try {
    if (typeof req.body.accepted !== 'boolean') {
      return res.status(400).json({ message: 'accepted (boolean) is required' });
    }

    const provider = getProvider();
    const realtorWallet = getWalletFromEnv('REALTOR_PRIVATE_KEY', provider);
    const contract = getContract(req.params.contractAddress, realtorWallet);

    const tx = await contract.realtorReviewedClosingConditions(req.body.accepted);
    const receipt = await tx.wait();
    return res.status(200).json({ message: 'Realtor review submitted', txHash: receipt.transactionHash });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const buyerFinalize = async (req, res) => {
  try {
    const { amountEth } = req.body;
    if (!amountEth) {
      return res.status(400).json({ message: 'amountEth is required' });
    }

    const provider = getProvider();
    const buyerWallet = getWalletFromEnv('BUYER_PRIVATE_KEY', provider);
    const contract = getContract(req.params.contractAddress, buyerWallet);

    const tx = await contract.buyerFinalizeTransaction({
      value: parseEth(String(amountEth)),
    });
    const receipt = await tx.wait();
    return res.status(200).json({ message: 'Buyer finalized transaction', txHash: receipt.transactionHash });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const withdraw = async (req, res) => {
  try {
    const provider = getProvider();
    const buyerWallet = getWalletFromEnv('BUYER_PRIVATE_KEY', provider);
    const contract = getContract(req.params.contractAddress, buyerWallet);

    const tx = await contract.anyWithdrawFromTransaction();
    const receipt = await tx.wait();
    return res.status(200).json({ message: 'Withdraw executed', txHash: receipt.transactionHash });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getSummary,
  sellerSignContract,
  buyerSignAndPayDeposit,
  realtorReview,
  buyerFinalize,
  withdraw,
};
