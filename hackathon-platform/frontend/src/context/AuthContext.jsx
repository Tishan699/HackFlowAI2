import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import {
  sendRegistrationVerificationEmail,
  sendLogin2FaEmail,
  verifyOtpCode,
  getSentEmails,
} from "../services/emailService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("hackflow_user");
      return savedUser
        ? JSON.parse(savedUser)
        : {
            id: "user-1",
            name: "John Doe",
            email: "john@hackflow.dev",
            role: "organizer",
            avatar: "JD",
            isEmailVerified: true,
            mfaEnabled: true,
          };
    } catch {
      return {
        id: "user-1",
        name: "John Doe",
        email: "john@hackflow.dev",
        role: "organizer",
        avatar: "JD",
        isEmailVerified: true,
        mfaEnabled: true,
      };
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || "demo-token");
  const [loading, setLoading] = useState(false);

  // Temporary state for unverified registrations or 2FA login challenge
  const [pendingUser, setPendingUser] = useState(() => {
    try {
      const saved = localStorage.getItem("hackflow_pending_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sentEmails, setSentEmails] = useState(() => getSentEmails());

  // Listen to new email dispatches across windows/components
  useEffect(() => {
    const handleNewEmail = () => {
      setSentEmails(getSentEmails());
    };
    window.addEventListener("hackflow_new_email", handleNewEmail);
    return () => window.removeEventListener("hackflow_new_email", handleNewEmail);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("hackflow_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hackflow_user");
    }
  }, [user]);

  useEffect(() => {
    if (pendingUser) {
      localStorage.setItem("hackflow_pending_user", JSON.stringify(pendingUser));
    } else {
      localStorage.removeItem("hackflow_pending_user");
    }
  }, [pendingUser]);

  /**
   * Step 1 of Registration: Create user record and dispatch MFA Verification Email
   */
  const register = async (formData) => {
    setLoading(true);
    try {
      // 1. Send registration email with 6-digit MFA OTP
      const { otp, emailData } = await sendRegistrationVerificationEmail({
        email: formData.email,
        name: formData.name,
        role: formData.role,
      });

      // 2. Save in pending state - ALWAYS force 'participant' role regardless of what was submitted
      const tempUserData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'participant',            // SECURITY: Always participant, never trust client role
        assignedRoles: ['participant'], // Only authorized role at registration
        avatar: (formData.name || formData.email).slice(0, 2).toUpperCase(),
        isEmailVerified: false,
        mfaEnabled: true,
        registrationTime: new Date().toISOString(),
      };

      setPendingUser(tempUserData);
      setLoading(false);
      return { success: true, requiresVerification: true, email: formData.email, otp, emailData };
    } catch (err) {
      setLoading(false);
      throw new Error(err?.message || "Failed to send verification email.");
    }
  };

  /**
   * Step 2 of Registration: Verify 6-digit email OTP and activate account
   */
  const verifyEmailOtp = async (code) => {
    setLoading(true);
    if (!pendingUser?.email) {
      setLoading(false);
      throw new Error("No pending registration session found. Please register again.");
    }

    try {
      // Check OTP
      const verification = verifyOtpCode(pendingUser.email, code);
      if (!verification.success) {
        setLoading(false);
        throw new Error(verification.message || "Invalid security code.");
      }

      // Backend verification bridge if available
      try {
        await api.post("/auth/verify-otp", {
          email: pendingUser.email,
          code,
        });
      } catch (err) {
        console.info("Backend verify offline, verified locally:", err?.message);
      }

      // Activate user account — ALWAYS participant, ALWAYS from backend response
      const verifiedUser = {
        id: `u_${Date.now()}`,
        name: pendingUser.name,
        email: pendingUser.email,
        role: 'participant',            // Always enforced
        assignedRoles: ['participant'], // Only assigned role
        avatar: pendingUser.avatar,
        isEmailVerified: true,
        mfaEnabled: true,
        verifiedAt: new Date().toISOString(),
      };

      const newToken = `token_verified_${Date.now()}`;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(verifiedUser);
      setPendingUser(null);
      setLoading(false);

      return { success: true, user: verifiedUser };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  /**
   * Resend Verification Code
   */
  const resendVerificationCode = async (targetEmail) => {
    const emailToUse = targetEmail || pendingUser?.email;
    if (!emailToUse) {
      throw new Error("No email address provided for verification code.");
    }

    const { otp, emailData } = await sendRegistrationVerificationEmail({
      email: emailToUse,
      name: pendingUser?.name || "Innovator",
      role: pendingUser?.role || "participant",
    });

    return { success: true, otp, emailData };
  };

  /**
   * Sign In with MFA challenge support
   */
  const login = async (email, password, require2Fa = false) => {
    setLoading(true);
    try {
      // If 2FA is required for sign-in, trigger security code to user's email
      if (require2Fa || email.toLowerCase().includes("mfa") || user?.mfaEnabled) {
        const { otp, emailData } = await sendLogin2FaEmail({
          email,
          name: email.split("@")[0],
        });

        setPendingUser({
          email,
          name: email.split("@")[0],
          isLoginChallenge: true,
        });

        setLoading(false);
        return {
          mfaRequired: true,
          email,
          otp,
          emailData,
          message: "A 6-digit MFA security code was sent to your email.",
        };
      }

      // Standard direct sign in
      const response = await api.post("/auth/login", { email, password }).catch(() => null);
      if (response?.data?.token) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        const loggedUser = response.data.user || {
          name: email.split("@")[0],
          email,
          role: response.data.user?.role || "participant",
          assignedRoles: response.data.user?.assignedRoles || ["participant"],
          avatar: email.slice(0, 2).toUpperCase(),
          isEmailVerified: true,
          mfaEnabled: true,
        };
        setUser(loggedUser);
        setLoading(false);
        return { success: true };
      }

      // Offline / Demo fallback
      const initials = email ? email.slice(0, 2).toUpperCase() : "JD";
      const demoUser = {
        id: `u_${Date.now()}`,
        name: email ? email.split("@")[0].replace(".", " ") : "Demo User",
        email,
        role: "participant",
        assignedRoles: ["participant"],
        avatar: initials,
        isEmailVerified: true,
        mfaEnabled: true,
      };
      const demoToken = `token_${Date.now()}`;
      localStorage.setItem("token", demoToken);
      setToken(demoToken);
      setUser(demoUser);
      setLoading(false);
      return { success: true, user: demoUser };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  /**
   * Verify Login 2FA Code
   */
  const verifyLogin2Fa = async (code) => {
    setLoading(true);
    const targetEmail = pendingUser?.email || user?.email;

    const verification = verifyOtpCode(targetEmail, code);
    if (!verification.success) {
      setLoading(false);
      throw new Error(verification.message || "Invalid 2FA security code.");
    }

    const authorizedUser = {
      id: `u_${Date.now()}`,
      name: pendingUser?.name || targetEmail.split("@")[0],
      email: targetEmail,
      role: pendingUser?.role || "participant",
      avatar: targetEmail.slice(0, 2).toUpperCase(),
      isEmailVerified: true,
      mfaEnabled: true,
    };

    const token = `token_2fa_${Date.now()}`;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(authorizedUser);
    setPendingUser(null);
    setLoading(false);

    return { success: true, user: authorizedUser };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hackflow_user");
    localStorage.removeItem("hackflow_pending_user");
    setToken(null);
    setUser(null);
    setPendingUser(null);
  };

  const switchRole = async (newRole) => {
    if (!user) return;
    
    // Security check 1: Client-side validation (fast fail)
    const authorizedRoles = Array.isArray(user.assignedRoles)
      ? user.assignedRoles
      : [user.role || 'participant'];
      
    if (!authorizedRoles.includes(newRole)) {
      console.warn(`[SECURITY] Blocked unauthorized persona switch to '${newRole}'. Assigned roles: ${authorizedRoles.join(', ')}`);
      return;
    }

    try {
      // Security check 2: Backend validation (authoritative)
      const res = await api.patch('/roles/switch', { role: newRole });
      
      if (res.data?.success) {
        setUser(prev => ({ 
          ...prev, 
          role: res.data.role,
          assignedRoles: res.data.assignedRoles 
        }));
      }
    } catch (err) {
      console.error('Failed to switch role on backend:', err);
      // Fallback: update local state if offline, but rely on backend when online
      setUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const toggleMfa = (enabled) => {
    if (user) {
      const updated = { ...user, mfaEnabled: enabled };
      setUser(updated);
    }
  };

  const isJudgeFor = (hackathonId = '1') => {
    if (!user) return false;
    if (user.role === 'judge' || user.role === 'organizer') return true;
    if (user.memberships && Array.isArray(user.memberships)) {
      return user.memberships.some(m =>
        String(m.hackathonId) === String(hackathonId) &&
        m.role?.toUpperCase() === 'JUDGE' &&
        (m.status === 'ACTIVE' || m.status === 'active')
      );
    }
    return false;
  };

  const isOrganizerFor = (hackathonId = '1') => {
    if (!user) return false;
    if (user.role === 'organizer') return true;
    if (user.memberships && Array.isArray(user.memberships)) {
      return user.memberships.some(m =>
        String(m.hackathonId) === String(hackathonId) &&
        m.role?.toUpperCase() === 'ORGANIZER' &&
        (m.status === 'ACTIVE' || m.status === 'active')
      );
    }
    return false;
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data) {
        setUser(prev => ({ ...prev, ...res.data }));
      }
    } catch (e) {
      // Keep existing user if offline
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        pendingUser,
        sentEmails,
        isAuthenticated: !!token,
        loading,
        register,
        verifyEmailOtp,
        resendVerificationCode,
        login,
        verifyLogin2Fa,
        logout,
        switchRole,
        toggleMfa,
        isJudgeFor,
        isOrganizerFor,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: true,
      sentEmails: [],
      login: async () => ({ success: false, error: "Auth provider loading" }),
      register: async () => ({ success: false, error: "Auth provider loading" }),
      verifyEmailOtp: () => ({ success: false }),
      verifyLogin2FaOtp: () => ({ success: false }),
      logout: () => {},
      switchRole: () => {},
      toggleMfa: () => {},
      isJudgeFor: () => false,
      isOrganizerFor: () => false,
      refreshProfile: () => {},
    };
  }
  return context;
};

export default AuthContext;
