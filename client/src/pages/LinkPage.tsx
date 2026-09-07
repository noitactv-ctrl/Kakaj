import { useEffect, useState } from "react";
import { Check, Copy, Link2, Loader2, Send, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type LinkTokenResponse = {
  token: string | null;
  createdAt?: string;
};

type CreditBotPublicStatus = {
  enabled: boolean;
  configured: boolean;
  botName: string;
  botUrl: string;
};

export default function LinkPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery<LinkTokenResponse>({
    queryKey: ["/api/telegram/link-token"],
  });
  const { data: botStatus } = useQuery<CreditBotPublicStatus>({
    queryKey: ["/api/telegram/status"],
  });

  const token = data?.token ?? null;
  const linkLive = botStatus?.enabled === true && botStatus.configured === true && Boolean(token);
  const botName = botStatus?.botName || "Telegram rewards bot";
  const copyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast({ title: "Copied", description: "Now send the number to the turtlecc.xyz rewards bot." });
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
          Your private 16-digit account number is created automatically. Copy it and send it to the rewards bot.
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="pixel-kicker">YOUR 16-DIGIT ACCOUNT NUMBER</p>
          <span className={`inline-flex items-center gap-2 border-[2px] px-2 py-1 text-[10px] font-black shadow-[2px_2px_0_#0a1021] ${linkLive ? "border-[#0a1021] bg-[#43b94e] text-[#fff4dc]" : "border-[#0a1021] bg-[#ee292b] text-white"}`}>
            <span className={`h-2 w-2 rounded-full ${linkLive ? "bg-[#fff4dc]" : "bg-white"}`} />
            LINK {linkLive ? "LIVE" : "NOT LIVE"}
          </span>
        </div>
        <div className="space-y-2">
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

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            disabled={!linkLive || !botStatus?.botUrl}
            className="min-h-11 flex-1 gap-2 border-[3px] border-[#0a1021] bg-[#5f90ef] text-white shadow-[3px_3px_0_#0a1021] hover:bg-[#75a2ff]"
            data-testid="button-go-to-telegram-bot"
          >
            <a href={botStatus?.botUrl || "#"} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Go to {botName}
            </a>
          </Button>
        </div>
      </section>

      <section className="border-[3px] border-[#183c9d] bg-[#5f90ef] p-4 text-[#16100c] shadow-[4px_4px_0_#0a1021]">
        <p className="pixel-kicker !text-[#fff4dc]">NEXT STEP</p>
        <p className="mt-2 text-sm font-bold">
          Open {botName}, press /start, then send the 16-digit number above.
        </p>
        <p className="mt-2 text-xs font-medium">
          The bot checks your Telegram name and main-channel membership before each reward. Changing your Telegram name restarts the 24-hour timer.
        </p>
      </section>
    </div>
  );
}