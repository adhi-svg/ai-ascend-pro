import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const role = params.get("role");

        // Also parse user to maintain compatibility with existing context
        const userParam = params.get("user");

        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("auth_token", token);
            localStorage.setItem("role", role || "customer");

            if (userParam) {
                localStorage.setItem("user_info", userParam);
            }

            navigate("/");
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return <div>Signing you in...</div>;
}
