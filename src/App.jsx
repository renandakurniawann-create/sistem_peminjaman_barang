import { Toaster } from "react-hot-toast";
import ConfigNotice from "./components/ConfigNotice.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ConfigNotice />
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.12)",
          },
        }}
      />
    </AuthProvider>
  );
}
