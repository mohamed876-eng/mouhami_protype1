"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import IconeAnimee from "@/components/ui/IconeAnimee";
import { lottieDocument } from "@/components/lottie";

const documentTypes = [
  { type: "procuration", nameAr: "الوكالة" },
  { type: "plainte", nameAr: "الشكاية" },
  { type: "memorandum_introductif", nameAr: "المقال الافتتاحي" },
  { type: "contract", nameAr: "عقد" },
  { type: "summons", nameAr: "إنذار" },
  { type: "appeal", nameAr: "استئناف" },
];

interface FieldDef {
  key: string;
  label: string;
  required: boolean;
}

export default function DocumentGeneratorPage() {
  const [selectedType, setSelectedType] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTypeChange = async (type: string) => {
    setSelectedType(type);
    setResult(null);
    if (!type) return;

    try {
      const res = await apiService.get<any>("/ai/templates/" + type);
      if (res.success) {
        const data = res.data.template;
        setFields(data.fields || []);
        const vals: Record<string, string> = {};
        data.fields.forEach((f: FieldDef) => { vals[f.key] = ""; });
        setFormValues(vals);
      }
    } catch {
      setFields([]);
      setFormValues({});
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setGenerating(true);
    setResult(null);

    try {
      const res = await apiService.post<any>("/ai/generate", {
        templateType: selectedType,
        fields: formValues,
      });

      if (res.success) {
        setResult(res.data.result.text);

        const byteChars = atob(res.data.result.docxBase64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.data.result.fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setResult("حدث خطأ في إنشاء المستند.");
      }
    } catch {
      setResult("تعذر الاتصال بالخادم.");
    }
    setGenerating(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] flex items-center justify-center shrink-0">
          <IconeAnimee icone={lottieDocument} taille={42} title="منشئ المستندات" />
        </div>
        <h1 className="text-3xl text-primary-500">منشئ المستندات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-xl text-primary-500 mb-5">اختيار المستند</h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {documentTypes.map((dt) => (
              <button
                key={dt.type}
                onClick={() => handleTypeChange(dt.type)}
                className={`p-4 rounded-xl border text-right transition-all ${
                  selectedType === dt.type
                    ? "border-primary-500 bg-primary-50 text-primary-500"
                    : "border-secondary-200 hover:border-primary-200"
                }`}
              >
                {dt.nameAr}
              </button>
            ))}
          </div>

          {fields.length > 0 && (
            <form onSubmit={handleGenerate} className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block mb-1 text-secondary-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formValues[field.key] || ""}
                    onChange={(e) =>
                      setFormValues({ ...formValues, [field.key]: e.target.value })
                    }
                    placeholder={`أدخل ${field.label}`}
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl"
                    required={field.required}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-primary-500 text-white py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {generating ? "جاري الإنشاء..." : "إنشاء المستند"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-xl text-primary-500 mb-5">معاينة المستند</h2>
          {result ? (
            <pre className="whitespace-pre-wrap leading-relaxed text-secondary-700 font-sans">
              {result}
            </pre>
          ) : (
            <p className="text-secondary-400 text-center mt-20">
              اختر نوع المستند واملأ المعلومات ثم انقر "إنشاء المستند"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
