"use client";

import { useState, useEffect } from "react";


import { Settings, Key, Shield, Globe, Save, Loader2, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

interface UserSettings {
  godaddy_key: string;
  godaddy_secret: string;
  porkbun_key: string;
  porkbun_secret: string;
  namecom_user: string;
  namecom_token: string;
  namecheap_user: string;
  namecheap_key: string;
  dynadot_key: string;
  cloudflare_key: string;
  cloudflare_email: string;
  preferred_currency: string;
}

export default function SettingsPage() {
  const { sessionToken } = useAppStore();
  const [settings, setSettings] = useState<UserSettings>({
    godaddy_key: "",
    godaddy_secret: "",
    porkbun_key: "",
    porkbun_secret: "",
    namecom_user: "",
    namecom_token: "",
    namecheap_user: "",
    namecheap_key: "",
    dynadot_key: "",
    cloudflare_key: "",
    cloudflare_email: "",
    preferred_currency: "USD",
  });




  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!sessionToken) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/user/settings`, {
      headers: { Authorization: `Bearer ${sessionToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [sessionToken]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/user/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {

      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/user/settings/test-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          godaddy_key: settings.godaddy_key,
          godaddy_secret: settings.godaddy_secret
        })
      });
      
      if (res.ok) {
        toast.success("GoDaddy API connected successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Connection failed");
      }
    } catch {

      toast.error("Network error");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {

    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="font-mono text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-zinc-600" />
          Settings
          <span className="ml-2 text-zinc-600">- Infrastructure & API</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          Configure external data providers for real-time market intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* GoDaddy API */}
          <Card className="bg-zinc-900/40 border-zinc-800/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <Key className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">GoDaddy API Integration</CardTitle>
                  <CardDescription className="text-[10px] font-mono">Get live pricing for premium domains like hey.co.za</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-zinc-500">API Key</label>
                <Input
                  type="password"
                  value={settings.godaddy_key}
                  onChange={(e) => setSettings({ ...settings, godaddy_key: e.target.value })}
                  placeholder="Enter GoDaddy API Key"
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-zinc-500">API Secret</label>
                <Input
                  type="password"
                  value={settings.godaddy_secret}
                  onChange={(e) => setSettings({ ...settings, godaddy_secret: e.target.value })}
                  placeholder="Enter GoDaddy API Secret"
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTesting || !settings.godaddy_key}
                  className="h-8 font-mono text-[10px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5 hover:text-emerald-300"
                >
                  {isTesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Globe className="h-3 w-3 mr-2" />}
                  Verify Credentials
                </Button>
              </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                  <Globe className="h-3 w-3 text-pink-400" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">Porkbun API</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">API Key (PK...)</label>
                  <Input 
                    placeholder="Enter Porkbun API Key" 
                    value={settings.porkbun_key}
                    onChange={(e) => setSettings({ ...settings, porkbun_key: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Secret Key (SK...)</label>
                  <Input 
                    type="password"
                    placeholder="Enter Secret Key" 
                    value={settings.porkbun_secret}
                    onChange={(e) => setSettings({ ...settings, porkbun_secret: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* Name.com API */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Globe className="h-3 w-3 text-blue-400" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">Name.com API</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Username</label>
                  <Input 
                    placeholder="Enter Name.com Username" 
                    value={settings.namecom_user}
                    onChange={(e) => setSettings({ ...settings, namecom_user: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">API Token</label>
                  <Input 
                    type="password"
                    placeholder="Enter API Token" 
                    value={settings.namecom_token}
                    onChange={(e) => setSettings({ ...settings, namecom_token: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* Cloudflare API */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Globe className="h-3 w-3 text-orange-400" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">Cloudflare API</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Email (for Global Key)</label>
                  <Input 
                    placeholder="Enter Cloudflare Email" 
                    value={settings.cloudflare_email}
                    onChange={(e) => setSettings({ ...settings, cloudflare_email: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Global Key / Token</label>
                  <Input 
                    type="password"
                    placeholder="Enter Cloudflare Key" 
                    value={settings.cloudflare_key}
                    onChange={(e) => setSettings({ ...settings, cloudflare_key: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
            </div>



            {/* Namecheap API */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-orange-600/10 flex items-center justify-center border border-orange-600/20">
                  <Globe className="h-3 w-3 text-orange-500" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">Namecheap API</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Username</label>
                  <Input 
                    placeholder="Enter Namecheap Username" 
                    value={settings.namecheap_user}
                    onChange={(e) => setSettings({ ...settings, namecheap_user: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">API Key</label>
                  <Input 
                    type="password"
                    placeholder="Enter API Key" 
                    value={settings.namecheap_key}
                    onChange={(e) => setSettings({ ...settings, namecheap_key: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* Dynadot API */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                  <Globe className="h-3 w-3 text-blue-500" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">Dynadot API</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">API Key</label>
                <Input 
                  type="password"
                  placeholder="Enter Dynadot API Key" 
                  value={settings.dynadot_key}
                  onChange={(e) => setSettings({ ...settings, dynadot_key: e.target.value })}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 mt-4">



                <Info className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  GoDaddy offers free API access for developer accounts. You can obtain these keys at <a href="https://developer.godaddy.com/keys" target="_blank" className="text-blue-400 hover:underline">developer.godaddy.com/keys</a>. Once configured, NEXUS will fetch real-time registrar prices instead of estimates.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card className="bg-zinc-900/40 border-zinc-800/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <Globe className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">Regional Settings</CardTitle>
                  <CardDescription className="text-[10px] font-mono">Preferred currency for valuation reports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-zinc-500">Currency</label>
                <select
                  value={settings.preferred_currency}
                  onChange={(e) => setSettings({ ...settings, preferred_currency: e.target.value })}
                  className="w-full h-10 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-zinc-900/40 border-zinc-800/80">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <Shield className="h-4 w-4" />
                <span className="text-[10px] font-mono">Encrypted at rest</span>
              </div>
              <p className="text-[10px] font-mono text-zinc-600 leading-relaxed">
                Your API credentials are never exposed to the frontend after saving. They are stored securely and used only for server-side intelligence requests.
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-11 gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configurations
          </Button>
        </div>
      </div>
    </div>
  );
}
