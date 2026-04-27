import { useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useAuth } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ChatPage from "@/pages/chat";
import ConversationsPage from "@/pages/conversations";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#2B3D4F",
    colorForeground: "#261E17",
    colorMutedForeground: "#7A8A97",
    colorDanger: "#c0392b",
    colorBackground: "#FAF9F5",
    colorInput: "#E8E2D8",
    colorInputForeground: "#261E17",
    colorNeutral: "#C8BFB0",
    fontFamily: "'Lato', sans-serif",
    borderRadius: "0.3rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#FAF9F5] rounded-xl w-[440px] max-w-full overflow-hidden shadow-md border border-[#DDD6C5]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-['Cormorant_Garamond',serif] text-[#261E17] text-2xl font-semibold",
    headerSubtitle: "text-[#7A8A97]",
    socialButtonsBlockButtonText: "text-[#261E17]",
    formFieldLabel: "text-[#261E17] font-medium",
    footerActionLink: "text-[#2B3D4F] font-semibold hover:text-[#AC9139]",
    footerActionText: "text-[#7A8A97]",
    dividerText: "text-[#7A8A97]",
    identityPreviewEditButton: "text-[#2B3D4F]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#261E17]",
    logoBox: "flex justify-center mb-1",
    logoImage: "w-14 h-14",
    socialButtonsBlockButton: "border-[#C8BFB0] bg-white hover:bg-[#F5F0E8] text-[#261E17]",
    formButtonPrimary: "bg-[#2B3D4F] hover:bg-[#3A5068] text-[#FAF9F5]",
    formFieldInput: "bg-[#F5F0E8] border-[#C8BFB0] text-[#261E17]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#DDD6C5]",
    alert: "border-[#C8BFB0]",
    otpCodeFieldInput: "border-[#C8BFB0] bg-[#F5F0E8]",
    formFieldRow: "mb-3",
    main: "px-6",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      qc.clear();
    }
    prevUserIdRef.current = userId ?? null;
  }, [userId, qc]);

  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-8">
        <img src={`${basePath}/logo.svg`} alt="L'Itinéraire" className="w-20 h-20 mx-auto mb-6" />
        <h1 className="font-serif text-5xl font-semibold text-primary mb-3">L'Itinéraire</h1>
        <p className="text-muted-foreground text-lg font-light tracking-wide mb-2">PARIS CONCIERGE</p>
        <p className="text-foreground/70 max-w-md mx-auto leading-relaxed mt-4">
          Your personal Paris travel expert. Plan a bespoke, day-by-day itinerary through conversation — neighbourhoods, restaurants, hidden gems, and everything in between.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`${basePath}/sign-up`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Start Planning
        </a>
        <a
          href={`${basePath}/sign-in`}
          className="inline-flex items-center justify-center rounded-md border border-border px-8 py-3 text-foreground font-medium hover:bg-accent transition-colors"
        >
          Sign In
        </a>
      </div>
      <p className="mt-12 text-muted-foreground text-sm italic">"Paris is always a good idea."</p>
    </div>
  );
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <ChatPage />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ConversationsRoute() {
  return (
    <>
      <Show when="signed-in">
        <ConversationsPage />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/conversations" component={ConversationsRoute} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bon retour",
            subtitle: "Sign in to continue planning your Paris trip",
          },
        },
        signUp: {
          start: {
            title: "Bonjour !",
            subtitle: "Create your account to start planning",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
