import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

const BotUI = () => {
  const [chain, setChain] = useState("BSC");
  const [formData, setFormData] = useState({
    privateKey: "",
    collectionId: "",
    mintQuantity: 1,
    mintStage: "",
    contractAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Private key validation
    if (!formData.privateKey) {
      errors.privateKey = "Private key is required";
    } else if (formData.privateKey.length < 32) {
      errors.privateKey = "Private key appears to be too short";
    }

    // Chain-specific validations
    if (chain === "SUI") {
      if (!formData.collectionId) {
        errors.collectionId = "Collection ID is required";
      }
      if (!formData.mintStage) {
        errors.mintStage = "Mint stage is required";
      }
      if (formData.mintQuantity < 1 || formData.mintQuantity > 100) {
        errors.mintQuantity = "Mint quantity must be between 1 and 100";
      }
    } else {
      if (!formData.contractAddress) {
        errors.contractAddress = "Contract address is required";
      } else if (
        (chain === "BSC" || chain === "BASE") &&
        !formData.contractAddress.match(/^0x[a-fA-F0-9]{40}$/)
      ) {
        errors.contractAddress = "Invalid Ethereum address format";
      } else if (chain === "SOL" && formData.contractAddress.length < 32) {
        errors.contractAddress = "Invalid Solana address format";
      }

      if (formData.mintQuantity < 1 || formData.mintQuantity > 50) {
        errors.mintQuantity = "Mint quantity must be between 1 and 50";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getExplorerUrl = (txHash) => {
    const explorers = {
      BSC: `https://bscscan.com/tx/${txHash}`,
      BASE: `https://basescan.org/tx/${txHash}`,
      SOL: `https://solscan.io/tx/${txHash}`,
      SUI: `https://suiscan.xyz/mainnet/tx/${txHash}`,
    };
    return explorers[chain] || `#`;
  };

  const handleChainChange = (e) => {
    const selectedChain = e.target.value;
    setChain(selectedChain);
    setFormData({
      privateKey: "",
      collectionId: "",
      mintQuantity: 1,
      mintStage: "",
      contractAddress: "",
    });
    setResult(null);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || `HTTP error! status: ${res.status}`);
      }

      if (data.success) {
        setResult({
          type: "success",
          txHash: data.txHash,
          message: "NFT minted successfully!",
        });
        // Clear form on success
        setFormData({
          privateKey: "",
          collectionId: "",
          mintQuantity: 1,
          mintStage: "",
          contractAddress: "",
        });
      } else {
        setResult({
          type: "error",
          message: data.msg || "Minting failed",
          code: data.code,
        });
      }
    } catch (err) {
      console.error("Frontend Error:", err);
      let errorMessage = "Network error occurred. Please try again.";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage =
          "Unable to connect to server. Check your internet connection.";
      } else if (err.message.includes("timeout")) {
        errorMessage =
          "Request timed out. The network might be congested.";
      }

      setResult({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
  }) => (
    <div className='space-y-1'>
      <label className='block font-medium text-gray-700'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 text-black focus:ring-blue-500 ${
          validationErrors[name]
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        required={required}
      />
      {validationErrors[name] && (
        <p className='text-red-600 text-sm flex items-center gap-1'>
          <AlertCircle size={14} />
          {validationErrors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className='max-w-md mx-auto bg-white rounded-xl shadow-xl p-6 space-y-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          NFT Minting Bot
        </h2>
        <p className='text-gray-600'>
          Mint NFTs across multiple blockchains
        </p>
      </div>

      <div className='space-y-4'>
        <div className='space-y-1'>
          <label className='block font-medium text-gray-700'>
            Select Blockchain <span className='text-red-500'>*</span>
          </label>
          <select
            name='chain'
            value={chain}
            onChange={handleChainChange}
            className='w-full text-black p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='BSC'>Binance Smart Chain (BSC)</option>
            <option value='BASE'>Base Network</option>
            <option value='SOL'>Solana</option>
            <option value='SUI'>Sui Network</option>
          </select>
        </div>

        <InputField
          label='Private Key'
          name='privateKey'
          type='password'
          required
          placeholder='Enter your private key'
        />

        {chain === "SUI" ? (
          <>
            <InputField
              label='Collection ID'
              name='collectionId'
              required
              placeholder='Enter collection ID'
            />
            <InputField
              label='Mint Stage'
              name='mintStage'
              required
              placeholder='e.g., public, whitelist'
            />
            <InputField
              label='Mint Quantity'
              name='mintQuantity'
              type='number'
              required
            />
          </>
        ) : (
          <>
            <InputField
              label='Contract Address'
              name='contractAddress'
              required
              placeholder={
                chain === "SOL" ? "Solana program address" : "0x..."
              }
            />
            <InputField
              label='Mint Quantity'
              name='mintQuantity'
              type='number'
              required
            />
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className='animate-spin' size={20} />
              Minting...
            </>
          ) : (
            <>🚀 Mint NFT</>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            result.type === "success"
              ? "bg-green-50 border-green-400"
              : "bg-red-50 border-red-400"
          }`}
        >
          <div className='flex items-start gap-3'>
            {result.type === "success" ? (
              <CheckCircle className='text-green-600 mt-0.5' size={20} />
            ) : (
              <AlertCircle className='text-red-600 mt-0.5' size={20} />
            )}
            <div className='flex-1'>
              <p
                className={`font-semibold ${
                  result.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {result.type === "success" ? "Success!" : "Error"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  result.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {result.message || result.msg}
              </p>
              {result.txHash && (
                <a
                  href={getExplorerUrl(result.txHash)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  View Transaction <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className='text-xs text-gray-500 text-center'>
        <p>
          ⚠️ Never share your private keys. This bot does not store your
          credentials.
        </p>
      </div>
    </div>
  );
};

export default BotUI;
