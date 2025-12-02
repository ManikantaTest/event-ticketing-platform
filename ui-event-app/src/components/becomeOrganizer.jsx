import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUserRole } from "../redux/slices/authSlice";

const BecomeOrganizer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    orgName: "",
    orgEmail: "",
    phone: "",
    orgDescription: "",
  });
  const [errors, setErrors] = useState({
    orgName: "",
    orgEmail: "",
    phone: "",
    orgDescription: "",
  });

  const isFormValid =
    !errors.orgName &&
    !errors.orgEmail &&
    !errors.phone &&
    !errors.orgDescription &&
    formData.orgName &&
    formData.orgEmail &&
    formData.phone &&
    formData.orgDescription;

  const validateOrgName = (value) => {
    if (!value.trim()) return "Organization name is required";
    if (value.trim().length < 3) return "Must be at least 3 characters";
    return "";
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Email is required";
    if (!emailRegex.test(value)) return "Enter a valid email";
    return "";
  };

  // Indian phone validation (+91 or 10 digits)
  const validatePhone = (value) => {
    const phoneRegex = /^(\+91)?\s?\d{10}$/;
    if (!value.trim()) return "Phone number is required";
    if (!phoneRegex.test(value)) return "Enter a valid 10-digit number";
    return "";
  };

  const validateDescription = (value) => {
    if (!value.trim()) return "Description is required";
    if (value.trim().length < 20)
      return "Description must be at least 20 characters";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    let err = "";

    if (name === "orgName") err = validateOrgName(value);
    if (name === "orgEmail") err = validateEmail(value);
    if (name === "phone") err = validatePhone(value);
    if (name === "orgDescription") err = validateDescription(value);

    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserRole(formData)).unwrap();
      navigate("/dashboard");
    } catch (error) {}
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 py-10"
      style={{
        background:
          "radial-gradient(circle at top left, #e8eeff 0%, #f9fbff 40%, #ffffff 100%)",
      }}
    >
      <div className="w-full max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Become an <span className="text-indigo-600">Organizer</span>
          </h1>
          <p className="mt-3 text-gray-600 text-base max-w-md mx-auto">
            Launch your journey as an event organizer and start hosting amazing
            experiences.
          </p>
        </div>

        {/* FORM WRAPPER */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-200 rounded-3xl p-10 transition-all">
          <form className="space-y-7">
            {/* ORG NAME */}
            <div className="relative">
              <label
                htmlFor="org-name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Organization Name
              </label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                required
                placeholder="Your organization name"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm
                       focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none 
                       transition-all text-sm"
              />
              {errors.orgName && (
                <p className="text-red-500 text-xs mt-1">{errors.orgName}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="orgEmail"
                name="orgEmail"
                value={formData.orgEmail}
                onChange={handleChange}
                required
                placeholder="organizer@example.com"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm
                       focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none 
                       transition-all text-sm"
              />
              {errors.orgEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.orgEmail}</p>
              )}
            </div>

            {/* PHONE */}
            <div className="relative">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm
                       focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none 
                       transition-all text-sm"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label
                htmlFor="orgDescription"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Organization Description
              </label>
              <textarea
                id="orgDescription"
                name="orgDescription"
                rows="4"
                required
                value={formData.orgDescription}
                onChange={handleChange}
                placeholder="Tell us about your organization and the events you plan to host"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm
                       focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none
                       transition-all text-sm resize-none"
              ></textarea>
              {errors.orgDescription && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.orgDescription}
                </p>
              )}
            </div>

            {/* DIVIDER */}
            <hr className="border-gray-200" />

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-white px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 
                       border border-gray-300 shadow-sm hover:bg-gray-100 active:scale-95 
                       transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isFormValid}
                onClick={handleSubmit}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all
                  ${
                    isFormValid
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default BecomeOrganizer;
