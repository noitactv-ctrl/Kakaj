import { useEffect, useState } from "react";
import { Check, Copy, Link2, Loader2, RefreshCw, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LinkTokenResponse = {
  token: string | null;
  createdAt?: string;
};

export default function LinkPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { data, isLoading, refetch } = useQuery<LinkTokenResponse>({
    queryKey: ["/api/telegram/link-token"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/telegram/link-token", {});
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Could not generate account number");
      }
      return response.json() as Promise<{ token: string; createdAt: string }>;
    },
    onSuccess: (result) => {
      refetch();
      setCopied(false);
      toast({ title: "Account number generated", description: "Copy it and send it to the rewards bot." });
    },
    onError: (error: Error) => toast({ title: "Could not generate number", description: error.message, variant: "destructive" }),
  });

  const token = data?.token ?? null;
  const copyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast({ title: "Copied", description: "Now send the number to the beastcc.xyz rewards bot." });
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: "Copy failed", description: "Select the number and copy it manually.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!token) return;
    setCopied(false);
  }, [token]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="pixel-kicker">TELEGRAM LINK</p>
        <h1 className="pixel-title mt-2 flex items-center gap-3">
          <Link2 className="h-6 w-6 text-[#ffe177]" />
          Link your rewards account
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Generate a private 16-digit account number, copy it, and send it to the beastcc.xyz rewards bot.
        </p>
      </div>

      <section className="pixel-panel space-y-5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-[#0a1021] bg-[#5f90ef] text-[#fff4dc] shadow-[2px_2px_0_#0a1021]">
            <Send className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-black text-white">How it works</h2>
            <p className="text-xs leading-relaxed text-white/55">
              This number links your site account to your Telegram account. Do not share it with anyone else.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="pixel-kicker">YOUR 16-DIGIT ACCOUNT NUMBER</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex min-h-12 flex-1 items-center justify-center border-[3px] border-[#0a1021] bg-[#fff4dc] px-4 text-center font-mono text-lg font-black tracking-[0.18em] text-[#16100c] shadow-[3px_3px_0_#0a1021]">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : token ?? "— — — — — — — —"}
            </div>
            <Button
              onClick={copyToken}
              disabled={!token}
              className="min-h-12 gap-2 border-[3px] border-[#0a1021] bg-[#43b94e] text-[#fff4dc] shadow-[3px_3px_0_#0a1021] hover:bg-[#57cc61]"
              data-testid="button-copy-link-token"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          variant="outline"
          className="w-full gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
          data-testid="button-generate-link-token"
        >
          {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {token ? "Generate a new number" : "Generate account number"}
        </Button>
      </section>

      <section className="border-[3px] border-[#183c9d] bg-[#5f90ef] p-4 text-[#16100c] shadow-[4px_4px_0_#0a1021]">
        <p className="pixel-kicker !text-[#fff4dc]">NEXT STEP</p>
        <p className="mt-2 text-sm font-bold">
          Open the Telegram bot, press /start, then send the 16-digit number above.
        </p>
        <p className="mt-2 text-xs font-medium">
          The bot checks your Telegram name and main-channel membership before each reward. Changing your Telegram name restarts the 24-hour timer.
        </p>
      </section>
    </div>
  );
}