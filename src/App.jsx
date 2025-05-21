import BotUI from "./components/BotUI";
import SuccessMessage from "./components/SuccessMessage";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Stan's Sniper 🧠</h1>
      <BotUI />
      <SuccessMessage />
    </div>
  );
}
