"use client";

import { useState, useRef } from "react";
import { API_BASE } from "@/lib/api";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieSearch } from "@/components/lottie";

interface ArticleRef {
  number: string;
  text: string;
  chapter: string;
  section: string;
  subsection: string;
}

interface Source {
  documentName: string;
  pageNumber: number;
  text: string;
  articles: ArticleRef[];
}

export default function LegalSearchPage() {
  const [question, setQuestion] = useState("");
  const [searching, setSearching] = useState(false);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || searching) return;

    setSearching(true);
    setError("");
    setSources(null);
    setAnswer("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/ai/legal-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ question: question.trim() }),
        signal: controller.signal,
      });

      if (!res.ok) {
        setError("حدث خطأ أثناء البحث");
        setSearching(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("تعذر الاتصال بالخادم");
        setSearching(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const dataMatch = line.match(/^data: (.+)$/m);
          if (!dataMatch) continue;

          try {
            const data = JSON.parse(dataMatch[1]);

            if (data.sources) {
              setSources(data.sources);
            }

            if (data.token) {
              setAnswer((prev) => prev + data.token);
            }

            if (data.answer) {
              setAnswer(data.answer);
            }
          } catch {
            // ignore parse errors on partial chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("تعذر الاتصال بالخادم");
      }
    }
    setSearching(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
          <IconeAnimee icone={lottieSearch} taille={42} title="المكتبة القانونية" />
        </div>
        <h1 className="text-3xl text-primary-500">المكتبة القانونية</h1>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-xl text-primary-500 mb-5">بحث في القوانين المغربية</h2>

          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label className="block mb-2 text-secondary-700">سؤالك القانوني</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="اكتب سؤالك هنا... مثال: ما هي شروط رفع دعوى الطلاق؟"
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl min-h-[120px]"
                disabled={searching}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={searching || !question.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 text-lg"
            >
              {searching ? "جاري البحث..." : <><IconeAnimee icone={lottieSearch} taille={36} />بحث</>}
            </button>
          </form>
        </div>

        {searching || sources ? (
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <h2 className="text-xl text-primary-500 mb-5">نتائج البحث</h2>

            {searching && !sources ? (
              <div className="text-center text-secondary-400 mt-20">
                <div className="flex justify-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
                <p>جاري البحث في المكتبة القانونية...</p>
              </div>
            ) : sources ? (
            <div className="space-y-6">
              {sources.length > 0 ? (
                <div className="space-y-4">
                  {sources.map((source, i) => (
                    <div
                      key={i}
                      className="border border-secondary-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-primary-50 px-4 py-2 flex items-center justify-between">
                        <span className="text-primary-600 font-bold text-sm truncate">
                          {source.documentName}
                        </span>
                        <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full">
                          ص {source.pageNumber}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        {source.articles.length > 0 ? (
                          source.articles.map((a, j) => (
                            <div
                              key={j}
                              className="border border-secondary-100 rounded-lg overflow-hidden"
                            >
                              {(a.section || a.chapter || a.subsection) && (
                                <div className="flex flex-wrap items-center gap-1 px-3 pt-2">
                                  {a.section && (
                                    <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                                      {a.section}
                                    </span>
                                  )}
                                  {a.chapter && (
                                    <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                                      {a.chapter}
                                    </span>
                                  )}
                                  {a.subsection && (
                                    <span className="text-purple-600 font-bold text-[11px] bg-purple-50 px-2 py-0.5 rounded">
                                      {a.subsection}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="px-3 py-2">
                                <span className="text-blue-600 font-bold text-sm">
                                  المادة {a.number}
                                </span>
                                <p className="text-secondary-700 leading-relaxed mt-1 text-sm">
                                  {a.text}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-secondary-400 text-sm">
                            (لم يتم استخراج مواد من هذا المصدر)
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="border-t border-secondary-200 pt-4">
                <span className="text-primary-500 font-bold text-sm block mb-2">
                  الشرح
                </span>
                <div className="text-secondary-700 leading-relaxed whitespace-pre-wrap">
                  {answer || (searching ? <span className="text-secondary-400">جاري إنشاء الشرح...</span> : "")}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        ) : null}
      </div>
    </div>
  );
}
