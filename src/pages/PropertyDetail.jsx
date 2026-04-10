import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiMaximize2, FiCalendar, FiTrendingUp, FiUsers, FiDollarSign, FiGrid, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton } from 'react-share';
import { FaFacebook, FaTwitter, FaLinkedin, FaEthereum, FaWallet } from 'react-icons/fa';

function PropertyDetail() {
  const { id } = useParams();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [txStatus, setTxStatus] = useState({ type: '', message: '' });
  const [txResponse, setTxResponse] = useState(null);
  const [txForm, setTxForm] = useState({
    token: '',
    contractAddress: '0x0000000000000000000000000000000000000001',
    depositEth: '0.1',
    amountEth: '0.9',
    accepted: true,
  });
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

  const property = {
    id: parseInt(id),
    title: 'Modern Villa with Pool',
    price: {
      usd: 850000,
      eth: 425
    },
    location: 'Beverly Hills, CA',
    type: 'villa',
    roi: '7.2%',
    metrics: {
      totalInvestors: 142,
      funded: '89%',
      minInvestment: '$10',
      monthlyIncome: '$520',
      appreciation: '4.5%',
      rentalYield: '5.8%',
      totalReturn: '10.3%'
    },
    status: 'Active Investment',
    description: 'This stunning modern villa offers luxurious living spaces with high-end finishes throughout. The property has been tokenized for fractional ownership, allowing investors to participate in this premium real estate opportunity with as little as $10.',
    features: [
      'Swimming Pool',
      'Smart Home System',
      'Gourmet Kitchen',
      'Home Theater',
      'Wine Cellar',
      'Outdoor Kitchen',
      'Fire Pit',
      'Three-Car Garage'
    ],
    tokenDetails: {
      totalTokens: 85000,
      availableTokens: 9350,
      tokenPrice: '$10',
      tokenSymbol: 'VILLA425',
      contractAddress: '0x0000000000000000000000000000000000000001',
      blockchain: 'Ethereum'
    },
    financials: {
      grossRent: '$8,500/month',
      netRent: '$7,225/month',
      expenses: {
        management: '8%',
        maintenance: '5%',
        insurance: '2%',
        property_tax: '1.2%'
      },
      projectedAppreciation: '4.5% annually'
    },
    yearBuilt: 2020,
    parkingSpaces: 3,
    lotSize: '0.5 acres',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'
    ],
    agent: {
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john@realestate.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
    }
  };

  const shareUrl = window.location.href;

  const updateTxForm = (key, value) => {
    setTxForm((prev) => ({ ...prev, [key]: value }));
  };

  const executeTransactionAction = async (action) => {
    const contractAddress = txForm.contractAddress.trim();
    if (!txForm.token.trim()) {
      setTxStatus({ type: 'error', message: 'JWT token is required for protected endpoints.' });
      return;
    }

    if (!contractAddress) {
      setTxStatus({ type: 'error', message: 'Contract address is required.' });
      return;
    }

    const actions = {
      summary: { method: 'GET', path: `/api/transaction/${contractAddress}/summary` },
      sellerSign: { method: 'POST', path: `/api/transaction/${contractAddress}/seller-sign` },
      buyerSign: {
        method: 'POST',
        path: `/api/transaction/${contractAddress}/buyer-sign`,
        body: { depositEth: txForm.depositEth },
      },
      realtorReview: {
        method: 'POST',
        path: `/api/transaction/${contractAddress}/realtor-review`,
        body: { accepted: txForm.accepted },
      },
      buyerFinalize: {
        method: 'POST',
        path: `/api/transaction/${contractAddress}/buyer-finalize`,
        body: { amountEth: txForm.amountEth },
      },
      withdraw: { method: 'POST', path: `/api/transaction/${contractAddress}/withdraw` },
    };

    const config = actions[action];
    if (!config) {
      setTxStatus({ type: 'error', message: 'Unsupported action' });
      return;
    }

    setIsTxLoading(true);
    setTxStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${apiBaseUrl}${config.path}`, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${txForm.token.trim()}`,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setTxResponse(data);
      setTxStatus({ type: 'success', message: 'Action completed successfully.' });
    } catch (error) {
      setTxStatus({ type: 'error', message: error.message || 'Unexpected error' });
      setTxResponse(null);
    } finally {
      setIsTxLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Navigation */}
      <div className="bg-white shadow">
        <div className="container py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-secondary-600 hover:text-primary-600">Home</Link>
            <span className="text-secondary-400">/</span>
            <Link to="/properties" className="text-secondary-600 hover:text-primary-600">Properties</Link>
            <span className="text-secondary-400">/</span>
            <span className="text-primary-600">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="h-96 rounded-lg overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {property.images.slice(1).map((image, index) => (
                  <div key={index} className="h-32 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${property.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Property Details</h2>
              <p className="text-secondary-600 mb-6">{property.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  {/* <FiBed className="text-primary-600" /> */}
                  <span>{property.parkingSpaces} Parking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMaximize2 className="text-primary-600" />
                  <span>{property.lotSize}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-primary-600" />
                  <span>Built {property.yearBuilt}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiUsers className="text-primary-600" />
                  <span>{property.metrics.totalInvestors} Investors</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FiHome className="text-primary-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Token Details */}
              <h3 className="text-xl font-semibold mb-4">Token Information</h3>
              <div className="bg-secondary-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-600">Token Symbol</p>
                    <p className="font-semibold">{property.tokenDetails.tokenSymbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Token Price</p>
                    <p className="font-semibold">{property.tokenDetails.tokenPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Available Tokens</p>
                    <p className="font-semibold">{property.tokenDetails.availableTokens.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Total Supply</p>
                    <p className="font-semibold">{property.tokenDetails.totalTokens.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-secondary-600">Smart Contract</p>
                    <p className="font-mono text-sm">{property.tokenDetails.contractAddress}</p>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Rental Income</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Gross Rent</span>
                      <span className="font-medium">{property.financials.grossRent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Net Rent</span>
                      <span className="font-medium">{property.financials.netRent}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Expenses</h4>
                  <div className="space-y-2">
                    {Object.entries(property.financials.expenses).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-secondary-600">{key.replace('_', ' ').charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Investment Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-secondary-500">Investment Price</p>
                  <div className="flex items-center">
                    <FiDollarSign className="text-primary-600" />
                    <span className="text-2xl font-bold">${property.price.usd.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-primary-600">
                    <FaEthereum className="mr-1" />
                    <span>{property.price.eth} ETH</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500">Annual ROI</p>
                  <div className="flex items-center justify-end text-green-600">
                    <FiTrendingUp className="mr-1" />
                    <span className="text-2xl font-bold">{property.roi}</span>
                  </div>
                </div>
              </div>

              {/* Investment Metrics */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Rental Yield</span>
                  <span className="font-medium">{property.metrics.rentalYield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Appreciation</span>
                  <span className="font-medium">{property.metrics.appreciation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Total Return</span>
                  <span className="font-medium text-green-600">{property.metrics.totalReturn}</span>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Funding Progress</span>
                  <span className="font-medium">{property.metrics.funded}</span>
                </div>
                <div className="w-full bg-secondary-100 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: property.metrics.funded }}
                  />
                </div>
                <p className="text-sm text-secondary-500 mt-1">
                  Min Investment: {property.metrics.minInvestment}
                </p>
              </div>
              
              <Link
                to={`/property-3d/${id}`}
                className="btn w-full mb-4 flex items-center justify-center">
                <FiGrid className="mr-2" />
                View 3D Model
              </Link>

              <button
                onClick={() => setIsTxModalOpen(true)}
                className="btn w-full mb-4 flex items-center justify-center"
              >
                <FaWallet className="mr-2" />
                Connect Wallet to Test Transaction
              </button>
              
              <div className="flex items-center justify-center space-x-4 pt-4 border-t">
                <FacebookShareButton url={shareUrl}>
                  <FaFacebook className="text-2xl text-blue-600 hover:opacity-80" />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl}>
                  <FaTwitter className="text-2xl text-sky-500 hover:opacity-80" />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl}>
                  <FaLinkedin className="text-2xl text-blue-700 hover:opacity-80" />
                </LinkedinShareButton>
              </div>
            </div>

            {/* Agent Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={property.agent.image}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{property.agent.name}</h3>
                  <p className="text-sm text-secondary-600">Investment Advisor</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {property.agent.phone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {property.agent.email}
                </p>
              </div>
              <button className="btn-secondary w-full mt-4">
                Schedule Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-sapphire-100">
            <div className="px-6 py-4 bg-gradient-to-r from-sapphire-800 to-primary-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Transaction Test Lab</h3>
                <p className="text-sapphire-100 text-sm">Run a simulated property transaction flow against backend APIs.</p>
              </div>
              <button
                className="rounded-lg p-2 hover:bg-white/10"
                onClick={() => setIsTxModalOpen(false)}
                aria-label="Close transaction modal"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-secondary-700">JWT Token</span>
                  <textarea
                    rows={3}
                    value={txForm.token}
                    onChange={(e) => updateTxForm('token', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-secondary-200 p-2 text-sm"
                    placeholder="Paste Bearer token here"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-secondary-700">Contract Address</span>
                  <input
                    type="text"
                    value={txForm.contractAddress}
                    onChange={(e) => updateTxForm('contractAddress', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-secondary-200 p-2 text-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-secondary-700">Deposit (ETH)</span>
                  <input
                    type="text"
                    value={txForm.depositEth}
                    onChange={(e) => updateTxForm('depositEth', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-secondary-200 p-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-secondary-700">Finalize amount (ETH)</span>
                  <input
                    type="text"
                    value={txForm.amountEth}
                    onChange={(e) => updateTxForm('amountEth', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-secondary-200 p-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-secondary-700">Realtor review</span>
                  <select
                    value={txForm.accepted ? 'accepted' : 'rejected'}
                    onChange={(e) => updateTxForm('accepted', e.target.value === 'accepted')}
                    className="mt-1 w-full rounded-lg border border-secondary-200 p-2 text-sm"
                  >
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="btn" onClick={() => executeTransactionAction('summary')} disabled={isTxLoading}>Load Summary</button>
                <button className="btn" onClick={() => executeTransactionAction('sellerSign')} disabled={isTxLoading}>Seller Sign</button>
                <button className="btn" onClick={() => executeTransactionAction('buyerSign')} disabled={isTxLoading}>Buyer Deposit</button>
                <button className="btn" onClick={() => executeTransactionAction('realtorReview')} disabled={isTxLoading}>Realtor Review</button>
                <button className="btn" onClick={() => executeTransactionAction('buyerFinalize')} disabled={isTxLoading}>Buyer Finalize</button>
                <button className="btn-secondary" onClick={() => executeTransactionAction('withdraw')} disabled={isTxLoading}>Withdraw</button>
              </div>

              {txStatus.message && (
                <div className={`rounded-lg px-4 py-3 text-sm flex items-center ${txStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {txStatus.type === 'success' ? <FiCheckCircle className="mr-2" /> : <FiAlertCircle className="mr-2" />}
                  {txStatus.message}
                </div>
              )}

              <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4">
                <p className="text-sm font-semibold text-secondary-700 mb-2">Response payload</p>
                <pre className="text-xs text-secondary-700 overflow-x-auto whitespace-pre-wrap">
{txResponse ? JSON.stringify(txResponse, null, 2) : 'No response yet. Run one of the actions above.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;