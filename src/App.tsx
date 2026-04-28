import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { CollectionRouteLayout } from "@/components/layout/CollectionRouteLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CollectionPage } from "@/pages/CollectionPage";
import { DownloadPage } from "@/pages/DownloadPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { SearchPage } from "@/pages/SearchPage";
import { MyLinksPage } from "@/pages/MyLinksPage";
import { CollectionsPage } from "@/pages/CollectionsPage";
import { HomeIcon } from "@/components/layout/nav/icons";
import { LoginPage } from "@/pages/auth/LoginPage";
import { EmailPasswordLoginPage } from "@/pages/auth/EmailPasswordLoginPage";
import { PasswordlessLoginPage } from "@/pages/auth/PasswordlessLoginPage";
import { CheckInboxPage } from "@/pages/auth/CheckInboxPage";
import { VerifyCodePage } from "@/pages/auth/VerifyCodePage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { SignUpEmailPage } from "@/pages/auth/SignUpEmailPage";
import { SignUpPasswordPage } from "@/pages/auth/SignUpPasswordPage";
import { SignUpUsernamePage } from "@/pages/auth/SignUpUsernamePage";
import { RegistrationSuccessPage } from "@/pages/auth/RegistrationSuccessPage";
import { VerificationCompletePage } from "@/pages/auth/VerificationCompletePage";
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage";
import { AccountPage } from "@/pages/account/AccountPage";
import { AccountNamePage } from "@/pages/account/AccountNamePage";
import { AccountUsernamePage } from "@/pages/account/AccountUsernamePage";
import { AccountEmailPage } from "@/pages/account/AccountEmailPage";
import { AccountPhonePage } from "@/pages/account/AccountPhonePage";
import { AccountLanguagePage } from "@/pages/account/AccountLanguagePage";
import { AccountPasswordPage } from "@/pages/account/AccountPasswordPage";
import { AccountTwoStepPage } from "@/pages/account/AccountTwoStepPage";
import { AccountSessionsPage } from "@/pages/account/AccountSessionsPage";
import { DeleteAccountPage } from "@/pages/account/DeleteAccountPage";
import { VideoAudioProvider } from "@/hooks/useVideoAudio";

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <VideoAudioProvider>
              <Toaster
                richColors
                position="top-center"
                theme="dark"
                toastOptions={{
                  classNames: {
                    toast:
                      "!bg-surface !border-neutral-800 !text-text !shadow-2xl",
                  },
                }}
              />
              <Routes>
                {/* Public marketing routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/download" element={<DownloadPage />} />
                </Route>

                {/* Auth flows */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/login/email"
                    element={<EmailPasswordLoginPage />}
                  />
                  <Route
                    path="/login/passwordless"
                    element={<PasswordlessLoginPage />}
                  />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/signup/email" element={<SignUpEmailPage />} />
                  <Route
                    path="/signup/password"
                    element={<SignUpPasswordPage />}
                  />
                  <Route
                    path="/signup/username"
                    element={<SignUpUsernamePage />}
                  />
                  <Route
                    path="/signup/success"
                    element={<RegistrationSuccessPage />}
                  />
                  <Route
                    path="/auth/check-inbox"
                    element={<CheckInboxPage />}
                  />
                  <Route path="/auth/verify" element={<VerifyCodePage />} />
                  <Route
                    path="/auth/verified"
                    element={<VerificationCompletePage />}
                  />
                  <Route
                    path="/auth/callback"
                    element={<OAuthCallbackPage />}
                  />
                </Route>

                {/* Authenticated app pages */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="/home"
                    element={
                      <PlaceholderPage
                        titleKey="tabBar.home"
                        Icon={HomeIcon}
                      />
                    }
                  />
                  <Route path="/links" element={<MyLinksPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/name" element={<AccountNamePage />} />
                  <Route
                    path="/account/username"
                    element={<AccountUsernamePage />}
                  />
                  <Route
                    path="/account/email"
                    element={<AccountEmailPage />}
                  />
                  <Route path="/account/phone" element={<AccountPhonePage />} />
                  <Route
                    path="/account/language"
                    element={<AccountLanguagePage />}
                  />
                  <Route
                    path="/account/password"
                    element={<AccountPasswordPage />}
                  />
                  <Route
                    path="/account/two-step"
                    element={<AccountTwoStepPage />}
                  />
                  <Route
                    path="/account/sessions"
                    element={<AccountSessionsPage />}
                  />
                  <Route
                    path="/account/delete"
                    element={<DeleteAccountPage />}
                  />
                </Route>

                {/* Public collection page (renders inside AppLayout when authed) */}
                <Route element={<CollectionRouteLayout />}>
                  <Route
                    path="/:username/:slug"
                    element={<CollectionPage />}
                  />
                </Route>

                {/* Catch-all */}
                <Route element={<Layout />}>
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </VideoAudioProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
