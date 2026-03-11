import { useEffect, useRef, useState } from "react";
import useAiChat from "../../hooks/useAiChat";
import { getFlaskStocks, analyzeFinances, getInvestmentRecs, getMyGoalPlan } from "../../api/api";
import "./ChatAi.css";

const WELCOME = {
    role: "ai",
    content:
        "Hi! I can help with stock predictions, financial analysis, and investment advice.\n\nTry asking about stocks, your finances, or where to invest.",
};

function detectIntent(msg) {
    const l = msg.toLowerCase();
    if (/stocks?|market|prediction|ticker|top\s*\d+/.test(l)) return "stocks";
    if (/invest|portfolio|allocat|put\s+\$?\d+/.test(l)) return "invest";
    if (/analy[sz]|financ|budget|saving|income|expense|overview/.test(l)) return "analyze";
    return "chat";
}

function parseNumber(msg) {
    const m = msg.match(/\$?([\d,]+(?:\.\d+)?)/);
    return m ? parseFloat(m[1].replace(/,/g, "")) : null;
}

function fmtStocks(data) {
    if (!data?.stocks?.length) return "No stock data available yet. Pipeline may still be running.";
    let out = `Top ${data.count} Stocks`;
    if (data.pipeline_last_run) out += ` (${data.pipeline_last_run})`;
    out += ":\n\n";
    data.stocks.forEach((s, i) => {
        out += `${i + 1}. ${s.symbol} - ${s.name}`;
        if (s.predicted_close) {
            const sign = s.predicted_gain_pct > 0 ? "+" : "";
            out += `\n   $${s.close} -> $${s.predicted_close} (${sign}${s.predicted_gain_pct}%)`;
        } else {
            out += ` [$${s.close}]`;
        }
        out += "\n";
    });
    return out;
}

function fmtAnalysis(data) {
    const a = data.analysis;
    const sa = data.savings_advice;
    const inv = data.investment_recommendations;
    let out = "Financial Analysis:\n\n";
    out += `Income: $${a.monthly_income.toLocaleString()}\n`;
    out += `Expenses: $${a.total_expenses.toLocaleString()}\n`;
    out += `Disposable: $${a.disposable_income.toLocaleString()}\n`;
    out += `Savings Rate: ${a.savings_rate}%\n`;
    if (a.budget_warnings?.length) {
        out += "\nWarnings:\n";
        a.budget_warnings.forEach((w) => { out += `- ${w.category}: $${w.amount}\n`; });
    }
    if (sa?.message) out += `\n${sa.message}\n`;
    if (sa?.action_plan) out += `Action: ${sa.action_plan}\n`;
    if (sa?.recommended_allocation) {
        out += `\nRecommended Split:\n`;
        out += `  Savings: $${sa.recommended_allocation.savings}\n`;
        out += `  Investments: $${sa.recommended_allocation.investments}\n`;
        out += `  Short-term: $${sa.recommended_allocation.short_term}\n`;
    }
    if (inv?.recommendations?.length) {
        out += `\nTop Investments:\n`;
        inv.recommendations.slice(0, 5).forEach((r) => {
            out += `  ${r.rank}. ${r.symbol} (${r.name}) - $${r.monthly_investment}/mo\n`;
        });
    }
    return out;
}

function fmtInvestments(data) {
    const inv = data.investments;
    let out = `Investment Plan ($${inv.total_monthly_investment}/mo):\n\n`;
    if (inv.recommendations?.length) {
        inv.recommendations.forEach((r) => {
            out += `${r.rank}. ${r.symbol} (${r.name}) - $${r.monthly_investment}/mo\n`;
        });
    }
    if (inv.investment_tips?.length) {
        out += "\nTips:\n";
        inv.investment_tips.slice(0, 3).forEach((t) => { out += `- ${t}\n`; });
    }
    return out;
}

function ChatAi() {
    const { status, loading, fetchStatus, approveConsent, sendMessage } = useAiChat();
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([WELCOME]);
    const [busy, setBusy] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => { fetchStatus().catch(() => {}); }, []);
    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const reply = (content) => setMessages((m) => [...m, { role: "ai", content }]);

    const handle = async (msg) => {
        const trimmed = (msg || "").trim();
        if (!trimmed || busy) return;
        setMessages((m) => [...m, { role: "user", content: trimmed }]);
        setText("");
        setBusy(true);
        try {
            const intent = detectIntent(trimmed);
            if (intent === "stocks") {
                const limit = Math.min(Math.max(parseInt(parseNumber(trimmed))));
                const data = await getFlaskStocks(limit);
                reply(fmtStocks(data));
            } else if (intent === "invest") {
                const amount = parseNumber(trimmed);
                const data = await getInvestmentRecs({ disposable_income: amount });
                reply(fmtInvestments(data));
            } else if (intent === "analyze") {
                const planRes = await getMyGoalPlan();
                const plan = planRes?.plan;
                if (plan) {
                    const data = await analyzeFinances({
                        monthly_income: plan.monthlyIncome,
                        fixed_expenses: plan.fixedExpensesMonthly,
                        variable_expenses: plan.monthlyIncome - plan.fixedExpensesMonthly - plan.targetSavingsMonthly,
                        monthly_savings_goal: plan.targetSavingsMonthly,
                    });
                    reply(data.status === "success" ? fmtAnalysis(data) : (data.message ));
                } else {
                    reply("No goal plan found. Create one first in your profile.");
                }
            } else {
                const data = await sendMessage({ message: trimmed, source: "mixed", days: 30 });
                reply(data.reply || "No response.");
            }
        } catch {
            reply("Something went wrong. Try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="ai-page">
            <div className="ai-shell">
                <div className="ai-header">
                    <div className="ai-title">
                        <h2>AI Financial Advisor</h2>
                        <p>Stocks, spending analysis, and investment advice</p>
                    </div>
                </div>

                {!status ? (
                    <div className="ai-consent">
                        <div className="ai-consent-card">Loading...</div>
                    </div>
                ) : !status.aiConsent ? (
                    <div className="ai-consent">
                        <div className="ai-consent-card">
                            <h3>AI Permission</h3>
                            <p>
                                Allow us to analyze your transactions and goals to give
                                personalized advice. You can revoke this later.
                            </p>
                            <div className="ai-consent-actions">
                                <button className="ai-btn primary" onClick={approveConsent} disabled={loading}>
                                    I Agree
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="ai-chat" ref={chatRef}>
                            {messages.map((m, i) => (
                                <div key={i} className={`ai-bubble-row ${m.role}`}>
                                    <div className={`ai-bubble ${m.role}`}>{m.content}</div>
                                </div>
                            ))}
                            {busy && (
                                <div className="ai-bubble-row ai">
                                    <div className="ai-bubble ai typing">Thinking...</div>
                                </div>
                            )}
                        </div>

                        <div className="ai-actions">
                            <button className="ai-action-btn" onClick={() => handle("show top stocks")} disabled={busy}>
                                Stocks
                            </button>
                            <button className="ai-action-btn" onClick={() => handle("analyze my finances")} disabled={busy}>
                                Analysis
                            </button>
                            <button className="ai-action-btn" onClick={() => handle("invest $500")} disabled={busy}>
                                Invest
                            </button>
                        </div>

                        <div className="ai-composer">
                            <div className="ai-composer-box">
                                <textarea
                                    className="ai-textarea"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handle(text);
                                        }
                                    }}
                                    placeholder="Ask about stocks, finances, or investments..."
                                    disabled={busy}
                                />
                                <button className="ai-send" onClick={() => handle(text)} disabled={busy || !text.trim()}>
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ChatAi;
