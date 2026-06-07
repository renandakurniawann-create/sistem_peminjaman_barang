import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { authService } from "../../services/authService.js";

export default function Register() {
  const [form, setForm] = useState({
    confirmPassword: "",
    email: "",
    fullName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      toast.error("Nama, email, dan password wajib diisi.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signUp(form);
      if (data.session) {
        toast.success("Register berhasil.");
        navigate("/", { replace: true });
      } else {
        toast.success("Register berhasil. Cek email jika konfirmasi diaktifkan.");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Register gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-workshop-600">Akun peminjam</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Register</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Akun baru otomatis memiliki role user. Role admin diatur dari Supabase.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="form-label" htmlFor="fullName">
            Nama lengkap
          </label>
          <input
            autoComplete="name"
            className="form-input"
            id="fullName"
            name="fullName"
            onChange={updateField}
            placeholder="Nama peminjam"
            type="text"
            value={form.fullName}
          />
        </div>

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
              autoComplete="new-password"
              className="form-input pr-11"
              id="password"
              name="password"
              onChange={updateField}
              placeholder="Minimal 6 karakter"
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

        <div>
          <label className="form-label" htmlFor="confirmPassword">
            Konfirmasi password
          </label>
          <input
            autoComplete="new-password"
            className="form-input"
            id="confirmPassword"
            name="confirmPassword"
            onChange={updateField}
            placeholder="Ulangi password"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
          />
        </div>

        <Button className="w-full" icon={UserPlus} loading={loading} type="submit">
          Register
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link className="font-semibold text-workshop-600 hover:text-workshop-500" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}
