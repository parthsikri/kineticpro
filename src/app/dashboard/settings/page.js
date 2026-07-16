import React from "react";
import { getSessionUser } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { Settings, CreditCard, User as UserIcon, Calendar } from "lucide-react";
import UpgradeButton from "../UpgradeButton";
import Link from "next/link";
import { PLANS } from "../../../lib/plans";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isActive = user.subscriptionStatus === "active";
  const isElite = isActive && user.subscriptionTier === "elite";
  const isPro = isActive && !isElite;

  const planKey = isElite ? "elite" : "pro";
  const plan = PLANS[planKey];
  const weeklyLimit = isActive ? plan.weeklyLimit : 0;

  const expiresAt = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Settings className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-muted">Manage your account and billing.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Account Section */}
        <div className="bg-charcoal border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold text-white">Account Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="bg-dark-gray border border-border rounded-lg p-3 text-off-white">
                {user.email}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Member Since</label>
              <div className="bg-dark-gray border border-border rounded-lg p-3 text-off-white">
                {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="bg-charcoal border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold text-white">Billing &amp; Subscription</h2>
          </div>
          <div className="p-6">
            {isActive ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium text-lg">{isElite ? "Kinetic Elite Plan" : "Kinetic Pro Plan"}</h3>
                    <p className="text-sm text-muted mt-1">
                      {isElite
                        ? `A/B testing with 3 simultaneous AI variations. ${weeklyLimit} thumbnails per week.`
                        : `${weeklyLimit} AI thumbnail generations per week.`}
                    </p>
                  </div>
                  <div className={`text-[10px] uppercase tracking-widest font-bold border py-1.5 px-4 rounded-full ${isElite ? "text-purple-400 border-purple-400/30 bg-purple-400/10" : "text-gold border-gold/30 bg-gold/10"}`}>
                    Active
                  </div>
                </div>

                {expiresAt && (
                  <div className="flex items-center gap-2 text-xs text-muted bg-white/5 rounded-lg p-3 border border-white/5">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Current billing cycle ends on <span className="text-off-white font-medium">{expiresAt}</span>. Renew before that date to keep access.</span>
                  </div>
                )}

                <div className="pt-4 border-t border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <span className="text-sm text-muted">Weekly usage: {user.proCreditsUsed || 0} / {weeklyLimit}</span>
                  <div className="flex gap-4 items-center w-full md:w-auto">
                    {isPro && (
                      <UpgradeButton tier="elite" className="text-xs uppercase tracking-widest font-bold text-purple-400 border border-purple-400/30 bg-charcoal px-4 py-2 rounded hover:bg-purple-400/10 transition-colors">
                        Upgrade to Elite
                      </UpgradeButton>
                    )}
                    <Link href="/dashboard/pricing" className="text-sm text-gold hover:underline font-medium">
                      View Plans
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium text-lg">Free Tier</h3>
                    <p className="text-sm text-muted mt-1">You are currently on the free tier. {user.credits > 0 ? `${user.credits} free credit remaining.` : "No free credits remaining."}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border flex gap-4">
                  <UpgradeButton tier="pro" className="premium-btn py-3 px-6 text-sm flex-1">
                    Pro (₹299/mo)
                  </UpgradeButton>
                  <UpgradeButton tier="elite" className="py-3 px-6 text-sm uppercase tracking-widest font-bold text-purple-400 border border-purple-400/30 rounded-lg hover:bg-purple-400/10 transition-colors flex-1">
                    Elite (₹299/mo)
                  </UpgradeButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
