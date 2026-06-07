import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { authService } from "../../services/authService.js";
import { profileService } from "../../services/profileService.js";

const loginConfig = {
  admin: {
    buttonText: "Login Admin",
    description: "Gunakan akun dengan role admin untuk masuk ke panel pengelolaan bengkel.",
    eyebrow: "Admin",
    invalidRoleMessage: "Akun ini bukan admin. Gunakan akun dengan role admin.",
    otherLinkLabel: "Masuk sebagai user",
    otherLinkTo: "/login",
    requiredRole: "admin",
    title: "Login Admin",
  },
  user: {
    buttonText: "Login User",
    description: "Gunakan akun peminjam untuk melihat barang dan mengajukan peminjaman.",
    eyebrow: "Peminjam",
    invalidRoleMessage: "Akun admin harus login lewat halaman admin.",
    otherLinkLabel: "Login admin",
    otherLinkTo: "/admin/login",
    requiredRole: "user",
    title: "Login User",
  },
};

export default function Login({ mode = "user" }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const config = loginConfig[mode] || loginConfig.user;

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await authService.signIn(form);
      const profile = await profileService.getProfileById(user.id);

      if (profile?.role !== config.requiredRole) {
        await authService.signOut();
        toast.error(config.invalidRoleMessage);
        return;
      }

      toast.success("Login berhasil.");

      const fallback = config.requiredRole === "admin" ? "/admin" : "/";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (error) {
      toast.error(error.message || "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-workshop-600">{config.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">{config.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {config.description}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="form-input"
            id="email"
            name="email"
            onChange={updateField}
            placeholder="nama@email.com"
            type="email"
            value={form.email}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              autoComplete="current-password"
              className="form-input pr-11"
              id="password"
              name="password"
              onChange={updateField}
              placeholder="Masukkan password"
              type={showPassword ? "text" : "password"}
              value={form.password}
            />
            <button
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <Button className="w-full" icon={LogIn} loading={loading} type="submit">
          {config.buttonText}
        </Button>
      </form>

      {mode === "user" ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link className="font-semibold text-workshop-600 hover:text-workshop-500" to="/register">
            Register
          </Link>
        </p>
      ) : null}

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link
          className="font-semibold text-workshop-600 hover:text-workshop-500"
          to={config.otherLinkTo}
        >
          {config.otherLinkLabel}
        </Link>
      </p>
    </div>
  );
}
