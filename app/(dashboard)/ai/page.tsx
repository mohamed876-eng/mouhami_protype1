"use client";

import Link from "next/link";

export default function AIPage() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl text-primary-500 mb-8">منشئ المستندات</h1>

      <div className="bg-white rounded-xl border border-secondary-200 p-5 sm:p-8">
        <div className="w-16 h-16 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-secondary-500 leading-relaxed mb-5">
          قم بإنشاء مسودات المستندات القانونية: وكالة، شكاية، مقال، عقد، إنذار...
        </p>
        <Link
          href="/ai/generator"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-3 rounded-xl hover:bg-primary-600 transition-colors"
        >
          ابدأ الآن ←
        </Link>
      </div>
    </div>
  );
}
