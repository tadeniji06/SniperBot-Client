import { useState } from "react";

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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, ...formData }),
      });

      const data = await res.json();
      if (data.success) {
        setResult({ type: "success", txHash: data.txHash });
      } else {
        setResult({ type: "error", msg: data.msg || "Something went wrong" });
      }
    } catch (err) {
      console.error(err);
      setResult({ type: "error", msg: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 bg-white text-black p-6 rounded-xl max-w-md mx-auto shadow-xl'
    >
      <label className='block font-medium'>
        Select Chain:
        <select
          name='chain'
          value={chain}
          onChange={handleChainChange}
          className='mt-1 block w-full p-2 border rounded'
        >
          <option value='SUI'>SUI</option>
          <option value='BSC'>BSC</option>
          <option value='SOL'>SOL</option>
          <option value='BASE'>BASE</option>
        </select>
      </label>

      <label className='block font-medium'>
        Private Key:
        <input
          type='password'
          name='privateKey'
          value={formData.privateKey}
          onChange={handleChange}
          className='mt-1 block w-full p-2 border rounded'
          required
        />
      </label>

      {chain === "SUI" && (
        <>
          <label className='block font-medium'>
            Collection ID:
            <input
              type='text'
              name='collectionId'
              value={formData.collectionId}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border rounded'
              required
            />
          </label>

          <label className='block font-medium'>
            Mint Quantity:
            <input
              type='number'
              name='mintQuantity'
              min='1'
              value={formData.mintQuantity}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border rounded'
              required
            />
          </label>

          <label className='block font-medium'>
            Mint Stage:
            <input
              type='text'
              name='mintStage'
              value={formData.mintStage}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border rounded'
              required
            />
          </label>
        </>
      )}

      {(chain === "BSC" || chain === "SOL" || chain === "BASE") && (
        <>
          <label className='block font-medium'>
            Contract Address:
            <input
              type='text'
              name='contractAddress'
              value={formData.contractAddress}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border rounded'
              required
            />
          </label>

          <label className='block font-medium'>
            Mint Quantity:
            <input
              type='number'
              name='mintQuantity'
              min='1'
              value={formData.mintQuantity}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border rounded'
              required
            />
          </label>
        </>
      )}

      <button
        type='submit'
        className='mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition'
        disabled={loading}
      >
        {loading ? "⏳ Minting..." : "🔥 Mint Now"}
      </button>

      {result && (
        <div className='text-center mt-4'>
          {result.type === "success" ? (
            <div className='text-green-600 font-semibold'>
              ✅ Success! TX:{" "}
              <a
                href={`https://explorer.com/tx/${result.txHash}`}
                target='_blank'
                rel='noopener noreferrer'
                className='underline'
              >
                {result.txHash}
              </a>
            </div>
          ) : (
            <div className='text-red-600 font-semibold'>❌ {result.msg}</div>
          )}
        </div>
      )}
    </form>
  );
};

export default BotUI;
