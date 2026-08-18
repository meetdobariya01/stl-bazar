import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("token", token);

      // Go directly to homepage and remove token from URL
      navigate("/", { replace: true });
      return;
    }

    if (error) {
      navigate("/login?error=google", { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }, [location.search, navigate]);

  return null;
};

export default OAuthSuccess;
