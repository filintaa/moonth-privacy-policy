/**
 * Moonth — Baby Age Calculator & Interactive Scripts
 * Accurate calendar month calculation with short-month clamping & leap year support.
 */

// Helpers for calendar calculation
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year, monthIndex) {
  // monthIndex: 0-11
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[monthIndex];
}

/**
 * Calculates completed calendar months and remaining days.
 * Clamps to month-end when the birth day exceeds the month length (e.g. Jan 31 -> Feb 28).
 */
function calculateCalendarAge(birthDate, targetDate = new Date()) {
  const bY = birthDate.getFullYear();
  const bM = birthDate.getMonth(); // 0-11
  const bD = birthDate.getDate();

  const tY = targetDate.getFullYear();
  const tM = targetDate.getMonth();
  const tD = targetDate.getDate();

  // Normalize midnight
  const bTime = new Date(bY, bM, bD).getTime();
  const tTime = new Date(tY, tM, tD).getTime();

  if (bTime > tTime) {
    return { isFuture: true };
  }

  // Calculate elapsed months
  let months = (tY - bY) * 12 + (tM - bM);

  // Check if current month anniversary has occurred
  // Milestone date for this target month
  const daysInCurrentMonth = getDaysInMonth(tY, tM);
  const currentMonthAnniversaryDay = Math.min(bD, daysInCurrentMonth);

  if (tD < currentMonthAnniversaryDay) {
    months -= 1;
  }

  // Find the exact date of the latest month-iversary
  const milestoneYear = bY + Math.floor((bM + months) / 12);
  const milestoneMonth = (bM + months) % 12;
  const milestoneDaysInMonth = getDaysInMonth(milestoneYear, milestoneMonth);
  const milestoneDay = Math.min(bD, milestoneDaysInMonth);
  const lastMilestoneDate = new Date(milestoneYear, milestoneMonth, milestoneDay);

  // Remaining days since last milestone
  const msDiff = tTime - lastMilestoneDate.getTime();
  const days = Math.round(msDiff / (1000 * 60 * 60 * 24));

  // Next milestone date
  const nextMonths = months + 1;
  const nextYear = bY + Math.floor((bM + nextMonths) / 12);
  const nextMonth = (bM + nextMonths) % 12;
  const nextDaysInMonth = getDaysInMonth(nextYear, nextMonth);
  const nextMilestoneDay = Math.min(bD, nextDaysInMonth);
  const nextMilestoneDate = new Date(nextYear, nextMonth, nextMilestoneDay);

  const daysToNext = Math.round((nextMilestoneDate.getTime() - tTime) / (1000 * 60 * 60 * 24));

  return {
    isFuture: false,
    months,
    days,
    daysToNext,
    nextMonthNumber: nextMonths
  };
}

// Format the calculated age for display
function updateAgeDisplay() {
  const input = document.getElementById("birth");
  const bigOut = document.getElementById("calcBig");
  const subOut = document.getElementById("calcSub");

  if (!input || !bigOut || !subOut) return;

  const rawValue = input.value;
  if (!rawValue) {
    bigOut.textContent = "—";
    subOut.textContent = "Pick a birth date to see the age";
    return;
  }

  // Parse YYYY-MM-DD safely
  const [y, m, d] = rawValue.split("-").map(Number);
  const birthDate = new Date(y, m - 1, d);
  const result = calculateCalendarAge(birthDate);

  if (result.isFuture) {
    bigOut.textContent = "Future Date";
    subOut.textContent = "Birth date cannot be in the future.";
    return;
  }

  const { months, days, daysToNext, nextMonthNumber } = result;

  const monthLabel = months === 1 ? "1 month" : `${months} months`;
  const dayLabel = days === 1 ? "1 day" : `${days} days`;

  if (months === 0 && days === 0) {
    bigOut.textContent = "Born today!";
    subOut.textContent = `Welcome to the world · 1 month milestone in ${daysToNext} days`;
    return;
  }

  bigOut.textContent = `${monthLabel} ${dayLabel}`;

  if (daysToNext === 0) {
    subOut.textContent = `🎉 Today is the month ${months} celebration!`;
  } else {
    subOut.textContent = `Month ${nextMonthNumber} milestone in ${daysToNext} ${daysToNext === 1 ? "day" : "days"}`;
  }
}

// Initialize Interactive Calculator
const birthInput = document.getElementById("birth");
if (birthInput) {
  // Pre-fill with a date ~6 months and 15 days ago so the page has instant live preview
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() - 6);
  defaultDate.setDate(defaultDate.getDate() - 15);
  const yyyy = defaultDate.getFullYear();
  const mm = String(defaultDate.getMonth() + 1).padStart(2, "0");
  const dd = String(defaultDate.getDate()).padStart(2, "0");
  birthInput.value = `${yyyy}-${mm}-${dd}`;
  birthInput.max = new Date().toISOString().split("T")[0];

  birthInput.addEventListener("input", updateAgeDisplay);
  birthInput.addEventListener("change", updateAgeDisplay);
  updateAgeDisplay();
}

// Intersection Observer for .reveal animations
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = document.querySelectorAll(".reveal");

if (prefersReduced || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  reveals.forEach((el) => observer.observe(el));
}

// Footer Year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = String(new Date().getFullYear());
}
