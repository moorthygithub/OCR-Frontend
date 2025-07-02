import UploadForm from "./components/UploadForm";
import toast, { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-100 p-6">
        <UploadForm />
      </div>
    </>
  );
}

export default App;
