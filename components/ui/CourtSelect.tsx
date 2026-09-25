"use client";

import {
  COURT_TYPE_LABELS,
  CUSTOM_TRIBUNAL_VALUE,
  JUDICIAL_REGIONS,
  type TribunalType,
} from "@/lib/judicial-courts";

interface CourtSelectProps {
  regionId: string;
  tribunal: string;
  customTribunal: string;
  onRegionChange: (value: string) => void;
  onTribunalChange: (value: string) => void;
  onCustomTribunalChange: (value: string) => void;
  required?: boolean;
}

const tribunalTypes: TribunalType[] = ["NORMAL", "COMMERCIAL", "ADMIN"];

export default function CourtSelect({
  regionId,
  tribunal,
  customTribunal,
  onRegionChange,
  onTribunalChange,
  onCustomTribunalChange,
  required = false,
}: CourtSelectProps) {
  const selectedRegion = JUDICIAL_REGIONS.find(
    (region) => String(region.id) === regionId
  );
  const selectedTribunalExists = selectedRegion?.tribunals.some(
    (court) => court.nameAr === tribunal
  );
  const tribunalValue = selectedTribunalExists || !tribunal
    ? tribunal
    : CUSTOM_TRIBUNAL_VALUE;
  const selectedTribunalIsCustom = tribunalValue === CUSTOM_TRIBUNAL_VALUE;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="case-region" className="block text-sm font-medium text-secondary-700 mb-1">
          الجهة القضائية {required ? "*" : ""}
        </label>
        <select
          id="case-region"
          value={regionId}
          onChange={(event) => onRegionChange(event.target.value)}
          required={required}
          className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">اختر الجهة القضائية</option>
          {JUDICIAL_REGIONS.map((region) => (
            <option key={region.id} value={region.id}>
              {region.nameAr}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="case-tribunal" className="block text-sm font-medium text-secondary-700 mb-1">
          المحكمة {required ? "*" : ""}
        </label>
        <select
          id="case-tribunal"
          value={tribunalValue}
          onChange={(event) => onTribunalChange(event.target.value)}
          required={required && Boolean(selectedRegion)}
          className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">
            {selectedRegion ? "اختر المحكمة" : "اختر المحكمة أو اكتبها يدويًا"}
          </option>
          {selectedRegion && tribunalTypes.map((type) => {
            const courts = selectedRegion.tribunals.filter(
              (court) => court.courtType === type
            );
            if (courts.length === 0) return null;
            return (
              <optgroup key={type} label={COURT_TYPE_LABELS[type]}>
                {courts.map((court) => (
                  <option key={court.id} value={court.nameAr}>
                    {court.nameAr}
                  </option>
                ))}
              </optgroup>
            );
          })}
          <option value={CUSTOM_TRIBUNAL_VALUE}>محكمة أخرى (كتابة يدوية)</option>
        </select>
        {selectedTribunalIsCustom && (
          <input
            type="text"
            value={customTribunal}
            onChange={(event) => onCustomTribunalChange(event.target.value)}
            required={required}
            className="w-full mt-2 px-4 py-2.5 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="اكتب اسم المحكمة"
          />
        )}
      </div>
    </div>
  );
}
