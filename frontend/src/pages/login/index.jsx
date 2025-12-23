import React, { useEffect, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "../../config/redux/action/authActiion";

const LoginComponent = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLoginMethod, setIsLoginMethod] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const authState = useSelector((state) => state.auth);

  // Redirect after login
  useEffect(() => {
    if (authState.loggedIn) {
      document.cookie = `token=${authState.token || "12345"}; path=/`;

      router.replace("/dashboard");
    }
  }, [authState.loggedIn, router]);

  // Reset after successful register
  useEffect(() => {
    if (authState.isSuccess && !isLoginMethod) {
      setTimeout(() => {
        setUsername("");
        setName("");
        setEmail("");
        setPassword("");
        setIsLoginMethod(true);
      }, 2000);
    }
  }, [authState.isSuccess, isLoginMethod]);

  const handleLogin = (e) => {
    e?.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  const handleRegister = (e) => {
    e?.preventDefault();
    if (!username || !name || !email || !password) return;
    dispatch(registerUser({ username, name, email, password }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginMethod) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <UserLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-xl max-w-4xl w-full rounded-2xl border flex overflow-hidden">
          {/* LEFT FORM */}
          <div className="w-1/2 p-10">
            <h2 className="text-3xl font-bold text-blue-600 text-center">
              {isLoginMethod ? "Sign In" : "Sign Up"}
            </h2>

            {/* Message */}
            {authState.message && (
              <p
                className={`text-center mt-2 text-sm ${
                  authState.isError ? "text-red-600" : "text-green-600"
                }`}
              >
                {typeof authState.message === "string"
                  ? authState.message
                  : authState.message?.message}
              </p>
            )}

            <p className="text-center text-gray-500 text-sm mt-1">
              Welcome to Pro Connect
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLoginMethod && (
                <>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-3 border rounded-lg focus:outline-blue-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 border rounded-lg focus:outline-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg focus:outline-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg focus:outline-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={authState.isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:opacity-50"
              >
                {authState.isLoading
                  ? isLoginMethod
                    ? "Signing In..."
                    : "Signing Up..."
                  : isLoginMethod
                  ? "Sign In"
                  : "Sign Up"}
              </button>
            </form>
          </div>

          {/* RIGHT BLUE PANEL */}
          <div className="w-1/2 bg-[#004A99] flex items-center justify-center">
            <div className="text-center px-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                {isLoginMethod ? "Hello, Friend!" : "Welcome Back!"}
              </h2>

              <p className="text-white text-sm mb-6 opacity-90">
                {isLoginMethod
                  ? "Enter your personal details and start journey with us"
                  : "Login with your personal info to stay connected"}
              </p>

              <button
                onClick={() => setIsLoginMethod(!isLoginMethod)}
                className="bg-white text-[#004A99] font-semibold px-10 py-3 rounded-full hover:bg-gray-100 transition-all duration-300"
              >
                {isLoginMethod ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default LoginComponent;
