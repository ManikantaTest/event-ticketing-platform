import TextField from "@mui/material/TextField";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const categories = [
  "Music",
  "Sports",
  "Workshops",
  "Conferences",
  "Festivals",
  "Tech & Innovation",
  "Charity",
  "Comedy",
  "Exhibitions",
];
const recurrences = ["single", "multi-day", "weekly"];
const ageLimits = [0, 5, 12, 16, 18, 21];
const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada"];
const ratings = [5, 4, 3, 2, 1];

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  selected,
  setSelected,
  isCategoryFilter = false,
  locationActive,
}) {
  let tabs = [
    "Date Range",
    "Time Range",
    "Recurrence",
    "Category",
    "Age Limit",
    "Language",
    "Rating",
  ];
  tabs = isCategoryFilter ? tabs.filter((t) => t !== "Category") : tabs;
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [localSelected, setLocalSelected] = useState(selected);

  // sync local state when modal opens
  useEffect(() => {
    if (isOpen) setLocalSelected(selected);
  }, [isOpen, selected]);

  const toggleMultiSelect = (field, value) => {
    setLocalSelected((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const setSingleSelect = (field, value) => {
    setLocalSelected((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    const initialData = {
      recurrence: "",
      category: [],
      ageLimit: null,
      language: [],
      rating: null,
      location: locationActive,
      dateRange: { start: "", end: "" },
      timeRange: { start: "", end: "" },
    };
    setLocalSelected(initialData);
    setSelected(initialData);
    onApply(initialData);
    onClose();
  };

  const handleApply = () => {
    setSelected(localSelected);
    if (onApply) onApply(localSelected);
    onClose();
  };

  function Section({ label, children }) {
    return (
      <div className="mb-8">
        <h3 className="text-base font-semibold mb-3">{label}</h3>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="
    relative w-full 
    max-w-full sm:max-w-3xl md:max-w-5xl
    h-[75vh] sm:h-[80vh]
    bg-white 
    rounded-2xl sm:rounded-3xl 
    shadow-2xl flex overflow-hidden
  "
            onClick={(e) => e.stopPropagation()}
          >
            {/* SIDEBAR */}
            <div
              className="
    w-1/3 sm:w-1/4 
    min-w-[130px] sm:min-w-[180px] 
    bg-white border-r border-gray-200 
    flex flex-col 
    py-4 sm:py-6 
    px-2 sm:px-3
  "
            >
              <div className="px-2 sm:px-3 mb-3 sm:mb-5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Filters
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Refine events by type, time and more.
                </p>
              </div>

              <div className="flex flex-col gap-1 mt-1 sm:mt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
            w-full text-left flex items-center gap-2 
            py-2 sm:py-2.5 px-3 sm:px-4 
            rounded-lg sm:rounded-xl 
            text-xs sm:text-sm
            transition-all
            ${
              activeTab === tab
                ? "bg-pink-50 text-pink-700 font-semibold border border-pink-200 shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex flex-col flex-1 overflow-hidden bg-white">
              {/* HEADER */}
              <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-2 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {activeTab}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Choose options to fine-tune your search.
                </p>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
                {/* RECURRENCE */}
                {activeTab === "Recurrence" && (
                  <Section label="Recurrence">
                    <div className="flex flex-col gap-3">
                      {recurrences.map((r) => (
                        <label
                          key={r}
                          className={`
                  flex items-center justify-between gap-2 sm:gap-3 
                  rounded-lg sm:rounded-xl border 
                  px-3 sm:px-4 py-2.5 sm:py-3 
                  cursor-pointer transition-all 
                  ${
                    localSelected.recurrence === r
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }
                `}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="radio"
                              name="recurrence"
                              checked={localSelected.recurrence === r}
                              onChange={() => setSingleSelect("recurrence", r)}
                              className="h-4 w-4 sm:h-5 sm:w-5 accent-pink-600"
                            />
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">
                              {r}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Section>
                )}

                {/* CATEGORY */}
                {activeTab === "Category" && (
                  <Section label="Category">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] pr-1">
                      {categories.map((c) => (
                        <label
                          key={c}
                          className={`
                  flex items-center justify-between gap-2 sm:gap-3 
                  rounded-lg sm:rounded-xl border 
                  px-3 sm:px-4 py-2.5 sm:py-3 
                  cursor-pointer transition-all 
                  ${
                    localSelected.category.includes(c)
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }
                `}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="checkbox"
                              checked={localSelected.category.includes(c)}
                              onChange={() => toggleMultiSelect("category", c)}
                              className="h-4 w-4 accent-pink-600"
                            />
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">
                              {c}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Section>
                )}

                {/* AGE LIMIT */}
                {activeTab === "Age Limit" && (
                  <Section label="Age Limit">
                    <div className="flex flex-col gap-3">
                      {ageLimits.map((a) => (
                        <label
                          key={a}
                          className={`
                  flex items-center justify-between gap-2 sm:gap-3 
                  rounded-lg sm:rounded-xl border 
                  px-3 sm:px-4 py-2.5 sm:py-3 
                  cursor-pointer transition-all 
                  ${
                    localSelected.ageLimit === a
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }
                `}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="radio"
                              name="ageLimit"
                              checked={localSelected.ageLimit === a}
                              onChange={() => setSingleSelect("ageLimit", a)}
                              className="h-4 w-4 sm:h-5 sm:w-5 accent-pink-600"
                            />
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">
                              {a}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Section>
                )}

                {/* LANGUAGE */}
                {activeTab === "Language" && (
                  <Section label="Languages">
                    <div className="flex flex-wrap gap-2">
                      {languages.map((l) => {
                        const selected = localSelected.language.includes(l);
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => toggleMultiSelect("language", l)}
                            className={`
                    px-2.5 sm:px-3 py-1.5 
                    rounded-full 
                    text-xs sm:text-sm 
                    border transition-all 
                    ${
                      selected
                        ? "bg-pink-100 border-pink-400 text-pink-700 font-semibold"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                    }
                  `}
                          >
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* RATING */}
                {activeTab === "Rating" && (
                  <Section label="Rating">
                    <div className="flex flex-col gap-3">
                      {ratings.map((r) => (
                        <label
                          key={r}
                          className={`
                  flex items-center justify-between gap-2 sm:gap-3 
                  rounded-lg sm:rounded-xl border 
                  px-3 sm:px-4 py-2.5 sm:py-3 
                  cursor-pointer transition-all 
                  ${
                    localSelected.rating === r
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }
                `}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="radio"
                              name="rating"
                              checked={localSelected.rating === r}
                              onChange={() => setSingleSelect("rating", r)}
                              className="h-4 w-4 sm:h-5 sm:w-5 accent-pink-600"
                            />
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">
                              ⭐ {r}+
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Section>
                )}

                {/* DATE RANGE */}
                {activeTab === "Date Range" && (
                  <Section label="Date Range">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <DatePicker
                          label="Start Date"
                          value={
                            localSelected.dateRange.start
                              ? new Date(localSelected.dateRange.start)
                              : null
                          }
                          onChange={(newDate) =>
                            setLocalSelected((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                start: newDate ? newDate.toISOString() : null,
                              },
                            }))
                          }
                          renderInput={(params) => (
                            <TextField {...params} size="small" />
                          )}
                        />
                        <span className="font-semibold text-gray-500">to</span>
                        <DatePicker
                          label="End Date"
                          value={
                            localSelected.dateRange.end
                              ? new Date(localSelected.dateRange.end)
                              : null
                          }
                          onChange={(newDate) =>
                            setLocalSelected((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                end: newDate ? newDate.toISOString() : null,
                              },
                            }))
                          }
                          renderInput={(params) => (
                            <TextField {...params} size="small" />
                          )}
                        />
                      </div>
                    </LocalizationProvider>
                  </Section>
                )}

                {/* TIME RANGE */}
                {activeTab === "Time Range" && (
                  <Section label="Time Range">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <TimePicker
                          label="Start Time"
                          value={
                            localSelected.timeRange.start
                              ? new Date(
                                  `1970-01-01T${localSelected.timeRange.start}`
                                )
                              : null
                          }
                          onChange={(newTime) => {
                            const t = newTime
                              ? newTime.toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : null;

                            setLocalSelected((prev) => ({
                              ...prev,
                              timeRange: { ...prev.timeRange, start: t },
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField {...params} size="small" />
                          )}
                        />

                        <span className="font-semibold text-gray-500">to</span>

                        <TimePicker
                          label="End Time"
                          value={
                            localSelected.timeRange.end
                              ? new Date(
                                  `1970-01-01T${localSelected.timeRange.end}`
                                )
                              : null
                          }
                          onChange={(newTime) => {
                            const t = newTime
                              ? newTime.toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : null;

                            setLocalSelected((prev) => ({
                              ...prev,
                              timeRange: { ...prev.timeRange, end: t },
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField {...params} size="small" />
                          )}
                        />
                      </div>
                    </LocalizationProvider>
                  </Section>
                )}
              </div>

              {/* FOOTER */}
              <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200 bg-white">
                <button
                  onClick={handleClear}
                  className="text-gray-700 text-xs sm:text-sm font-medium underline underline-offset-4 hover:text-gray-900"
                >
                  Clear filters
                </button>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={onClose}
                    className="
            px-3 sm:px-5 
            py-1.5 sm:py-2.5 
            rounded-lg border border-gray-300 
            bg-white text-gray-700 
            text-xs sm:text-sm 
            font-medium 
            hover:bg-gray-100
          "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleApply}
                    className="
            px-5 sm:px-8 
            py-1.5 sm:py-2.5 
            rounded-lg 
            bg-gradient-to-r from-pink-500 to-rose-500 
            text-white 
            text-xs sm:text-sm font-semibold shadow 
            hover:opacity-90
          "
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="
      absolute top-2 sm:top-4 right-2 sm:right-4 
      p-1.5 sm:p-2 
      rounded-full 
      bg-white shadow 
      text-gray-500 
      hover:text-gray-800 hover:bg-gray-100
    "
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
