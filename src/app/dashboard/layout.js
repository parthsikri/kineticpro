import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { getSessionUser } from "../../lib/auth";
import LogoutButton from "./LogoutButton";
import UpgradeButton from "./UpgradeButton";
import SidebarNav from "./components/SidebarNav";

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const isActive = user.subscriptionStatus === "active";
  const isElite = isActive && user.subscriptionTier === "elite";
  const isPro = isActive && !isElite;
  const hasCredits = user.credits > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-gray">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-charcoal flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="font-semibold text-xl tracking-widest uppercase brand-title block">
            KINETIC <span className="text-gold font-light">PRO</span>
          </Link>
        </div>
        
        {/* Nav Links */}
        <SidebarNav />

        {/* User Status / Upgrade */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            {!isActive ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Free Credits</span>
                  <span className="font-bold text-white">{user.credits}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: `${(user.credits / 1) * 100}%` }}></div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <UpgradeButton tier="pro" className="w-full text-[10px] uppercase tracking-widest font-bold bg-gold text-black py-2 rounded hover:bg-yellow-400 transition-colors">
                    Upgrade to Pro
                  </UpgradeButton>
                  <UpgradeButton tier="elite" className="w-full text-[10px] uppercase tracking-widest font-bold bg-charcoal border border-purple-400/30 text-purple-400 py-2 rounded hover:bg-purple-400/10 transition-colors">
                    Upgrade to Elite
                  </UpgradeButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`text-[10px] uppercase tracking-widest font-bold border py-1 px-3 rounded-full ${isElite ? 'text-purple-400 border-purple-400/30 bg-purple-400/10' : 'text-gold border-gold/30 bg-gold/10'}`}>
                    {isElite ? 'Elite Member' : 'Pro Member'}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mt-3">
                  <span className="text-muted">Weekly Limit</span>
                  <span className="font-bold text-white">{21 - (user.proCreditsUsed || 0)} / 21</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${isElite ? 'bg-purple-400' : 'bg-gold'}`} style={{ width: `${((21 - (user.proCreditsUsed || 0)) / 21) * 100}%` }}></div>
                </div>
                {isPro && (
                  <UpgradeButton tier="elite" className="w-full text-[9px] uppercase tracking-widest font-bold bg-charcoal text-purple-400 border border-purple-400/30 py-1.5 rounded hover:bg-purple-400/10 transition-colors mt-2">
                    Upgrade to Elite
                  </UpgradeButton>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted truncate max-w-[120px]">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {(!isActive && !hasCredits) ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full p-8 rounded-2xl bg-charcoal border border-border text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/20 text-gold text-2xl font-serif italic">
                Pro
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Upgrade to Continue</h2>
                <p className="text-sm text-muted">You've used your free trial. Upgrade to Kinetic Pro to unlock 21 thumbnails per week.</p>
              </div>
              <div className="space-y-3">
                <UpgradeButton tier="pro" className="premium-btn w-full py-4">
                  Pro for ₹299/month
                </UpgradeButton>
                <UpgradeButton tier="elite" className="w-full py-3 text-xs uppercase tracking-widest font-bold text-purple-400 border border-purple-400/30 rounded-lg hover:bg-purple-400/10 transition-colors">
                  Elite (A/B Test) for ₹999/month
                </UpgradeButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 pb-20 max-w-7xl mx-auto w-full">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
