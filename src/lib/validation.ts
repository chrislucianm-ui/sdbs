export function sanitizeInput(text: string): string {
  if (!text) return "";
  // Strip HTML tags to prevent XSS
  return text
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
}

export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  // Strip whitespace, hyphens, parentheses
  const cleaned = phone.replace(/[\s()-]/g, "");
  // E.164 phone number: optional '+' followed by 10 to 15 digits
  return /^\+?[1-9]\d{9,14}$/.test(cleaned);
}

export function validateInquiryInput(data: {
  name: string;
  parentName: string;
  email?: string;
  phone: string;
  grade: string;
  message?: string;
}): { isValid: boolean; error?: string } {
  if (!data.name || data.name.trim().length < 2) {
    return { isValid: false, error: "Student Name must be at least 2 characters long." };
  }
  if (!data.parentName || data.parentName.trim().length < 2) {
    return { isValid: false, error: "Parent/Guardian Name must be at least 2 characters long." };
  }
  if (!data.phone) {
    return { isValid: false, error: "Mobile Number is required." };
  }
  if (!validatePhone(data.phone)) {
    return { isValid: false, error: "Please provide a valid Mobile Number (e.g. +91 8738882912 or 9695779756)." };
  }
  if (data.email && data.email.trim() !== "" && !validateEmail(data.email)) {
    return { isValid: false, error: "Please provide a valid Email Address." };
  }
  if (!data.grade || data.grade.trim() === "") {
    return { isValid: false, error: "Class applying for is required." };
  }
  return { isValid: true };
}

export function validatePopupInput(data: {
  type: string;
  imageUrl?: string;
  heading?: string;
  message?: string;
}): { isValid: boolean; error?: string } {
  const validTypes = ["image", "emergency"];
  if (!validTypes.includes(data.type)) {
    return { isValid: false, error: "Invalid popup type selected." };
  }

  if (data.type === "image" && !data.imageUrl) {
    return { isValid: false, error: "Popup image is required." };
  }

  if (data.type === "emergency") {
    if (!data.heading || data.heading.trim().length === 0) {
      return { isValid: false, error: "Emergency notice heading is required." };
    }
    if (!data.message || data.message.trim().length === 0) {
      return { isValid: false, error: "Emergency notice message is required." };
    }
  }

  return { isValid: true };
}
